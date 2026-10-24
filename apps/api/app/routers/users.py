import datetime
from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from ..database import get_db
from ..models.user import User, UserRole, VerificationStatus
from ..models.audit_log import AuditLog
from ..schemas.auth import UserOut
from .auth import require_roles, require_auth

router = APIRouter(prefix="/users", tags=["User & Admin Management"])


class UserVerificationUpdate(BaseModel):
    status: str  # APPROVED or REJECTED
    notes: Optional[str] = None


@router.get("", response_model=List[UserOut])
def list_users(
    role: Optional[str] = Query(None),
    verification_status: Optional[str] = Query(None),
    current_user: User = Depends(require_roles([UserRole.DISTRICT_ADMIN.value, UserRole.SUPER_ADMIN.value])),
    db: Session = Depends(get_db)
):
    query = db.query(User)
    if role and role != "all":
        query = query.filter(User.role == role)
    if verification_status and verification_status != "all":
        query = query.filter(User.verification_status == verification_status)

    users = query.order_by(desc(User.created_at)).all()
    return [
        UserOut(
            id=u.id,
            phone_number=u.phone_number,
            email=u.email,
            full_name=u.full_name,
            role=u.role,
            verification_status=u.verification_status,
            state=u.state,
            district=u.district,
            block=u.block,
            village=u.village,
            designation=u.designation,
            department=u.department,
            official_id_number=u.official_id_number,
            gov_id_type=u.gov_id_type,
            gov_id_masked=u.gov_id_masked,
            is_id_verified=u.is_id_verified,
            trust_score=u.trust_score,
            total_reports_count=u.total_reports_count,
            verified_reports_count=u.verified_reports_count,
            created_at=u.created_at.isoformat()
        )
        for u in users
    ]


@router.patch("/{user_id}/verification", response_model=UserOut)
def update_user_verification(
    user_id: int,
    req: UserVerificationUpdate,
    current_user: User = Depends(require_roles([UserRole.DISTRICT_ADMIN.value, UserRole.SUPER_ADMIN.value])),
    db: Session = Depends(get_db)
):
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User account not found.")

    prev_status = target_user.verification_status
    target_user.verification_status = req.status
    target_user.verification_notes = req.notes or f"Updated by {current_user.full_name} ({current_user.role})"
    if req.status == VerificationStatus.APPROVED.value:
        target_user.is_id_verified = True

    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        action=f"OFFICIAL_VERIFICATION_{req.status}",
        entity_type="user",
        entity_id=target_user.id,
        details={
            "target_user": target_user.full_name,
            "target_role": target_user.role,
            "previous_status": prev_status,
            "new_status": req.status,
            "notes": req.notes
        }
    )
    db.add(audit)
    db.commit()
    db.refresh(target_user)

    return UserOut(
        id=target_user.id,
        phone_number=target_user.phone_number,
        email=target_user.email,
        full_name=target_user.full_name,
        role=target_user.role,
        verification_status=target_user.verification_status,
        state=target_user.state,
        district=target_user.district,
        block=target_user.block,
        village=target_user.village,
        designation=target_user.designation,
        department=target_user.department,
        official_id_number=target_user.official_id_number,
        gov_id_type=target_user.gov_id_type,
        gov_id_masked=target_user.gov_id_masked,
        is_id_verified=target_user.is_id_verified,
        trust_score=target_user.trust_score,
        total_reports_count=target_user.total_reports_count,
        verified_reports_count=target_user.verified_reports_count,
        created_at=target_user.created_at.isoformat()
    )


@router.get("/audit-logs")
def list_audit_logs(
    limit: int = Query(50, le=200),
    current_user: User = Depends(require_roles([UserRole.DISTRICT_ADMIN.value, UserRole.SUPER_ADMIN.value])),
    db: Session = Depends(get_db)
):
    logs = db.query(AuditLog).order_by(desc(AuditLog.created_at)).limit(limit).all()
    results = []
    for log in logs:
        user_name = log.user.full_name if log.user else "System"
        results.append({
            "id": log.id,
            "action": log.action,
            "user_name": user_name,
            "entity_type": log.entity_type,
            "entity_id": log.entity_id,
            "details": log.details,
            "timestamp": log.created_at.isoformat()
        })
    return results
