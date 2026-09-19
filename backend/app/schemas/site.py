import uuid
from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class GeoJSONPolygon(BaseModel):
    type: Literal["Polygon"] = "Polygon"
    coordinates: list[list[list[float]]] = Field(
        ...,
        description="GeoJSON Polygon coordinates [rings [points [lng, lat]]]",
    )

    @field_validator("coordinates")
    @classmethod
    def validate_polygon_coordinates(cls, v: list[list[list[float]]]) -> list[list[list[float]]]:
        if not v or len(v) < 1:
            raise ValueError("Polygon must contain at least one linear ring (exterior ring).")
        exterior_ring = v[0]
        if len(exterior_ring) < 4:
            raise ValueError(
                "Exterior ring must have at least 4 positions (including closing vertex)."
            )
        # Check closing point
        if (
            abs(exterior_ring[0][0] - exterior_ring[-1][0]) > 1e-6
            or abs(exterior_ring[0][1] - exterior_ring[-1][1]) > 1e-6
        ):
            raise ValueError(
                "Polygon exterior ring first and last positions must match to close the polygon."
            )
        # Check coordinate bounds
        for ring in v:
            for pt in ring:
                if len(pt) < 2:
                    raise ValueError("Each point must have at least [longitude, latitude].")
                lng, lat = pt[0], pt[1]
                if not (-180.0 <= lng <= 180.0):
                    raise ValueError(f"Longitude {lng} out of bounds [-180, 180].")
                if not (-90.0 <= lat <= 90.0):
                    raise ValueError(f"Latitude {lat} out of bounds [-90, 90].")
        return v


class SiteBase(BaseModel):
    name: str = Field(
        ..., min_length=2, max_length=255, description="Site name / parcel identifier"
    )
    description: str | None = None
    ecosystem_type: str = Field(
        default="Tropical Forest",
        description="Ecosystem classification (e.g. Mangrove, Peatland, Temperate Forest)",
    )


class SiteCreate(SiteBase):
    geometry: GeoJSONPolygon = Field(..., description="GeoJSON Polygon boundary geometry")


class SiteUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=255)
    description: str | None = None
    ecosystem_type: str | None = None
    geometry: GeoJSONPolygon | None = None


class SiteResponse(SiteBase):
    id: uuid.UUID
    project_id: uuid.UUID
    project_name: str | None = None
    area_hectares: float
    center_latitude: float | None = None
    center_longitude: float | None = None
    geometry: dict[str, Any]
    latest_carbon: float | None = None
    latest_biodiversity: float | None = None
    latest_vegetation: float | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class GeoJSONFeature(BaseModel):
    type: Literal["Feature"] = "Feature"
    id: str
    geometry: dict[str, Any]
    properties: dict[str, Any]


class GeoJSONFeatureCollection(BaseModel):
    type: Literal["FeatureCollection"] = "FeatureCollection"
    features: list[GeoJSONFeature]
