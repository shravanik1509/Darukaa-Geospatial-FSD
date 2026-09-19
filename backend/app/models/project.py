import uuid
from datetime import date
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Date, Float, ForeignKey, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.site import Site
    from app.models.user import User


class Project(Base, TimestampMixin):
    __tablename__ = "projects"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    project_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        default="Reforestation",
    )
    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="Active",
        index=True,
    )
    created_by: Mapped[uuid.UUID | None] = mapped_column(
        Uuid,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    target_carbon_offset: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Relationships
    creator: Mapped[Optional["User"]] = relationship("User", back_populates="projects")
    sites: Mapped[list["Site"]] = relationship(
        "Site",
        back_populates="project",
        cascade="all, delete-orphan",
        order_by="Site.created_at.desc()",
    )

    def __repr__(self) -> str:
        return f"<Project id={self.id} name={self.name} status={self.status}>"
