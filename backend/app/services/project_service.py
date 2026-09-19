import uuid

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.project import Project
from app.models.site import Site
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate


class ProjectService:
    @staticmethod
    def list_projects(
        db: Session,
        search: str | None = None,
        status_filter: str | None = None,
        project_type: str | None = None,
        skip: int = 0,
        limit: int = 100,
    ) -> list[ProjectResponse]:
        query = db.query(
            Project,
            func.count(Site.id).label("total_sites"),
            func.coalesce(func.sum(Site.area_hectares), 0.0).label("total_area_hectares"),
        ).outerjoin(Site, Project.id == Site.project_id)

        if search:
            query = query.filter(Project.name.ilike(f"%{search.strip()}%"))
        if status_filter:
            query = query.filter(Project.status == status_filter)
        if project_type:
            query = query.filter(Project.project_type == project_type)

        query = query.group_by(Project.id).order_by(Project.created_at.desc())
        results = query.offset(skip).limit(limit).all()

        responses = []
        for project, total_sites, total_area in results:
            resp = ProjectResponse(
                id=project.id,
                name=project.name,
                description=project.description,
                project_type=project.project_type,
                status=project.status,
                start_date=project.start_date,
                end_date=project.end_date,
                target_carbon_offset=project.target_carbon_offset,
                created_by=project.created_by,
                total_sites=total_sites or 0,
                total_area_hectares=round(float(total_area or 0.0), 2),
                created_at=project.created_at,
                updated_at=project.updated_at,
            )
            responses.append(resp)
        return responses

    @staticmethod
    def get_project(db: Session, project_id: uuid.UUID) -> ProjectResponse:
        result = (
            db.query(
                Project,
                func.count(Site.id).label("total_sites"),
                func.coalesce(func.sum(Site.area_hectares), 0.0).label("total_area_hectares"),
            )
            .outerjoin(Site, Project.id == Site.project_id)
            .filter(Project.id == project_id)
            .group_by(Project.id)
            .first()
        )
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Project with ID '{project_id}' not found.",
            )

        project, total_sites, total_area = result
        return ProjectResponse(
            id=project.id,
            name=project.name,
            description=project.description,
            project_type=project.project_type,
            status=project.status,
            start_date=project.start_date,
            end_date=project.end_date,
            target_carbon_offset=project.target_carbon_offset,
            created_by=project.created_by,
            total_sites=total_sites or 0,
            total_area_hectares=round(float(total_area or 0.0), 2),
            created_at=project.created_at,
            updated_at=project.updated_at,
        )

    @staticmethod
    def create_project(
        db: Session,
        project_in: ProjectCreate,
        creator_id: uuid.UUID | None = None,
    ) -> ProjectResponse:
        project = Project(
            name=project_in.name.strip(),
            description=project_in.description.strip() if project_in.description else None,
            project_type=project_in.project_type,
            status=project_in.status,
            start_date=project_in.start_date,
            end_date=project_in.end_date,
            target_carbon_offset=project_in.target_carbon_offset,
            created_by=creator_id,
        )
        db.add(project)
        db.commit()
        db.refresh(project)

        return ProjectResponse(
            id=project.id,
            name=project.name,
            description=project.description,
            project_type=project.project_type,
            status=project.status,
            start_date=project.start_date,
            end_date=project.end_date,
            target_carbon_offset=project.target_carbon_offset,
            created_by=project.created_by,
            total_sites=0,
            total_area_hectares=0.0,
            created_at=project.created_at,
            updated_at=project.updated_at,
        )

    @staticmethod
    def update_project(
        db: Session,
        project_id: uuid.UUID,
        project_in: ProjectUpdate,
    ) -> ProjectResponse:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Project with ID '{project_id}' not found.",
            )

        update_data = project_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(project, key, value)

        db.commit()
        db.refresh(project)
        return ProjectService.get_project(db, project_id)

    @staticmethod
    def delete_project(db: Session, project_id: uuid.UUID) -> dict:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Project with ID '{project_id}' not found.",
            )
        db.delete(project)
        db.commit()
        return {"detail": f"Project '{project.name}' deleted successfully."}
