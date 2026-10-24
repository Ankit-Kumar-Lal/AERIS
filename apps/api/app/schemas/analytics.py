from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class DashboardSummaryOut(BaseModel):
    monitored_villages_count: int
    active_alerts_count: int
    cases_today_count: int
    cases_7day_count: int
    high_risk_villages_count: int
    medium_risk_villages_count: int
    low_risk_villages_count: int
    avg_wqi: float
    verified_reports_count: int
    unverified_reports_count: int
    validation_metrics: Dict[str, Any]
    disease_distribution: Dict[str, int]
    top_attention_villages: List[Dict[str, Any]]
    monsoon_trend: List[Dict[str, Any]]
    data_quality: Dict[str, Any]


class OutbreakSimulationRequest(BaseModel):
    location_id: int
    surge_cases: int = 20
    wqi_drop: float = 34.0
    rainfall_surge: float = 460.0


class OutbreakSimulationResponse(BaseModel):
    status: str
    message: str
    location_id: int
    location_name: str
    previous_risk_level: str
    new_risk_level: str
    new_ml_probability: float
    alert_triggered: bool
    alert_id: Optional[int] = None
