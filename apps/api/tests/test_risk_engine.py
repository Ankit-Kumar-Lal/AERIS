import pytest
from app.services.risk_engine import predict_ml_outbreak_probability, compute_factor_breakdown


def test_ml_risk_probability_high():
    # Severe epidemic inputs: 22 cases, 34 WQI (heavily contaminated), 480mm rain
    prob, conf = predict_ml_outbreak_probability(case_count_7day=22, wqi=34.0, rainfall_7day_sum=480.0)
    assert prob >= 0.70
    assert "High Outbreak Confidence" in conf or "%" in conf


def test_ml_risk_probability_low():
    # Safe baseline inputs: 2 cases, 82 WQI (clean water), 110mm rain
    prob, conf = predict_ml_outbreak_probability(case_count_7day=2, wqi=82.0, rainfall_7day_sum=110.0)
    assert prob <= 0.35
    assert "Baseline Safe Confidence" in conf or "%" in conf


def test_factor_breakdown_explainability():
    factors = compute_factor_breakdown(case_count=20, wqi=35.0, rainfall_mm=450.0, z_score=3.2)
    assert "case_load_contrib_pct" in factors
    assert "wqi_contamination_contrib_pct" in factors
    assert "rainfall_runoff_contrib_pct" in factors
    assert "velocity_anomaly_contrib_pct" in factors
    assert "primary_driver" in factors
