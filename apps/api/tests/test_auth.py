import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "AERIS" in data["system"]
    assert "2.0" not in data["system"]
    assert data["status"] == "Operational"


def test_login_demo_civilian():
    response = client.post("/api/v1/auth/login", json={
        "identifier": "+919876543210",
        "password": "Sentinel@123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "CIVILIAN"
    assert data["user"]["verification_status"] == "APPROVED"


def test_login_demo_official():
    response = client.post("/api/v1/auth/login", json={
        "identifier": "officer@sentinel.org",
        "password": "Sentinel@123"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["role"] == "HEALTH_OFFICIAL"


def test_relaxed_aadhaar_verification():
    # Exactly 12 digits, doesn't start with 0 or 1, even if invalid Verhoeff checksum
    response = client.post("/api/v1/auth/validate-id?id_type=aadhaar&id_number=234567890123")
    assert response.status_code == 200
    data = response.json()
    assert data["is_valid_format"] is True
    assert data["is_verified"] is True
    assert data["provider"] == "Aadhaar Verification"
    assert data["message"] == "Aadhaar verified successfully."

    # Hyphens and spaces allowed
    response = client.post("/api/v1/auth/validate-id?id_type=aadhaar&id_number=2345-6789-0123")
    assert response.status_code == 200
    data = response.json()
    assert data["is_valid_format"] is True
    assert data["is_verified"] is True

    # Rejection: starts with 0 or 1
    response = client.post("/api/v1/auth/validate-id?id_type=aadhaar&id_number=034567890123")
    data = response.json()
    assert data["is_valid_format"] is False
    assert data["message"] == "Aadhaar must be exactly 12 digits."

    # Rejection: not 12 digits
    response = client.post("/api/v1/auth/validate-id?id_type=aadhaar&id_number=234567")
    data = response.json()
    assert data["is_valid_format"] is False
    assert data["message"] == "Aadhaar must be exactly 12 digits."


def test_relaxed_pan_verification():
    # Valid PAN (case-insensitive)
    response = client.post("/api/v1/auth/validate-id?id_type=pan&id_number=abcde1234f")
    assert response.status_code == 200
    data = response.json()
    assert data["is_valid_format"] is True
    assert data["is_verified"] is True
    assert data["provider"] == "PAN Verification"

    # Invalid PAN format
    response = client.post("/api/v1/auth/validate-id?id_type=pan&id_number=12345ABCDE")
    data = response.json()
    assert data["is_valid_format"] is False


def test_relaxed_official_id_verification():
    # Valid official ID
    response = client.post("/api/v1/auth/validate-id?id_type=official_id&id_number=ASHA-LKP/2026-01")
    assert response.status_code == 200
    data = response.json()
    assert data["is_valid_format"] is True
    assert data["is_verified"] is True

    # Invalid characters
    response = client.post("/api/v1/auth/validate-id?id_type=official_id&id_number=ASHA@#$")
    data = response.json()
    assert data["is_valid_format"] is False


def test_list_locations():
    response = client.get("/api/v1/locations")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 40
    # Check that each village has risk level and WQI
    first = data[0]
    assert "current_risk_level" in first
    assert "latest_wqi" in first
    assert "ml_risk_probability" in first


def test_analytics_summary():
    response = client.get("/api/v1/analytics/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["monitored_villages_count"] >= 40
    assert "validation_metrics" in data
    assert data["validation_metrics"]["sensitivity_pct"] == 89.4
