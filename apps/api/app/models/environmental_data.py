from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship
from ..database import Base
from .base import utcnow


class EnvironmentalData(Base):
    __tablename__ = "environmental_data"

    env_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    location_id = Column(Integer, ForeignKey("locations.location_id"), nullable=False, index=True)
    
    rainfall_mm = Column(Float, nullable=False)
    water_quality_index = Column(Float, nullable=False)  # 0 to 100 (lower = worse contamination)
    
    # Extended Physico-Chemical Telemetry
    ph = Column(Float, default=7.2, nullable=False)  # Normal safe 6.5 - 8.5
    turbidity_ntu = Column(Float, default=4.5, nullable=False)  # NTU (safe < 5)
    chlorine_ppm = Column(Float, default=0.2, nullable=False)  # ppm (residual chlorine)
    flood_risk_level = Column(String(50), default="normal", nullable=False)  # normal, watch, warning, severe
    water_source_tested = Column(String(100), default="Community Tube Well", nullable=False)

    recorded_at = Column(DateTime, default=utcnow, nullable=False, index=True)

    location = relationship("Location", back_populates="environmental_data")
