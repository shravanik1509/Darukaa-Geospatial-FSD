import uuid

from fastapi import HTTPException, status
from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from app.models.analytics import SiteAnalytics
from app.models.project import Project
from app.models.site import Site
from app.schemas.analytics import (
    AnalyticsCreate,
    AnalyticsResponse,
    MetricTrend,
    SiteAnalyticsSummary,
)
from app.schemas.dashboard import DashboardSummary
from app.services.project_service import ProjectService
from app.services.site_service import SiteService


class AnalyticsService:
    @staticmethod
    def _compute_metric_trend(values: list[float]) -> MetricTrend | None:
        if not values:
            return None
        current = values[-1]
        previous = values[-2] if len(values) > 1 else None
        change_pct = None
        if previous is not None and previous > 0:
            change_pct = round(((current - previous) / previous) * 100.0, 2)

        return MetricTrend(
            current=round(current, 2),
            previous=round(previous, 2) if previous is not None else None,
            change_percentage=change_pct,
            min=round(min(values), 2),
            max=round(max(values), 2),
            avg=round(sum(values) / len(values), 2),
        )

    @staticmethod
    def get_site_analytics_summary(db: Session, site_id: uuid.UUID) -> SiteAnalyticsSummary:
        site = db.query(Site).filter(Site.id == site_id).first()
        if not site:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Site with ID '{site_id}' not found.",
            )

        records = (
            db.query(SiteAnalytics)
            .filter(SiteAnalytics.site_id == site_id)
            .order_by(SiteAnalytics.recorded_at.asc())
            .all()
        )

        carbon_vals = [r.carbon_value for r in records]
        bio_vals = [r.biodiversity_value for r in records]
        veg_vals = [r.vegetation_value for r in records]

        return SiteAnalyticsSummary(
            site_id=site.id,
            site_name=site.name,
            total_observations=len(records),
            latest_recorded_at=records[-1].recorded_at if records else None,
            carbon_trend=AnalyticsService._compute_metric_trend(carbon_vals),
            biodiversity_trend=AnalyticsService._compute_metric_trend(bio_vals),
            vegetation_trend=AnalyticsService._compute_metric_trend(veg_vals),
            records=[AnalyticsResponse.model_validate(r) for r in records],
        )

    @staticmethod
    def add_observation(
        db: Session,
        site_id: uuid.UUID,
        analytics_in: AnalyticsCreate,
    ) -> AnalyticsResponse:
        site = db.query(Site).filter(Site.id == site_id).first()
        if not site:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Site with ID '{site_id}' not found.",
            )

        observation = SiteAnalytics(
            site_id=site_id,
            recorded_at=analytics_in.recorded_at,
            carbon_value=analytics_in.carbon_value,
            biodiversity_value=analytics_in.biodiversity_value,
            vegetation_value=analytics_in.vegetation_value,
            canopy_cover_percentage=analytics_in.canopy_cover_percentage,
            soil_moisture_percentage=analytics_in.soil_moisture_percentage,
        )
        db.add(observation)
        db.commit()
        db.refresh(observation)
        return AnalyticsResponse.model_validate(observation)

    @staticmethod
    def get_dashboard_summary(db: Session) -> DashboardSummary:
        total_projects = db.query(func.count(Project.id)).scalar() or 0
        total_sites = db.query(func.count(Site.id)).scalar() or 0
        total_area = db.query(func.sum(Site.area_hectares)).scalar() or 0.0

        # Subquery for latest analytics record per site
        subq = db.query(
            SiteAnalytics.site_id,
            SiteAnalytics.carbon_value,
            SiteAnalytics.biodiversity_value,
            SiteAnalytics.vegetation_value,
            func.row_number()
            .over(
                partition_by=SiteAnalytics.site_id,
                order_by=desc(SiteAnalytics.recorded_at),
            )
            .label("rn"),
        ).subquery()

        latest_records = db.query(subq).filter(subq.c.rn == 1).all()

        total_carbon = 0.0
        bio_values = []
        veg_values = []

        # Map site areas
        site_areas = {s.id: s.area_hectares for s in db.query(Site.id, Site.area_hectares).all()}

        for rec in latest_records:
            site_area = site_areas.get(rec.site_id, 0.0)
            # carbon is in tCO2e/ha * area = total tCO2e
            total_carbon += (rec.carbon_value or 0.0) * site_area
            if rec.biodiversity_value is not None:
                bio_values.append(rec.biodiversity_value)
            if rec.vegetation_value is not None:
                veg_values.append(rec.vegetation_value)

        avg_bio = sum(bio_values) / len(bio_values) if bio_values else 0.0
        avg_veg = sum(veg_values) / len(veg_values) if veg_values else 0.0

        # Status distribution
        status_counts: dict[str, int] = {}
        for st, cnt in (
            db.query(Project.status, func.count(Project.id)).group_by(Project.status).all()
        ):
            status_counts[st] = cnt

        # Type distribution
        type_counts: dict[str, int] = {}
        for pt, cnt in (
            db.query(Project.project_type, func.count(Project.id))
            .group_by(Project.project_type)
            .all()
        ):
            type_counts[pt] = cnt

        recent_projects = ProjectService.list_projects(db, limit=5)
        featured_sites = SiteService.list_sites(db, limit=6)

        return DashboardSummary(
            total_projects=total_projects,
            total_sites=total_sites,
            total_area_hectares=round(float(total_area), 2),
            total_estimated_carbon=round(total_carbon, 2),
            average_biodiversity_index=round(avg_bio, 2),
            average_vegetation_index=round(avg_veg, 2),
            projects_by_status=status_counts,
            projects_by_type=type_counts,
            recent_projects=recent_projects,
            featured_sites=featured_sites,
        )
