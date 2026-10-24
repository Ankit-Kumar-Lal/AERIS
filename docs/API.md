# AERIS — REST & WebSocket API Specification

> **Base URL (Local):** `http://localhost:8000/api`  
> **Interactive Swagger UI:** `http://localhost:8000/docs`  
> **ReDoc Documentation:** `http://localhost:8000/redoc`  
> **WebSocket Stream:** `ws://localhost:8000/ws`

---

## 1. Authentication & Security

All protected endpoints require an HTTP `Authorization` header containing a valid Bearer token:
```http
Authorization: Bearer <jwt_access_token>
```

### 1.1 `POST /auth/register`
Register a new Civilian or Official Sentinel account.

**Request Body:**
```json
{
  "full_name": "Rimpi Saikia",
  "email": "rimpi@sentinel.org",
  "phone_number": "+919876543210",
  "password": "StrongPassword@123",
  "role": "ASHA_WORKER",
  "official_id_type": "AADHAAR",
  "official_id_number": "312345678906",
  "state": "Assam",
  "district": "Majuli",
  "village": "Jengraimukh",
  "designation": "Lead Community Health Worker",
  "department": "National Health Mission Assam"
}
```

*Note: Aadhaar numbers undergo mathematical Verhoeff D5 checksum verification before acceptance.*

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "token_type": "bearer",
  "user": {
    "id": 14,
    "full_name": "Rimpi Saikia",
    "email": "rimpi@sentinel.org",
    "role": "ASHA_WORKER",
    "verification_status": "PENDING_VERIFICATION",
    "official_id_masked": "XXXX-XXXX-8906"
  }
}
```

---

### 1.2 `POST /auth/login`
Authenticate using email or phone number and password.

**Request Body:**
```json
{
  "identifier": "admin@sentinel.org",
  "password": "Sentinel@123"
}
```

---

## 2. Geospatial & Locations

### 2.1 `GET /locations`
Fetch monitored villages with latest epidemiological state.

**Query Parameters:**
- `state` (optional): Filter by NE state (e.g., `Assam`, `Meghalaya`, `Tripura`).
- `district` (optional): Filter by district name.
- `risk_level` (optional): `HIGH`, `MEDIUM`, or `LOW`.
- `status_filter` (optional): `active` or `coming_soon`.

**Response (200 OK):**
```json
[
  {
    "location_id": 1,
    "name": "Jengraimukh",
    "district": "Majuli",
    "state": "Assam",
    "latitude": 27.012,
    "longitude": 94.254,
    "population": 4820,
    "status": "active",
    "terrain_type": "Riverine Island",
    "primary_water_source": "Shallow Tube Well & River",
    "nearest_health_facility": "Majuli Sub-Divisional Hospital (12 km)",
    "asha_count": 4,
    "current_risk_level": "HIGH",
    "case_count_7day": 19,
    "ml_risk_probability": 88.4,
    "ml_confidence": "High",
    "latest_wqi": 41.2,
    "latest_rainfall": 482.0,
    "active_alerts_count": 1
  }
]
```

### 2.2 `GET /locations/{location_id}`
Comprehensive village detail packet including historical 30-day telemetry, recent syndromic reports, and factor attribution.

---

## 3. Syndromic Reporting & Field Ingestion

### 3.1 `POST /reports`
Log a new clinical field report.

**Request Body:**
```json
{
  "location_id": 1,
  "patient_age_group": "UNDER_5",
  "primary_symptom": "Acute Diarrhoea",
  "additional_symptoms": ["Vomiting", "Severe Dehydration"],
  "severity": "severe",
  "suspected_water_source": "Community Pond",
  "device_lat": 27.013,
  "device_lon": 94.252,
  "notes": "Patient severely lethargic, administered initial ORS packet."
}
```

**Response (201 Created):**
```json
{
  "report_id": 412,
  "tracking_id": "REP-2026-MJL-8941",
  "verification_status": "verified",
  "anti_fake_flags": [],
  "message": "Report ingested and dispatched to dual-engine risk surveillance."
}
```

---

## 4. Alerts & Action Workflows

### 4.1 `GET /alerts`
List public health alerts.

**Query Parameters:**
- `status_filter`: `active`, `escalated`, or `resolved`.

### 4.2 `POST /alerts/{alert_id}/action`
Execute a clinical rapid response action.

**Request Body:**
```json
{
  "action": "NOTIFY_OFFICIALS",
  "notes": "Dispatched Mobile Water Purification Van and ORS replenishment unit."
}
```

---

## 5. Outbreak Simulation Sandbox

### 5.1 `POST /risk/simulate-outbreak`
Administrators and authorized public health officers can inject an outbreak simulation surge into any monitored village to observe instant risk score elevation, alert broadcast, and notification events.

**Request Body:**
```json
{
  "location_id": 1,
  "surge_case_count": 22,
  "wqi_drop": 29.5,
  "rainfall_surge_mm": 510.0
}
```

---

## 6. Live WebSocket Event Bus (`/ws`)

Clients connect via `ws://localhost:8000/ws` to receive instant real-time telemetry.

**Sample Event Payload:**
```json
{
  "type": "NEW_SYMPTOM_REPORT",
  "data": {
    "report_id": 412,
    "location_id": 1,
    "village_name": "Jengraimukh",
    "symptom": "Acute Diarrhoea",
    "severity": "severe",
    "timestamp": "2026-10-22T17:05:00Z"
  }
}
```
