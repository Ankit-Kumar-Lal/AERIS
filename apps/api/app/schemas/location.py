from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict


class LocationBase(BaseModel):
    name: str
    district: str
    state: str
    latitude: float
    longitude: float
    population: int
    status: str = "active"
    terrain_type: str = "Flood-Prone River Basin"
    nearest_health_facility: Optional[str] = "Primary Health Centre (PHC)"
    asha_count: int = 3


class LocationCreate(LocationBase):
    pass


class LocationOut(LocationBase):
    model_config = ConfigDict(from_attributes=True)

    location_id: int
    current_risk_level: str = "low"
    case_count_7day: int = 0
    ml_risk_probability: float = 0.10
    ml_confidence: str = "Baseline Safe Confidence"
    latest_wqi: float = 75.0
    latest_rainfall: float = 120.0
    active_alerts_count: int = 0


class LocationDetailOut(BaseModel):
    location: LocationOut
    latest_environmental_data: Optional[Dict[str, Any]] = None
    last_20_reports: List[Dict[str, Any]] = []
    case_trend_7day: List[Dict[str, Any]] = []
    case_trend_30day: List[Dict[str, Any]] = []
    current_risk_score: Optional[Dict[str, Any]] = None
    assigned_ashas: List[Dict[str, Any]] = []
    active_alerts: List[Dict[str, Any]] = []
    explainability: Dict[str, Any] = {}
