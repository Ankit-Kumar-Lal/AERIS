from typing import Optional
from pydantic import BaseModel, ConfigDict


class EnvironmentalDataCreate(BaseModel):
    location_id: int
    rainfall_mm: float
    water_quality_index: float
    ph: Optional[float] = 7.2
    turbidity_ntu: Optional[float] = 4.5
    chlorine_ppm: Optional[float] = 0.2
    flood_risk_level: Optional[str] = "normal"
    water_source_tested: Optional[str] = "Community Tube Well"


class EnvironmentalDataOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    env_id: int
    location_id: int
    location_name: Optional[str] = None
    district: Optional[str] = None
    rainfall_mm: float
    water_quality_index: float
    ph: float
    turbidity_ntu: float
    chlorine_ppm: float
    flood_risk_level: str
    water_source_tested: str
    recorded_at: str
