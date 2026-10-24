import enum
from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
from ..database import Base
from .base import utcnow


class LocationStatus(str, enum.Enum):
    ACTIVE = "active"
    COMING_SOON = "coming_soon"


class Location(Base):
    __tablename__ = "locations"

    location_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(150), nullable=False, index=True)
    district = Column(String(100), nullable=False, index=True)
    state = Column(String(100), nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    population = Column(Integer, nullable=False)
    status = Column(String(50), default=LocationStatus.ACTIVE.value, nullable=False, index=True)
    terrain_type = Column(String(150), default="Flood-Prone River Basin", nullable=False)
    nearest_health_facility = Column(String(200), default="Primary Health Centre (PHC)", nullable=True)
    asha_count = Column(Integer, default=3, nullable=False)
    created_at = Column(DateTime, default=utcnow, nullable=False)

    symptom_reports = relationship("SymptomReport", back_populates="location", cascade="all, delete-orphan")
    environmental_data = relationship("EnvironmentalData", back_populates="location", cascade="all, delete-orphan")
    risk_scores = relationship("RiskScore", back_populates="location", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="location", cascade="all, delete-orphan")
