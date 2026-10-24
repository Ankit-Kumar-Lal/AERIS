import math
import datetime
from typing import Tuple, Optional
from sqlalchemy.orm import Session
from ..models.symptom_report import SymptomReport
from ..models.location import Location


def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Computes great-circle distance between two GPS coordinates in kilometers."""
    R = 6371.0  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2.0) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c


def check_geo_consistency(location_lat: float, location_lng: float, report_lat: Optional[float], report_lng: Optional[float]) -> Tuple[bool, float]:
    """
    Validates if reported GPS coordinates fall within reasonable boundary (25 km radius)
    of the declared village centre.
    """
    if report_lat is None or report_lng is None:
        return True, 0.0  # Citizen reported without GPS permissions, allowed

    distance_km = haversine_distance_km(location_lat, location_lng, report_lat, report_lng)
    is_consistent = distance_km <= 25.0
    return is_consistent, round(distance_km, 2)


def check_is_duplicate_report(db: Session, user_id: Optional[int], location_id: int, time_window_hours: int = 18) -> bool:
    """
    Suppresses duplicate reporting spam from the same authenticated user within a short time window.
    """
    if user_id is None:
        return False

    cutoff = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None) - datetime.timedelta(hours=time_window_hours)
    existing = db.query(SymptomReport).filter(
        SymptomReport.user_id == user_id,
        SymptomReport.location_id == location_id,
        SymptomReport.reported_at >= cutoff
    ).first()

    return existing is not None
