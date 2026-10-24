import enum
from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, JSON, Text
from sqlalchemy.orm import relationship
from ..database import Base
from .base import utcnow


class UserRole(str, enum.Enum):
    CIVILIAN = "CIVILIAN"
    ASHA_NGO = "ASHA_NGO"
    POLICE = "POLICE"
    HEALTH_OFFICIAL = "HEALTH_OFFICIAL"
    DISTRICT_ADMIN = "DISTRICT_ADMIN"
    SUPER_ADMIN = "SUPER_ADMIN"


class VerificationStatus(str, enum.Enum):
    PENDING_VERIFICATION = "PENDING_VERIFICATION"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    phone_number = Column(String(20), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=True)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default=UserRole.CIVILIAN.value, nullable=False, index=True)
    verification_status = Column(String(50), default=VerificationStatus.APPROVED.value, nullable=False, index=True)

    # Demographic & Location fields
    age = Column(Integer, nullable=True)
    gender = Column(String(20), nullable=True)
    state = Column(String(100), default="Assam", nullable=False)
    district = Column(String(100), nullable=False, index=True)
    block = Column(String(100), nullable=True)
    village = Column(String(100), nullable=True)

    # Official credentials (for ASHA, Police, Health Officers, Admins)
    designation = Column(String(100), nullable=True)
    department = Column(String(150), nullable=True)
    official_id_number = Column(String(100), nullable=True)
    supervisor_name = Column(String(255), nullable=True)
    jurisdiction_villages = Column(JSON, default=list, nullable=True)
    verification_notes = Column(Text, nullable=True)

    # Government ID & Privacy Fields (never store plain ID)
    gov_id_type = Column(String(50), nullable=True)  # aadhaar, pan, voter_id, driving_licence
    gov_id_hash = Column(String(64), unique=True, index=True, nullable=True)  # Salted SHA-256
    gov_id_masked = Column(String(50), nullable=True)  # e.g. XXXX-XXXX-9876
    is_id_verified = Column(Boolean, default=True)

    # Trust & Anti-Fake Reporting
    trust_score = Column(Float, default=1.0)  # Starts at 1.0, adjusts based on verification outcome
    total_reports_count = Column(Integer, default=0)
    verified_reports_count = Column(Integer, default=0)
    rejected_reports_count = Column(Integer, default=0)

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)

    reports = relationship("SymptomReport", back_populates="reporter_user", foreign_keys="SymptomReport.user_id")
