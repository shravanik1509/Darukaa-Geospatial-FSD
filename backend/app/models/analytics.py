import uuid
from datetime import UTC, datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Float, ForeignKey, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

if TYPE_CHECKING:
    from app.models.site import Site


class SiteAnalytics(Base):
    __tablename__ = "site_analytics"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    site_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("sites.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True,
    )
    # Carbon stock or sequestration (in metric tonnes CO2e or tCO2e/ha)
    carbon_value: Mapped[float] = mapped_column(Float, nullable=False)

    # Biodiversity Index (e.g. Shannon Index 0.0 to 5.0)
    biodiversity_value: Mapped[float] = mapped_column(Float, nullable=False)

    # Vegetation index (Normalized Difference Vegetation Index - NDVI, typically 0.0 to 1.0)
    vegetation_value: Mapped[float] = mapped_column(Float, nullable=False)

    # Additional contextual environmental indicators
    canopy_cover_percentage: Mapped[float | None] = mapped_column(Float, nullable=True)
    soil_moisture_percentage: Mapped[float | None] = mapped_column(Float, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )

    # Relationship
    site: Mapped["Site"] = relationship("Site", back_populates="analytics")

    def __repr__(self) -> str:
        return (
            f"<SiteAnalytics id={self.id} site_id={self.site_id} "
            f"date={self.recorded_at} carbon={self.carbon_value}>"
        )
