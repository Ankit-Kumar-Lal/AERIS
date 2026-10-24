import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from ..database import get_db
from ..models.location import Location, LocationStatus
from ..models.risk_score import RiskScore
from ..models.symptom_report import SymptomReport
from ..models.environmental_data import EnvironmentalData
from ..models.alert import Alert, AlertStatus
from ..models.user import User, UserRole
from ..schemas.location import LocationOut, LocationDetailOut, LocationCreate
from .auth import require_roles

router = APIRouter(prefix="/locations", tags=["Locations"])


@router.get("", response_model=List[LocationOut])
def list_locations(
    state: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    risk_level: Optional[str] = Query(None),
    status_filter: Optional[str] = Query("all"),  # all, active, coming_soon
    db: Session = Depends(get_db)
):
    query = db.query(Location)
    if status_filter != "all":
        query = query.filter(Location.status == status_filter)
    if state and state != "All":
        query = query.filter(Location.state == state)
    if district and district != "All":
        query = query.filter(Location.district == district)

    locations = query.order_by(Location.name.asc()).all()
    results = []

    for loc in locations:
        latest_risk = db.query(RiskScore).filter(
            RiskScore.location_id == loc.location_id
        ).order_by(RiskScore.computed_at.desc()).first()

        latest_env = db.query(EnvironmentalData).filter(
            EnvironmentalData.location_id == loc.location_id
        ).order_by(EnvironmentalData.recorded_at.desc()).first()

        active_alerts_cnt = db.query(func.count(Alert.alert_id)).filter(
            Alert.location_id == loc.location_id,
            Alert.status == AlertStatus.ACTIVE.value
        ).scalar() or 0

        risk_val = latest_risk.risk_level if latest_risk else "low"
        if risk_level and risk_level != "All" and risk_val != risk_level.lower():
            continue

        results.append(LocationOut(
            location_id=loc.location_id,
            name=loc.name,
            district=loc.district,
            state=loc.state,
            latitude=loc.latitude,
            longitude=loc.longitude,
            population=loc.population,
            status=loc.status,
            terrain_type=loc.terrain_type,
            nearest_health_facility=loc.nearest_health_facility,
            asha_count=loc.asha_count,
            current_risk_level=risk_val,
            case_count_7day=latest_risk.case_count_7day if latest_risk else 0,
            ml_risk_probability=latest_risk.ml_risk_probability if latest_risk else 0.10,
            ml_confidence=latest_risk.ml_confidence if latest_risk else "Baseline Safe Confidence",
            latest_wqi=latest_env.water_quality_index if latest_env else 75.0,
            latest_rainfall=latest_env.rainfall_mm if latest_env else 10.0,
            active_alerts_count=active_alerts_cnt
        ))

    return results


@router.get("/{location_id}", response_model=LocationDetailOut)
def get_location_detail(location_id: int, db: Session = Depends(get_db)):
    loc = db.query(Location).filter(Location.location_id == location_id).first()
    if not loc:
        raise HTTPException(status_code=404, detail="Village location not found.")

    latest_risk = db.query(RiskScore).filter(
        RiskScore.location_id == loc.location_id
    ).order_by(RiskScore.computed_at.desc()).first()

    latest_env = db.query(EnvironmentalData).filter(
        EnvironmentalData.location_id == loc.location_id
    ).order_by(EnvironmentalData.recorded_at.desc()).first()

    active_alerts_cnt = db.query(func.count(Alert.alert_id)).filter(
        Alert.location_id == loc.location_id,
        Alert.status == AlertStatus.ACTIVE.value
    ).scalar() or 0

    location_out = LocationOut(
        location_id=loc.location_id,
        name=loc.name,
        district=loc.district,
        state=loc.state,
        latitude=loc.latitude,
        longitude=loc.longitude,
        population=loc.population,
        status=loc.status,
        terrain_type=loc.terrain_type,
        nearest_health_facility=loc.nearest_health_facility,
        asha_count=loc.asha_count,
        current_risk_level=latest_risk.risk_level if latest_risk else "low",
        case_count_7day=latest_risk.case_count_7day if latest_risk else 0,
        ml_risk_probability=latest_risk.ml_risk_probability if latest_risk else 0.10,
        ml_confidence=latest_risk.ml_confidence if latest_risk else "Baseline Safe Confidence",
        latest_wqi=latest_env.water_quality_index if latest_env else 75.0,
        latest_rainfall=latest_env.rainfall_mm if latest_env else 10.0,
        active_alerts_count=active_alerts_cnt
    )

    # Last 20 reports
    recent_reports = db.query(SymptomReport).filter(
        SymptomReport.location_id == location_id
    ).order_by(SymptomReport.reported_at.desc()).limit(20).all()

    reports_data = [
        {
            "report_id": r.report_id,
            "reporter_type": r.reporter_type,
            "symptoms": r.symptoms,
            "patient_age_group": r.patient_age_group,
            "severity": r.severity,
            "affected_count": r.affected_count,
            "water_source": r.water_source,
            "tracking_id": r.tracking_id,
            "verification_status": r.verification_status,
            "reported_at": r.reported_at.isoformat()
        }
        for r in recent_reports
    ]

    # 7-day case trend
    now = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)
    trend_7d = []
    for d in range(6, -1, -1):
        day_start = (now - datetime.timedelta(days=d)).replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + datetime.timedelta(days=1)
        cnt = db.query(func.count(SymptomReport.report_id)).filter(
            SymptomReport.location_id == location_id,
            SymptomReport.reported_at >= day_start,
            SymptomReport.reported_at < day_end
        ).scalar() or 0
        trend_7d.append({
            "date": day_start.strftime("%b %d"),
            "cases": cnt
        })

    # 30-day trend with rainfall
    trend_30d = []
    for d in range(29, -1, -1):
        day_start = (now - datetime.timedelta(days=d)).replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + datetime.timedelta(days=1)
        cnt = db.query(func.count(SymptomReport.report_id)).filter(
            SymptomReport.location_id == location_id,
            SymptomReport.reported_at >= day_start,
            SymptomReport.reported_at < day_end
        ).scalar() or 0
        rain = db.query(func.sum(EnvironmentalData.rainfall_mm)).filter(
            EnvironmentalData.location_id == location_id,
            EnvironmentalData.recorded_at >= day_start,
            EnvironmentalData.recorded_at < day_end
        ).scalar() or 0.0
        trend_30d.append({
            "date": day_start.strftime("%d/%m"),
            "cases": cnt,
            "rainfall": round(float(rain), 1)
        })

    # Active alerts
    alerts = db.query(Alert).filter(
        Alert.location_id == location_id,
        Alert.status == AlertStatus.ACTIVE.value
    ).all()
    alerts_data = [
        {
            "alert_id": a.alert_id,
            "title": a.title,
            "message": a.message,
            "severity": a.severity,
            "triggered_at": a.triggered_at.isoformat()
        }
        for a in alerts
    ]

    # Assigned ASHAs
    ashas = db.query(User).filter(
        User.role == UserRole.ASHA_NGO.value,
        User.district == loc.district
    ).limit(3).all()
    ashas_data = [
        {
            "id": a.id,
            "name": a.full_name,
            "designation": a.designation or "Sentinel ASHA Worker",
            "phone": a.phone_number,
            "trust_score": a.trust_score
        }
        for a in ashas
    ]

    return LocationDetailOut(
        location=location_out,
        latest_environmental_data={
            "water_quality_index": latest_env.water_quality_index if latest_env else 75.0,
            "rainfall_mm": latest_env.rainfall_mm if latest_env else 10.0,
            "ph": latest_env.ph if latest_env else 7.2,
            "turbidity_ntu": latest_env.turbidity_ntu if latest_env else 3.5,
            "chlorine_ppm": latest_env.chlorine_ppm if latest_env else 0.25,
            "flood_risk_level": latest_env.flood_risk_level if latest_env else "normal",
            "water_source_tested": latest_env.water_source_tested if latest_env else "Tube Well",
            "recorded_at": latest_env.recorded_at.isoformat() if latest_env else now.isoformat()
        } if latest_env else None,
        last_20_reports=reports_data,
        case_trend_7day=trend_7d,
        case_trend_30day=trend_30d,
        current_risk_score={
            "risk_level": latest_risk.risk_level if latest_risk else "low",
            "case_count_7day": latest_risk.case_count_7day if latest_risk else 0,
            "ml_risk_probability": latest_risk.ml_risk_probability if latest_risk else 0.10,
            "ml_confidence": latest_risk.ml_confidence if latest_risk else "Baseline Safe Confidence",
            "z_score_anomaly": latest_risk.z_score_anomaly if latest_risk else 0.0,
            "recommended_action": latest_risk.recommended_action if latest_risk else "Routine village surveillance.",
            "computed_at": latest_risk.computed_at.isoformat() if latest_risk else now.isoformat(),
            "contributing_factors": latest_risk.contributing_factors if latest_risk else {}
        } if latest_risk else None,
        assigned_ashas=ashas_data,
        active_alerts=alerts_data,
        explainability=latest_risk.contributing_factors if latest_risk else {}
    )


@router.post("", response_model=LocationOut, status_code=status.HTTP_201_CREATED)
def create_location(
    loc_in: LocationCreate,
    current_user: User = Depends(require_roles([UserRole.DISTRICT_ADMIN.value, UserRole.SUPER_ADMIN.value])),
    db: Session = Depends(get_db)
):
    new_loc = Location(
        name=loc_in.name,
        district=loc_in.district,
        state=loc_in.state,
        latitude=loc_in.latitude,
        longitude=loc_in.longitude,
        population=loc_in.population,
        status=loc_in.status,
        terrain_type=loc_in.terrain_type,
        nearest_health_facility=loc_in.nearest_health_facility,
        asha_count=loc_in.asha_count
    )
    db.add(new_loc)
    db.commit()
    db.refresh(new_loc)
    return LocationOut(
        location_id=new_loc.location_id,
        name=new_loc.name,
        district=new_loc.district,
        state=new_loc.state,
        latitude=new_loc.latitude,
        longitude=new_loc.longitude,
        population=new_loc.population,
        status=new_loc.status,
        terrain_type=new_loc.terrain_type,
        nearest_health_facility=new_loc.nearest_health_facility,
        asha_count=new_loc.asha_count,
        current_risk_level="low",
        case_count_7day=0,
        ml_risk_probability=0.10,
        ml_confidence="Baseline Safe Confidence",
        latest_wqi=75.0,
        latest_rainfall=0.0,
        active_alerts_count=0
    )
