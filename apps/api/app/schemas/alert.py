from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict


class AlertUpdate(BaseModel):
    status: str = "resolved"  # active, escalated, resolved
    notes: Optional[str] = None


class AlertActionRequest(BaseModel):
    action: str  # NOTIFY_OFFICIALS, ASSIGN_TEAM, MARK_VERIFIED, MARK_RESOLVED, ADD_NOTE
    note: Optional[str] = None
    assignee_id: Optional[int] = None


class AlertOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    alert_id: int
    location_id: int
    location_name: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    title: str
    message: str
    severity: str
    status: str
    assigned_to_name: Optional[str] = None
    action_logs: List[Dict[str, Any]] = []
    resolution_notes: Optional[str] = None
    triggered_at: str
    resolved_at: Optional[str] = None
