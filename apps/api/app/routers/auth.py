import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User, UserRole, VerificationStatus
from ..models.audit_log import AuditLog
from ..schemas.auth import (
    CivilianRegisterRequest,
    OfficialRegisterRequest,
    LoginRequest,
    VerifyOtpRequest,
    TokenResponse,
    UserOut
)
from ..core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_token,
    oauth2_scheme
)
from ..core.id_verification import get_id_verifier, hash_id_number, mask_id_number, IdType
from ..core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Optional[User]:
    if not token:
        return None
    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id = payload.get("sub")
    if not user_id:
        return None
    user = db.query(User).filter(User.id == int(user_id)).first()
    return user


def require_auth(current_user: Optional[User] = Depends(get_current_user)) -> User:
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required to perform this action.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return current_user


def require_roles(allowed_roles: list[str]):
    def role_checker(current_user: User = Depends(require_auth)) -> User:
        if current_user.role not in allowed_roles and current_user.role != UserRole.SUPER_ADMIN.value:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {allowed_roles}. Your role: {current_user.role}"
            )
        # Also check official verification status
        if current_user.role != UserRole.CIVILIAN.value and current_user.verification_status != VerificationStatus.APPROVED.value:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your official account is currently PENDING_VERIFICATION. Sensitive actions require approval from a District Health Administrator."
            )
        return current_user
    return role_checker


@router.post("/validate-id")
def validate_gov_id(id_type: str, id_number: str):
    """
    Real-time client-side government ID format & structural validator.
    Does NOT store or log plain text ID.
    """
    verifier = get_id_verifier()
    result = verifier.verify_id(id_type, id_number)
    return {
        "is_valid_format": result.is_valid_format,
        "is_verified": result.is_verified,
        "id_type": result.id_type,
        "masked_value": result.masked_value,
        "provider": result.provider,
        "message": result.message
    }


@router.post("/verify-otp")
def verify_phone_otp(request: VerifyOtpRequest):
    """
    SMS OTP verification endpoint.
    Validates standard default OTP '123456'.
    """
    if request.otp == settings.DEFAULT_OTP:
        return {"status": "success", "verified": True, "message": "Phone number verified successfully via OTP."}
    raise HTTPException(status_code=400, detail="Invalid OTP code.")


@router.post("/register/civilian", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_civilian(req: CivilianRegisterRequest, db: Session = Depends(get_db)):
    # 1. Check existing phone
    if db.query(User).filter(User.phone_number == req.phone_number).first():
        raise HTTPException(status_code=400, detail="An account with this phone number already exists.")

    # 2. Check existing email if provided
    if req.email and db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=400, detail="An account with this email address already exists.")

    # 3. Validate Government ID format
    verifier = get_id_verifier()
    id_result = verifier.verify_id(req.gov_id_type, req.gov_id_number)
    if not id_result.is_valid_format:
        raise HTTPException(status_code=400, detail=id_result.message)

    # 4. Anti-duplicate identity check via salted hash
    if db.query(User).filter(User.gov_id_hash == id_result.id_hash).first():
        raise HTTPException(status_code=400, detail="This ID is already registered.")

    # 5. Check OTP
    if req.otp != settings.DEFAULT_OTP:
        raise HTTPException(status_code=400, detail="Invalid OTP code.")

    # 6. Create User
    new_user = User(
        phone_number=req.phone_number,
        email=req.email,
        full_name=req.full_name,
        hashed_password=get_password_hash(req.password),
        role=UserRole.CIVILIAN.value,
        verification_status=VerificationStatus.APPROVED.value,
        age=req.age,
        gender=req.gender,
        state=req.state,
        district=req.district,
        block=req.block,
        village=req.village,
        gov_id_type=req.gov_id_type,
        gov_id_masked=id_result.masked_value,
        gov_id_hash=id_result.id_hash,
        is_id_verified=id_result.is_verified,
        trust_score=1.0
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # 7. Issue tokens
    access_token = create_access_token(new_user.id, new_user.role)
    refresh_token = create_refresh_token(new_user.id, new_user.role)

    user_out = UserOut(
        id=new_user.id,
        phone_number=new_user.phone_number,
        email=new_user.email,
        full_name=new_user.full_name,
        role=new_user.role,
        verification_status=new_user.verification_status,
        state=new_user.state,
        district=new_user.district,
        block=new_user.block,
        village=new_user.village,
        gov_id_type=new_user.gov_id_type,
        gov_id_masked=new_user.gov_id_masked,
        is_id_verified=new_user.is_id_verified,
        trust_score=new_user.trust_score,
        total_reports_count=0,
        verified_reports_count=0,
        created_at=new_user.created_at.isoformat()
    )

    return TokenResponse(access_token=access_token, refresh_token=refresh_token, user=user_out)


@router.post("/register/official", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_official(req: OfficialRegisterRequest, db: Session = Depends(get_db)):
    # 1. Check existing phone & email
    if db.query(User).filter(User.phone_number == req.phone_number).first():
        raise HTTPException(status_code=400, detail="An account with this phone number already exists.")
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=400, detail="An account with this official email already exists.")

    # 2. Check official ID
    verifier = get_id_verifier()
    id_result = verifier.verify_id(req.gov_id_type, req.official_id_number)
    if not id_result.is_valid_format:
        raise HTTPException(status_code=400, detail=id_result.message)

    id_hash = hash_id_number(req.official_id_number)
    if db.query(User).filter(User.gov_id_hash == id_hash).first():
        raise HTTPException(status_code=400, detail="This ID is already registered.")

    # 3. Check OTP
    if req.otp != settings.DEFAULT_OTP:
        raise HTTPException(status_code=400, detail="Invalid OTP code.")

    # 4. Create User in PENDING_VERIFICATION status to protect public health authority
    new_user = User(
        phone_number=req.phone_number,
        email=req.email,
        full_name=req.full_name,
        hashed_password=get_password_hash(req.password),
        role=req.role,
        verification_status=VerificationStatus.PENDING_VERIFICATION.value,
        designation=req.designation,
        department=req.department,
        official_id_number=req.official_id_number,
        supervisor_name=req.supervisor_name,
        state=req.state,
        district=req.district,
        block=req.block,
        jurisdiction_villages=req.jurisdiction_villages,
        gov_id_type=req.gov_id_type,
        gov_id_masked=mask_id_number(req.gov_id_type, req.official_id_number),
        gov_id_hash=id_hash,
        is_id_verified=False,
        verification_notes="Registration submitted. Awaiting administrative verification from District Health Officer."
    )
    db.add(new_user)
    db.flush()

    # Log audit event
    audit = AuditLog(
        user_id=new_user.id,
        action="OFFICIAL_ACCOUNT_REGISTERED",
        entity_type="user",
        entity_id=new_user.id,
        details={"role": req.role, "designation": req.designation, "department": req.department, "status": "PENDING_VERIFICATION"}
    )
    db.add(audit)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(new_user.id, new_user.role)
    refresh_token = create_refresh_token(new_user.id, new_user.role)

    user_out = UserOut(
        id=new_user.id,
        phone_number=new_user.phone_number,
        email=new_user.email,
        full_name=new_user.full_name,
        role=new_user.role,
        verification_status=new_user.verification_status,
        state=new_user.state,
        district=new_user.district,
        block=new_user.block,
        designation=new_user.designation,
        department=new_user.department,
        official_id_number=new_user.official_id_number,
        gov_id_type=new_user.gov_id_type,
        gov_id_masked=new_user.gov_id_masked,
        is_id_verified=new_user.is_id_verified,
        trust_score=new_user.trust_score,
        total_reports_count=0,
        verified_reports_count=0,
        created_at=new_user.created_at.isoformat()
    )

    return TokenResponse(access_token=access_token, refresh_token=refresh_token, user=user_out)


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    clean_id = req.identifier.strip()
    
    # Find user by phone, email, or official_id_number
    user = db.query(User).filter(
        (User.phone_number == clean_id) |
        (User.email == clean_id) |
        (User.official_id_number == clean_id)
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. No user found with this identifier."
        )

    if not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password. Please check your credentials."
        )

    access_token = create_access_token(user.id, user.role)
    refresh_token = create_refresh_token(user.id, user.role)

    user_out = UserOut(
        id=user.id,
        phone_number=user.phone_number,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        verification_status=user.verification_status,
        state=user.state,
        district=user.district,
        block=user.block,
        village=user.village,
        designation=user.designation,
        department=user.department,
        official_id_number=user.official_id_number,
        gov_id_type=user.gov_id_type,
        gov_id_masked=user.gov_id_masked,
        is_id_verified=user.is_id_verified,
        trust_score=user.trust_score,
        total_reports_count=user.total_reports_count,
        verified_reports_count=user.verified_reports_count,
        created_at=user.created_at.isoformat()
    )

    return TokenResponse(access_token=access_token, refresh_token=refresh_token, user=user_out)


@router.get("/me", response_model=UserOut)
def get_current_user_profile(user: User = Depends(require_auth)):
    return UserOut(
        id=user.id,
        phone_number=user.phone_number,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        verification_status=user.verification_status,
        state=user.state,
        district=user.district,
        block=user.block,
        village=user.village,
        designation=user.designation,
        department=user.department,
        official_id_number=user.official_id_number,
        gov_id_type=user.gov_id_type,
        gov_id_masked=user.gov_id_masked,
        is_id_verified=user.is_id_verified,
        trust_score=user.trust_score,
        total_reports_count=user.total_reports_count,
        verified_reports_count=user.verified_reports_count,
        created_at=user.created_at.isoformat()
    )
