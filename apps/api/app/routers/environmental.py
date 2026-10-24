import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from ..database import get_db
from ..models.environmental_data import EnvironmentalData
from ..models.location import Location
from ..schemas.environmental_data import EnvironmentalDataOut

router = APIRouter(prefix="/environmental", tags=["Environmental Telemetry"])


@router.get("/telemetry", response_model=List[EnvironmentalDataOut])
def get_recent_telemetry(
    location_id: Optional[int] = Query(None),
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db)
):
    query = db.query(EnvironmentalData).join(Location)
    if location_id:
        query = query.filter(EnvironmentalData.location_id == location_id)

    records = query.order_by(desc(EnvironmentalData.recorded_at)).limit(limit).all()

    return [
        EnvironmentalDataOut(
            env_id=r.env_id,
            location_id=r.location_id,
            location_name=r.location.name if r.location else None,
            district=r.location.district if r.location else None,
            rainfall_mm=r.rainfall_mm,
            water_quality_index=r.water_quality_index,
            ph=r.ph,
            turbidity_ntu=r.turbidity_ntu,
            chlorine_ppm=r.chlorine_ppm,
            flood_risk_level=r.flood_risk_level,
            water_source_tested=r.water_source_tested,
            recorded_at=r.recorded_at.isoformat()
        )
        for r in records
    ]
