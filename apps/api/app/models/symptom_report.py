import enum
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON, Boolean
from sqlalchemy.orm import relationship
from ..database import Base
from .base import utcnow


class ReportVerificationStatus(str, enum.Enum):
    UNVERIFIED = "unverified"
    VERIFIED = "verified"
    REJECTED = "rejected"


class SymptomReport(Base):
    __tablename__ = "symptom_reports"

    report_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    location_id = Column(Integer, ForeignKey("locations.location_id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    
    reporter_type = Column(String(50), default="citizen", nullable=False)  # citizen, asha_worker, health_official
    symptoms = Column(JSON, nullable=False)  # list of strings: ["diarrhea", "vomiting", "dehydration", ...]
    patient_age_group = Column(String(50), nullable=False)  # under_5, 5_18, 18_60, 60_plus
    severity = Column(String(50), nullable=False)  # mild, moderate, severe
    affected_count = Column(Integer, default=1, nullable=False)
    water_source = Column(String(100), default="tube_well", nullable=True)  # tube_well, river, pond, piped, open_well
    
    notes = Column(Text, nullable=True)
    tracking_id = Column(String(64), unique=True, index=True, nullable=False)
    
    verification_status = Column(String(50), default=ReportVerificationStatus.UNVERIFIED.value, nullable=False, index=True)
    verified_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    verified_at = Column(DateTime, nullable=True)
    verification_notes = Column(Text, nullable=True)

    # Trust & Geo-Consistency
    trust_weight = Column(Float, default=1.0, nullable=False)
    gps_lat = Column(Float, nullable=True)
    gps_lng = Column(Float, nullable=True)
    is_geo_consistent = Column(Boolean, default=True)

    # Attachments
    photo_url = Column(String(255), nullable=True)
    voice_note_url = Column(String(255), nullable=True)

    reported_at = Column(DateTime, default=utcnow, nullable=False, index=True)

    location = relationship("Location", back_populates="symptom_reports")
    reporter_user = relationship("User", foreign_keys=[user_id], back_populates="reports")
    verified_by_user = relationship("User", foreign_keys=[verified_by_id])
