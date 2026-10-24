from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from ..database import Base
from .base import utcnow


class RiskScore(Base):
    __tablename__ = "risk_scores"

    score_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    location_id = Column(Integer, ForeignKey("locations.location_id"), nullable=False, index=True)
    
    risk_level = Column(String(50), nullable=False, index=True)  # low, medium, high
    case_count_7day = Column(Integer, nullable=False, default=0)
    ml_risk_probability = Column(Float, nullable=False, default=0.1)
    ml_confidence = Column(String(100), nullable=False, default="Baseline Safe Confidence")
    z_score_anomaly = Column(Float, nullable=False, default=0.0)
    
    contributing_factors = Column(JSON, nullable=False)
    recommended_action = Column(String(255), default="Continue routine community water vigilance.", nullable=False)
    computed_at = Column(DateTime, default=utcnow, nullable=False, index=True)

    location = relationship("Location", back_populates="risk_scores")
