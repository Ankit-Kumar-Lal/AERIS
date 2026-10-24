import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from ..database import get_db
from ..models.alert import Alert, AlertStatus, AlertSeverity
from ..models.location import Location
from ..models.user import User, UserRole
from ..models.audit_log import AuditLog
from ..models.notification import Notification
from ..schemas.alert import AlertOut, AlertUpdate, AlertActionRequest
from .auth import get_current_user, require_auth, require_roles
from ..core.websocket_manager import ws_manager

router = APIRouter(prefix="/alerts", tags=["Alerts"])


@router.get("", response_model=List[AlertOut])
def list_alerts(
    status_filter: Optional[str] = Query("all"),  # all, active, escalated, resolved
    district: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Alert).join(Location)
    if status_filter != "all":
        query = query.filter(Alert.status == status_filter.lower())
    if district and district != "All":
        query = query.filter(Location.district == district)
    if severity and severity != "All":
        query = query.filter(Alert.severity == severity.lower())

    alerts = query.order_by(desc(Alert.triggered_at)).all()
    results = []
    for a in alerts:
        assigned_name = None
        if a.assigned_to_id:
            u = db.query(User).filter(User.id == a.assigned_to_id).first()
            if u:
                assigned_name = u.full_name

        results.append(AlertOut(
            alert_id=a.alert_id,
            location_id=a.location_id,
            location_name=a.location.name if a.location else None,
            district=a.location.district if a.location else None,
            state=a.location.state if a.location else None,
            title=a.title,
            message=a.message,
            severity=a.severity,
            status=a.status,
            assigned_to_name=assigned_name,
            action_logs=a.action_logs or [],
            resolution_notes=a.resolution_notes,
            triggered_at=a.triggered_at.isoformat(),
            resolved_at=a.resolved_at.isoformat() if a.resolved_at else None
        ))
    return results


@router.patch("/{alert_id}", response_model=AlertOut)
async def update_alert(
    alert_id: int,
    status_update: AlertUpdate,
    current_user: User = Depends(require_roles([UserRole.ASHA_NGO.value, UserRole.HEALTH_OFFICIAL.value, UserRole.DISTRICT_ADMIN.value])),
    db: Session = Depends(get_db)
):
    alert = db.query(Alert).filter(Alert.alert_id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")

    now = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)
    prev_status = alert.status
    alert.status = status_update.status

    if status_update.status == AlertStatus.RESOLVED.value:
        alert.resolved_at = now
        alert.resolution_notes = status_update.notes or f"Resolved by {current_user.full_name} ({current_user.designation})"

    # Append to timeline
    logs = list(alert.action_logs or [])
    logs.append({
        "action": f"STATUS_CHANGE_{status_update.status.upper()}",
        "user": current_user.full_name,
        "role": current_user.role,
        "note": status_update.notes,
        "timestamp": now.isoformat()
    })
    alert.action_logs = logs

    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        action=f"ALERT_STATUS_{status_update.status.upper()}",
        entity_type="alert",
        entity_id=alert.alert_id,
        details={"previous": prev_status, "new": status_update.status, "notes": status_update.notes}
    )
    db.add(audit)
    db.commit()

    await ws_manager.broadcast("ALERT_STATUS_UPDATED", {
        "alert_id": alert.alert_id,
        "location_id": alert.location_id,
        "status": alert.status,
        "user": current_user.full_name
    })

    return AlertOut(
        alert_id=alert.alert_id,
        location_id=alert.location_id,
        location_name=alert.location.name if alert.location else None,
        district=alert.location.district if alert.location else None,
        state=alert.location.state if alert.location else None,
        title=alert.title,
        message=alert.message,
        severity=alert.severity,
        status=alert.status,
        assigned_to_name=current_user.full_name,
        action_logs=alert.action_logs,
        resolution_notes=alert.resolution_notes,
        triggered_at=alert.triggered_at.isoformat(),
        resolved_at=alert.resolved_at.isoformat() if alert.resolved_at else None
    )


@router.post("/{alert_id}/action", response_model=AlertOut)
async def perform_alert_action(
    alert_id: int,
    req: AlertActionRequest,
    current_user: User = Depends(require_roles([UserRole.ASHA_NGO.value, UserRole.HEALTH_OFFICIAL.value, UserRole.DISTRICT_ADMIN.value])),
    db: Session = Depends(get_db)
):
    alert = db.query(Alert).filter(Alert.alert_id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")

    now = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)
    action_type = req.action.upper()

    logs = list(alert.action_logs or [])
    log_entry = {
        "action": action_type,
        "user": current_user.full_name,
        "role": current_user.role,
        "note": req.note,
        "timestamp": now.isoformat()
    }

    if action_type == "NOTIFY_OFFICIALS":
        alert.status = AlertStatus.ESCALATED.value
        notif = Notification(
            title=f"ESCALATION: {alert.title}",
            message=f"Official notification dispatched by {current_user.full_name}. Priority field mobilization required.",
            notification_type="escalation",
            created_at=now
        )
        db.add(notif)
        log_entry["details"] = "Notified District Medical Officer & Rapid Response Team via SMS/Email broadcast stub."

    elif action_type == "ASSIGN_TEAM":
        if req.assignee_id:
            alert.assigned_to_id = req.assignee_id
            assignee = db.query(User).filter(User.id == req.assignee_id).first()
            if assignee:
                log_entry["details"] = f"Assigned to {assignee.full_name} ({assignee.role})"

    elif action_type == "MARK_RESOLVED":
        alert.status = AlertStatus.RESOLVED.value
        alert.resolved_at = now
        alert.resolution_notes = req.note or f"Chlorine distribution and water disinfection complete. Marked resolved by {current_user.full_name}."

    elif action_type == "ADD_NOTE":
        log_entry["details"] = req.note

    logs.append(log_entry)
    alert.action_logs = logs

    audit = AuditLog(
        user_id=current_user.id,
        action=f"ALERT_ACTION_{action_type}",
        entity_type="alert",
        entity_id=alert.alert_id,
        details=log_entry
    )
    db.add(audit)
    db.commit()

    await ws_manager.broadcast("ALERT_ACTION_LOGGED", {
        "alert_id": alert.alert_id,
        "action": action_type,
        "user": current_user.full_name
    })

    assigned_name = None
    if alert.assigned_to_id:
        u = db.query(User).filter(User.id == alert.assigned_to_id).first()
        if u:
            assigned_name = u.full_name

    return AlertOut(
        alert_id=alert.alert_id,
        location_id=alert.location_id,
        location_name=alert.location.name if alert.location else None,
        district=alert.location.district if alert.location else None,
        state=alert.location.state if alert.location else None,
        title=alert.title,
        message=alert.message,
        severity=alert.severity,
        status=alert.status,
        assigned_to_name=assigned_name,
        action_logs=alert.action_logs,
        resolution_notes=alert.resolution_notes,
        triggered_at=alert.triggered_at.isoformat(),
        resolved_at=alert.resolved_at.isoformat() if alert.resolved_at else None
    )
