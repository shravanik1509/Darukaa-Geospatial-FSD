import json
import uuid

from fastapi import HTTPException, status
from geoalchemy2.functions import ST_AsGeoJSON
from sqlalchemy import desc, text
from sqlalchemy.orm import Session

from app.models.analytics import SiteAnalytics
from app.models.project import Project
from app.models.site import Site
from app.schemas.site import (
    GeoJSONFeature,
    GeoJSONFeatureCollection,
    SiteCreate,
    SiteResponse,
    SiteUpdate,
)
from app.utils.geo import (
    calculate_centroid,
    geoalchemy_to_geojson,
    geojson_to_shapely,
    shapely_to_geoalchemy,
)


class SiteService:
    @staticmethod
    def _get_latest_metrics(db: Session, site_id: uuid.UUID) -> dict[str, float | None]:
        latest = (
            db.query(SiteAnalytics)
            .filter(SiteAnalytics.site_id == site_id)
            .order_by(desc(SiteAnalytics.recorded_at))
            .first()
        )
        if not latest:
            return {"carbon": None, "biodiversity": None, "vegetation": None}
        return {
            "carbon": latest.carbon_value,
            "biodiversity": latest.biodiversity_value,
            "vegetation": latest.vegetation_value,
        }

    @staticmethod
    def _build_site_response(
        db: Session, site: Site, project_name: str | None = None
    ) -> SiteResponse:
        metrics = SiteService._get_latest_metrics(db, site.id)
        geojson_geom = geoalchemy_to_geojson(site.geometry)

        # In case GeoAlchemy2 returned raw WKB string or dict
        if not geojson_geom or not isinstance(geojson_geom, dict):
            # Query GeoJSON directly from PostGIS
            geojson_str = db.query(ST_AsGeoJSON(site.geometry)).scalar()
            geojson_geom = json.loads(geojson_str) if geojson_str else {}

        return SiteResponse(
            id=site.id,
            project_id=site.project_id,
            project_name=project_name or (site.project.name if site.project else None),
            name=site.name,
            description=site.description,
            ecosystem_type=site.ecosystem_type,
            area_hectares=round(site.area_hectares, 2),
            center_latitude=site.center_latitude,
            center_longitude=site.center_longitude,
            geometry=geojson_geom,
            latest_carbon=metrics["carbon"],
            latest_biodiversity=metrics["biodiversity"],
            latest_vegetation=metrics["vegetation"],
            created_at=site.created_at,
            updated_at=site.updated_at,
        )

    @staticmethod
    def list_sites(
        db: Session,
        project_id: uuid.UUID | None = None,
        skip: int = 0,
        limit: int = 100,
    ) -> list[SiteResponse]:
        query = db.query(Site)
        if project_id:
            query = query.filter(Site.project_id == project_id)
        sites = query.order_by(Site.created_at.desc()).offset(skip).limit(limit).all()
        return [SiteService._build_site_response(db, s) for s in sites]

    @staticmethod
    def list_sites_as_geojson(
        db: Session,
        project_id: uuid.UUID | None = None,
    ) -> GeoJSONFeatureCollection:
        sites = SiteService.list_sites(db, project_id=project_id, limit=500)
        features = []
        for s in sites:
            feature = GeoJSONFeature(
                id=str(s.id),
                geometry=s.geometry,
                properties={
                    "id": str(s.id),
                    "project_id": str(s.project_id),
                    "project_name": s.project_name,
                    "name": s.name,
                    "description": s.description,
                    "ecosystem_type": s.ecosystem_type,
                    "area_hectares": s.area_hectares,
                    "center_latitude": s.center_latitude,
                    "center_longitude": s.center_longitude,
                    "latest_carbon": s.latest_carbon,
                    "latest_biodiversity": s.latest_biodiversity,
                    "latest_vegetation": s.latest_vegetation,
                },
            )
            features.append(feature)
        return GeoJSONFeatureCollection(features=features)

    @staticmethod
    def get_site(db: Session, site_id: uuid.UUID) -> SiteResponse:
        site = db.query(Site).filter(Site.id == site_id).first()
        if not site:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Site with ID '{site_id}' not found.",
            )
        return SiteService._build_site_response(db, site)

    @staticmethod
    def create_site(
        db: Session,
        project_id: uuid.UUID,
        site_in: SiteCreate,
    ) -> SiteResponse:
        # Check project existence
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Parent project with ID '{project_id}' does not exist.",
            )

        # Validate GeoJSON and create Shapely Polygon
        geojson_dict = site_in.geometry.model_dump()
        try:
            shapely_polygon = geojson_to_shapely(geojson_dict)
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid geospatial polygon: {str(e)}",
            )

        # Convert to GeoAlchemy2 WKB element
        geo_wkb = shapely_to_geoalchemy(shapely_polygon, srid=4326)

        # Calculate exact geodetic area in hectares using PostGIS ST_Area(geography)
        geojson_json_str = json.dumps(geojson_dict)
        area_query = text(
            "SELECT ST_Area(ST_SetSRID(ST_GeomFromGeoJSON(:geom_json), 4326)::geography) / 10000.0"
        )
        area_result = db.execute(area_query, {"geom_json": geojson_json_str}).scalar()
        area_hectares = float(area_result) if area_result is not None else 0.0

        # Calculate Centroid
        lat, lng = calculate_centroid(shapely_polygon)

        site = Site(
            project_id=project_id,
            name=site_in.name.strip(),
            description=site_in.description.strip() if site_in.description else None,
            ecosystem_type=site_in.ecosystem_type,
            area_hectares=max(0.01, round(area_hectares, 4)),
            center_latitude=lat,
            center_longitude=lng,
            geometry=geo_wkb,
        )
        db.add(site)
        db.commit()
        db.refresh(site)

        return SiteService._build_site_response(db, site, project_name=project.name)

    @staticmethod
    def update_site(
        db: Session,
        site_id: uuid.UUID,
        site_in: SiteUpdate,
    ) -> SiteResponse:
        site = db.query(Site).filter(Site.id == site_id).first()
        if not site:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Site with ID '{site_id}' not found.",
            )

        if site_in.name is not None:
            site.name = site_in.name.strip()
        if site_in.description is not None:
            site.description = site_in.description.strip() if site_in.description else None
        if site_in.ecosystem_type is not None:
            site.ecosystem_type = site_in.ecosystem_type

        if site_in.geometry is not None:
            geojson_dict = site_in.geometry.model_dump()
            try:
                shapely_polygon = geojson_to_shapely(geojson_dict)
            except ValueError as e:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=f"Invalid geospatial polygon: {str(e)}",
                )

            geojson_json_str = json.dumps(geojson_dict)
            area_query = text(
                "SELECT ST_Area(ST_SetSRID(ST_GeomFromGeoJSON(:geom_json), 4326)::geography) / 10000.0"
            )
            area_result = db.execute(area_query, {"geom_json": geojson_json_str}).scalar()
            site.area_hectares = float(area_result) if area_result is not None else 0.0

            lat, lng = calculate_centroid(shapely_polygon)
            site.center_latitude = lat
            site.center_longitude = lng
            site.geometry = shapely_to_geoalchemy(shapely_polygon, srid=4326)

        db.commit()
        db.refresh(site)
        return SiteService._build_site_response(db, site)

    @staticmethod
    def delete_site(db: Session, site_id: uuid.UUID) -> dict:
        site = db.query(Site).filter(Site.id == site_id).first()
        if not site:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Site with ID '{site_id}' not found.",
            )
        db.delete(site)
        db.commit()
        return {"detail": f"Site '{site.name}' deleted successfully."}
