import uuid
from typing import TYPE_CHECKING

from geoalchemy2 import Geometry
from sqlalchemy import Float, ForeignKey, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.analytics import SiteAnalytics
    from app.models.project import Project


class Site(Base, TimestampMixin):
    __tablename__ = "sites"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    project_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    ecosystem_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        default="Tropical Forest",
    )
    area_hectares: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)

    # Centroid coordinates for quick map centering
    center_latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    center_longitude: Mapped[float | None] = mapped_column(Float, nullable=True)

    # PostGIS Polygon Geometry with SRID 4326 (WGS84) and automatic GIST spatial index
    geometry = mapped_column(
        Geometry(
            geometry_type="POLYGON",
            srid=4326,
            spatial_index=True,
            name="geometry",
        ),
        nullable=False,
    )

    # Relationships
    project: Mapped["Project"] = relationship("Project", back_populates="sites")
    analytics: Mapped[list["SiteAnalytics"]] = relationship(
        "SiteAnalytics",
        back_populates="site",
        cascade="all, delete-orphan",
        order_by="SiteAnalytics.recorded_at.asc()",
    )

    def __repr__(self) -> str:
        return f"<Site id={self.id} name={self.name} area={self.area_hectares}ha>"
