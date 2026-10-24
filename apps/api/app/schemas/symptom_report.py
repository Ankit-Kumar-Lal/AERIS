from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class SymptomReportCreate(BaseModel):
    location_id: int
    reporter_type: str = "citizen"  # citizen, asha_worker, health_official
    symptoms: List[str] = Field(..., min_length=1)
    patient_age_group: str = "under_5"  # under_5, 5_18, 18_60, 60_plus
    severity: str = "moderate"  # mild, moderate, severe
    affected_count: int = 1
    water_source: Optional[str] = "tube_well"
    notes: Optional[str] = None
    gps_lat: Optional[float] = None
    gps_lng: Optional[float] = None
    photo_url: Optional[str] = None
    voice_note_url: Optional[str] = None


class SymptomReportVerifyRequest(BaseModel):
    status: str = "verified"  # verified or rejected
    verification_notes: Optional[str] = None


class SymptomReportOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    report_id: int
    location_id: int
    location_name: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    reporter_type: str
    symptoms: List[str]
    patient_age_group: str
    severity: str
    affected_count: int
    water_source: Optional[str] = None
    notes: Optional[str] = None
    tracking_id: str
    verification_status: str
    verified_by_name: Optional[str] = None
    verified_at: Optional[str] = None
    verification_notes: Optional[str] = None
    trust_weight: float
    is_geo_consistent: bool
    photo_url: Optional[str] = None
    voice_note_url: Optional[str] = None
    reported_at: str
