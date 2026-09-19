import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class ProjectBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255, description="Project title")
    description: str | None = Field(None, description="Detailed project description")
    project_type: str = Field(
        default="Reforestation",
        description="Type: Reforestation, Mangrove Restoration, Agroforestry, Grassland Conservation, Peatland Rewetting",
    )
    status: str = Field(
        default="Active",
        pattern="^(Active|Planning|Completed|Under Review)$",
        description="Project lifecycle status",
    )
    start_date: date | None = None
    end_date: date | None = None
    target_carbon_offset: float | None = Field(
        None, ge=0, description="Target carbon offset in metric tonnes CO2e"
    )


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=255)
    description: str | None = None
    project_type: str | None = None
    status: str | None = Field(None, pattern="^(Active|Planning|Completed|Under Review)$")
    start_date: date | None = None
    end_date: date | None = None
    target_carbon_offset: float | None = Field(None, ge=0)


class ProjectResponse(ProjectBase):
    id: uuid.UUID
    created_by: uuid.UUID | None = None
    total_sites: int = 0
    total_area_hectares: float = 0.0
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProjectDetailResponse(ProjectResponse):
    pass
