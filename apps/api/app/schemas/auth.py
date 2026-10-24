from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class CivilianRegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2)
    phone_number: str = Field(..., min_length=10, max_length=15)
    password: str = Field(..., min_length=6)
    email: Optional[EmailStr] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    state: str = "Assam"
    district: str
    block: Optional[str] = None
    village: Optional[str] = None
    gov_id_type: str = "aadhaar"  # aadhaar, pan, voter_id, driving_licence
    gov_id_number: str
    otp: str = "123456"  # Default verification OTP input


class OfficialRegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2)
    phone_number: str = Field(..., min_length=10, max_length=15)
    password: str = Field(..., min_length=6)
    email: EmailStr
    role: str = "ASHA_NGO"  # ASHA_NGO, POLICE, HEALTH_OFFICIAL, DISTRICT_ADMIN
    designation: str
    department: str
    official_id_number: str
    supervisor_name: Optional[str] = None
    state: str = "Assam"
    district: str
    block: Optional[str] = None
    jurisdiction_villages: List[str] = []
    gov_id_type: str = "official_id"
    gov_id_number: str
    otp: str = "123456"


class LoginRequest(BaseModel):
    identifier: str  # phone number or email or official ID
    password: str
    role_type: Optional[str] = "CIVILIAN"  # CIVILIAN or OFFICIAL


class VerifyOtpRequest(BaseModel):
    phone_number: str
    otp: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    phone_number: str
    email: Optional[str] = None
    full_name: str
    role: str
    verification_status: str
    state: str
    district: str
    block: Optional[str] = None
    village: Optional[str] = None
    designation: Optional[str] = None
    department: Optional[str] = None
    official_id_number: Optional[str] = None
    gov_id_type: Optional[str] = None
    gov_id_masked: Optional[str] = None
    is_id_verified: bool
    trust_score: float
    total_reports_count: int
    verified_reports_count: int
    created_at: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserOut


TokenResponse.model_rebuild()
