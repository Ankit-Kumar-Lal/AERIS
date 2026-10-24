from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..services.risk_engine import compute_risk_scores_for_all_locations
from ..schemas.risk_score import RiskScoreComputeResponse

router = APIRouter(prefix="/risk", tags=["Risk Engine"])


@router.post("/compute", response_model=RiskScoreComputeResponse)
def trigger_risk_computation(db: Session = Depends(get_db)):
    """
    Executes authoritative dual-engine epidemiological risk recomputation across all locations:
    1. Deterministic Rule Validation (Thresholds: Cases > 15 & WQI < 50 & Rain > 400mm)
    2. Scikit-Learn Calibrated Logistic Regression Probability Model
    3. Anomaly Z-Score Velocity Analysis
    """
    results = compute_risk_scores_for_all_locations(db)
    high_count = sum(1 for r in results if r["risk_level"] == "high")
    med_count = sum(1 for r in results if r["risk_level"] == "medium")
    low_count = sum(1 for r in results if r["risk_level"] == "low")

    return RiskScoreComputeResponse(
        status="success",
        updated_count=len(results),
        high_risk_count=high_count,
        medium_risk_count=med_count,
        low_risk_count=low_count,
        data=results
    )
