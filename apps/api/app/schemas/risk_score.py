from typing import Dict, Any, Optional
from pydantic import BaseModel, ConfigDict


class RiskScoreOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    score_id: int
    location_id: int
    location_name: Optional[str] = None
    district: Optional[str] = None
    risk_level: str
    case_count_7day: int
    ml_risk_probability: float
    ml_confidence: str
    z_score_anomaly: float
    contributing_factors: Dict[str, Any]
    recommended_action: str
    computed_at: str


class RiskScoreComputeResponse(BaseModel):
    status: str
    updated_count: int
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    data: list
