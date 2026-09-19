from typing import Annotated, Any

from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.dependencies import get_db

router = APIRouter(tags=["Health"])


@router.get("/health", summary="Basic service liveness probe")
def health_check() -> dict[str, Any]:
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
    }


@router.get("/health/db", summary="Database and PostGIS connectivity check")
def database_health_check(
    db: Annotated[Session, Depends(get_db)],
) -> dict[str, Any]:
    try:
        # Check basic postgres connectivity
        pg_version = db.execute(text("SELECT version();")).scalar()

        # Check PostGIS extension
        postgis_version = db.execute(text("SELECT PostGIS_Full_Version();")).scalar()

        return {
            "status": "healthy",
            "database": "connected",
            "postgres_version": pg_version.split(",")[0] if pg_version else "unknown",
            "postgis_full_version": postgis_version,
        }
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "unhealthy",
                "database": "disconnected",
                "error": str(e),
            },
        )
