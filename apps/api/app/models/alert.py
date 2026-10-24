import enum
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from ..database import Base
from .base import utcnow


class AlertStatus(str, enum.Enum):
    ACTIVE = "active"
    ESCALATED = "escalated"
    RESOLVED = "resolved"


class AlertSeverity(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class Alert(Base):
    __tablename__ = "alerts"

    alert_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    location_id = Column(Integer, ForeignKey("locations.location_id"), nullable=False, index=True)
    
    title = Column(String(200), default="Water-Borne Disease Outbreak Warning", nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String(50), default=AlertSeverity.HIGH.value, nullable=False, index=True)
    status = Column(String(50), default=AlertStatus.ACTIVE.value, nullable=False, index=True)
    
    assigned_to_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action_logs = Column(JSON, default=list, nullable=False)  # History of actions taken
    resolution_notes = Column(Text, nullable=True)

    triggered_at = Column(DateTime, default=utcnow, nullable=False, index=True)
    resolved_at = Column(DateTime, nullable=True)

    location = relationship("Location", back_populates="alerts")
    assigned_user = relationship("User", foreign_keys=[assigned_to_id])
