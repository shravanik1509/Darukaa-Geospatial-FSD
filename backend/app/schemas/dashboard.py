from pydantic import BaseModel

from app.schemas.project import ProjectResponse
from app.schemas.site import SiteResponse


class DashboardSummary(BaseModel):
    total_projects: int
    total_sites: int
    total_area_hectares: float
    total_estimated_carbon: float
    average_biodiversity_index: float
    average_vegetation_index: float
    projects_by_status: dict[str, int]
    projects_by_type: dict[str, int]
    recent_projects: list[ProjectResponse] = []
    featured_sites: list[SiteResponse] = []
