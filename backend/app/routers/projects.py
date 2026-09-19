import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, require_admin
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate
from app.schemas.site import SiteCreate, SiteResponse
from app.services.project_service import ProjectService
from app.services.site_service import SiteService

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get(
    "",
    response_model=list[ProjectResponse],
    summary="List environmental conservation projects",
)
def list_projects(
    db: Annotated[Session, Depends(get_db)],
    search: str | None = Query(None, description="Search by project name"),
    status: str | None = Query(
        None, description="Filter by status (Active, Planning, Completed, Under Review)"
    ),
    project_type: str | None = Query(None, description="Filter by project type"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
) -> list[ProjectResponse]:
    return ProjectService.list_projects(
        db,
        search=search,
        status_filter=status,
        project_type=project_type,
        skip=skip,
        limit=limit,
    )


@router.post(
    "",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new conservation project",
)
def create_project(
    project_in: ProjectCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_admin)],
) -> ProjectResponse:
    return ProjectService.create_project(db, project_in, creator_id=current_user.id)


@router.get(
    "/{project_id}",
    response_model=ProjectResponse,
    summary="Get project by ID",
)
def get_project(
    project_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
) -> ProjectResponse:
    return ProjectService.get_project(db, project_id)


@router.put(
    "/{project_id}",
    response_model=ProjectResponse,
    summary="Update project metadata",
)
def update_project(
    project_id: uuid.UUID,
    project_in: ProjectUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_admin)],
) -> ProjectResponse:
    return ProjectService.update_project(db, project_id, project_in)


@router.delete(
    "/{project_id}",
    summary="Delete a project and all associated sites and analytics",
)
def delete_project(
    project_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_admin)],
) -> dict:
    return ProjectService.delete_project(db, project_id)


@router.get(
    "/{project_id}/sites",
    response_model=list[SiteResponse],
    summary="List all geographical sites within a project",
)
def list_project_sites(
    project_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
) -> list[SiteResponse]:
    return SiteService.list_sites(db, project_id=project_id)


@router.post(
    "/{project_id}/sites",
    response_model=SiteResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a geographical site with polygon boundary to a project",
)
def create_site_in_project(
    project_id: uuid.UUID,
    site_in: SiteCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_admin)],
) -> SiteResponse:
    return SiteService.create_site(db, project_id, site_in)
