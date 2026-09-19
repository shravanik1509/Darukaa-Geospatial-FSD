import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class AnalyticsCreate(BaseModel):
    recorded_at: datetime = Field(..., description="Timestamp when measurement was observed")
    carbon_value: float = Field(..., ge=0, description="Carbon stock/sequestration (tCO2e/ha)")
    biodiversity_value: float = Field(
        ..., ge=0, description="Biodiversity index (e.g. Shannon Index 0.0 - 5.0)"
    )
    vegetation_value: float = Field(
        ..., ge=-1.0, le=1.0, description="Vegetation index (NDVI -1.0 to 1.0)"
    )
    canopy_cover_percentage: float | None = Field(None, ge=0, le=100)
    soil_moisture_percentage: float | None = Field(None, ge=0, le=100)


class AnalyticsResponse(AnalyticsCreate):
    id: uuid.UUID
    site_id: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MetricTrend(BaseModel):
    current: float
    previous: float | None = None
    change_percentage: float | None = None
    min: float
    max: float
    avg: float


class SiteAnalyticsSummary(BaseModel):
    site_id: uuid.UUID
    site_name: str
    total_observations: int
    latest_recorded_at: datetime | None = None
    carbon_trend: MetricTrend | None = None
    biodiversity_trend: MetricTrend | None = None
    vegetation_trend: MetricTrend | None = None
    records: list[AnalyticsResponse] = []
