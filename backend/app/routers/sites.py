import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, require_admin
from app.models.user import User
from app.schemas.analytics import AnalyticsCreate, AnalyticsResponse, SiteAnalyticsSummary
from app.schemas.site import (
    GeoJSONFeatureCollection,
    SiteResponse,
    SiteUpdate,
)
from app.services.analytics_service import AnalyticsService
from app.services.site_service import SiteService

router = APIRouter(prefix="/sites", tags=["Sites & Geospatial"])


@router.get(
    "",
    response_model=list[SiteResponse],
    summary="List all geographical project sites",
)
def list_sites(
    db: Annotated[Session, Depends(get_db)],
    project_id: uuid.UUID | None = Query(None, description="Filter by project ID"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
) -> list[SiteResponse]:
    return SiteService.list_sites(db, project_id=project_id, skip=skip, limit=limit)


@router.get(
    "/geojson",
    response_model=GeoJSONFeatureCollection,
    summary="Get all sites as standard GeoJSON FeatureCollection for Mapbox GL JS",
)
def get_sites_geojson(
    db: Annotated[Session, Depends(get_db)],
    project_id: uuid.UUID | None = Query(None, description="Filter by project ID"),
) -> GeoJSONFeatureCollection:
    return SiteService.list_sites_as_geojson(db, project_id=project_id)


@router.get(
    "/{site_id}",
    response_model=SiteResponse,
    summary="Get site details including PostGIS polygon geometry and latest metrics",
)
def get_site(
    site_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
) -> SiteResponse:
    return SiteService.get_site(db, site_id)


@router.put(
    "/{site_id}",
    response_model=SiteResponse,
    summary="Update site metadata or polygon geometry",
)
def update_site(
    site_id: uuid.UUID,
    site_in: SiteUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_admin)],
) -> SiteResponse:
    return SiteService.update_site(db, site_id, site_in)


@router.delete(
    "/{site_id}",
    summary="Delete a geographical site and its historical analytics",
)
def delete_site(
    site_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_admin)],
) -> dict:
    return SiteService.delete_site(db, site_id)


@router.get(
    "/{site_id}/analytics",
    response_model=SiteAnalyticsSummary,
    summary="Get chronological time-series analytics and metric trends for a site",
)
def get_site_analytics(
    site_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
) -> SiteAnalyticsSummary:
    return AnalyticsService.get_site_analytics_summary(db, site_id)


@router.post(
    "/{site_id}/analytics",
    response_model=AnalyticsResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record a new field environmental observation for a site",
)
def add_site_observation(
    site_id: uuid.UUID,
    analytics_in: AnalyticsCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_admin)],
) -> AnalyticsResponse:
    return AnalyticsService.add_observation(db, site_id, analytics_in)
