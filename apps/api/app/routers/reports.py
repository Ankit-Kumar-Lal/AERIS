import datetime
import random
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from ..database import get_db
from ..models.symptom_report import SymptomReport, ReportVerificationStatus
from ..models.location import Location
from ..models.user import User, UserRole
from ..models.audit_log import AuditLog
from ..schemas.symptom_report import SymptomReportCreate, SymptomReportOut, SymptomReportVerifyRequest
from .auth import get_current_user, require_auth, require_roles
from ..services.anti_fake import check_geo_consistency, check_is_duplicate_report
from ..services.risk_engine import compute_risk_scores_for_all_locations
from ..core.websocket_manager import ws_manager

router = APIRouter(prefix="/reports", tags=["Symptom Reports"])


@router.get("", response_model=List[SymptomReportOut])
def list_symptom_reports(
    location_id: Optional[int] = Query(None),
    district: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None),  # unverified, verified, rejected
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db)
):
    query = db.query(SymptomReport).join(Location)
    if location_id:
        query = query.filter(SymptomReport.location_id == location_id)
    if district and district != "All":
        query = query.filter(Location.district == district)
    if severity and severity != "All":
        query = query.filter(SymptomReport.severity == severity.lower())
    if status_filter and status_filter != "All":
        query = query.filter(SymptomReport.verification_status == status_filter.lower())

    reports = query.order_by(desc(SymptomReport.reported_at)).limit(limit).all()

    results = []
    for r in reports:
        verified_by_name = None
        if r.verified_by_id:
            u = db.query(User).filter(User.id == r.verified_by_id).first()
            if u:
                verified_by_name = u.full_name

        results.append(SymptomReportOut(
            report_id=r.report_id,
            location_id=r.location_id,
            location_name=r.location.name if r.location else None,
            district=r.location.district if r.location else None,
            state=r.location.state if r.location else None,
            reporter_type=r.reporter_type,
            symptoms=r.symptoms,
            patient_age_group=r.patient_age_group,
            severity=r.severity,
            affected_count=r.affected_count,
            water_source=r.water_source,
            notes=r.notes,
            tracking_id=r.tracking_id,
            verification_status=r.verification_status,
            verified_by_name=verified_by_name,
            verified_at=r.verified_at.isoformat() if r.verified_at else None,
            verification_notes=r.verification_notes,
            trust_weight=r.trust_weight,
            is_geo_consistent=r.is_geo_consistent,
            photo_url=r.photo_url,
            voice_note_url=r.voice_note_url,
            reported_at=r.reported_at.isoformat()
        ))
    return results


@router.post("", response_model=SymptomReportOut, status_code=status.HTTP_201_CREATED)
async def submit_symptom_report(
    req: SymptomReportCreate,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    loc = db.query(Location).filter(Location.location_id == req.location_id).first()
    if not loc:
        raise HTTPException(status_code=404, detail="Target village not found.")

    now = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)

    # 1. Anti-Fake: Check duplicate report spam
    user_id = current_user.id if current_user else None
    if check_is_duplicate_report(db, user_id, req.location_id, time_window_hours=12):
        raise HTTPException(
            status_code=400,
            detail="A similar case report was recently submitted from your account for this village within the last 12 hours. Duplicate suppressed to preserve epidemiological integrity."
        )

    # 2. Geo-consistency check
    is_geo_consistent, dist_km = check_geo_consistency(loc.latitude, loc.longitude, req.gps_lat, req.gps_lng)

    # 3. Trust & Verification status determination
    is_official = current_user and current_user.role in [UserRole.ASHA_NGO.value, UserRole.HEALTH_OFFICIAL.value, UserRole.SUPER_ADMIN.value]
    if is_official:
        init_status = ReportVerificationStatus.VERIFIED.value
        verified_by_id = current_user.id
        verified_at = now
        verification_notes = f"Directly recorded by authorized health personnel: {current_user.full_name} ({current_user.designation})"
        reporter_type = "asha_worker" if current_user.role == UserRole.ASHA_NGO.value else "health_official"
        trust_weight = 1.0
    else:
        init_status = ReportVerificationStatus.UNVERIFIED.value
        verified_by_id = None
        verified_at = None
        verification_notes = None
        reporter_type = "citizen"
        trust_weight = current_user.trust_score if current_user else 0.85

    # 4. Generate unique tracking ID
    tracking_id = f"RPT-2026-{random.randint(10000, 99999)}"

    # 5. Persist report
    new_report = SymptomReport(
        location_id=req.location_id,
        user_id=user_id,
        reporter_type=reporter_type,
        symptoms=req.symptoms,
        patient_age_group=req.patient_age_group,
        severity=req.severity,
        affected_count=req.affected_count,
        water_source=req.water_source,
        notes=req.notes,
        tracking_id=tracking_id,
        verification_status=init_status,
        verified_by_id=verified_by_id,
        verified_at=verified_at,
        verification_notes=verification_notes,
        trust_weight=trust_weight,
        gps_lat=req.gps_lat,
        gps_lng=req.gps_lng,
        is_geo_consistent=is_geo_consistent,
        photo_url=req.photo_url,
        voice_note_url=req.voice_note_url,
        reported_at=now
    )
    db.add(new_report)

    if current_user:
        current_user.total_reports_count += 1
        if is_official:
            current_user.verified_reports_count += 1

    db.commit()
    db.refresh(new_report)

    # 6. Recompute dual-engine risk scores for affected location
    compute_risk_scores_for_all_locations(db)

    # 7. WebSocket broadcast for live dashboard feed
    await ws_manager.broadcast("NEW_SYMPTOM_REPORT", {
        "report_id": new_report.report_id,
        "location_id": loc.location_id,
        "location_name": loc.name,
        "district": loc.district,
        "symptoms": new_report.symptoms,
        "severity": new_report.severity,
        "tracking_id": new_report.tracking_id,
        "verification_status": new_report.verification_status,
        "timestamp": now.isoformat()
    })

    return SymptomReportOut(
        report_id=new_report.report_id,
        location_id=new_report.location_id,
        location_name=loc.name,
        district=loc.district,
        state=loc.state,
        reporter_type=new_report.reporter_type,
        symptoms=new_report.symptoms,
        patient_age_group=new_report.patient_age_group,
        severity=new_report.severity,
        affected_count=new_report.affected_count,
        water_source=new_report.water_source,
        notes=new_report.notes,
        tracking_id=new_report.tracking_id,
        verification_status=new_report.verification_status,
        verified_by_name=current_user.full_name if is_official else None,
        verified_at=verified_at.isoformat() if verified_at else None,
        verification_notes=verification_notes,
        trust_weight=new_report.trust_weight,
        is_geo_consistent=new_report.is_geo_consistent,
        photo_url=new_report.photo_url,
        voice_note_url=new_report.voice_note_url,
        reported_at=new_report.reported_at.isoformat()
    )


@router.patch("/{report_id}/verify", response_model=SymptomReportOut)
async def verify_symptom_report(
    report_id: int,
    req: SymptomReportVerifyRequest,
    current_user: User = Depends(require_roles([UserRole.ASHA_NGO.value, UserRole.HEALTH_OFFICIAL.value, UserRole.DISTRICT_ADMIN.value])),
    db: Session = Depends(get_db)
):
    report = db.query(SymptomReport).filter(SymptomReport.report_id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Symptom report not found.")

    now = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)
    report.verification_status = req.status
    report.verified_by_id = current_user.id
    report.verified_at = now
    report.verification_notes = req.verification_notes or f"Verified by {current_user.full_name} ({current_user.designation})"

    # Adjust reporter trust score
    if report.user_id:
        reporter = db.query(User).filter(User.id == report.user_id).first()
        if reporter:
            if req.status == "verified":
                reporter.verified_reports_count += 1
                reporter.trust_score = min(1.0, reporter.trust_score + 0.05)
            else:
                reporter.rejected_reports_count += 1
                reporter.trust_score = max(0.2, reporter.trust_score - 0.15)

    # Log audit event
    audit = AuditLog(
        user_id=current_user.id,
        action="REPORT_VERIFIED" if req.status == "verified" else "REPORT_REJECTED",
        entity_type="symptom_report",
        entity_id=report.report_id,
        details={"status": req.status, "notes": req.verification_notes}
    )
    db.add(audit)
    db.commit()

    # Recompute risk scores
    compute_risk_scores_for_all_locations(db)

    # Broadcast event
    await ws_manager.broadcast("REPORT_VERIFIED", {
        "report_id": report.report_id,
        "status": req.status,
        "verified_by": current_user.full_name
    })

    return SymptomReportOut(
        report_id=report.report_id,
        location_id=report.location_id,
        location_name=report.location.name if report.location else None,
        district=report.location.district if report.location else None,
        state=report.location.state if report.location else None,
        reporter_type=report.reporter_type,
        symptoms=report.symptoms,
        patient_age_group=report.patient_age_group,
        severity=report.severity,
        affected_count=report.affected_count,
        water_source=report.water_source,
        notes=report.notes,
        tracking_id=report.tracking_id,
        verification_status=report.verification_status,
        verified_by_name=current_user.full_name,
        verified_at=report.verified_at.isoformat() if report.verified_at else None,
        verification_notes=report.verification_notes,
        trust_weight=report.trust_weight,
        is_geo_consistent=report.is_geo_consistent,
        photo_url=report.photo_url,
        voice_note_url=report.voice_note_url,
        reported_at=report.reported_at.isoformat()
    )
