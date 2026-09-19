from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.schemas.dashboard import DashboardSummary
from app.services.analytics_service import AnalyticsService

router = APIRouter(tags=["Analytics & Dashboard"])


@router.get(
    "/dashboard/summary",
    response_model=DashboardSummary,
    summary="Get aggregated global platform KPIs and summary metrics",
)
def get_dashboard_summary(
    db: Annotated[Session, Depends(get_db)],
) -> DashboardSummary:
    return AnalyticsService.get_dashboard_summary(db)


@router.get(
    "/analytics/summary",
    response_model=DashboardSummary,
    summary="Alias for dashboard summary metrics",
)
def get_analytics_summary(
    db: Annotated[Session, Depends(get_db)],
) -> DashboardSummary:
    return AnalyticsService.get_dashboard_summary(db)
