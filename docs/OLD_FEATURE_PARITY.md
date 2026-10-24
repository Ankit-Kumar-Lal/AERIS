# AERIS — Feature Parity & Evolution Matrix

> **Source Reference:** Old AERIS Prototype (`reference/AERIS/`)  
> **Target Project:** AERIS (`aeris-2.0/`)  
> *"A risk signal is a prompt to verify, not a confirmed outbreak."*

---

## 1. Feature Parity Checklist

| Old Feature (reference/AERIS) | Old Code Location | AERIS Location | Status & Enhancement in AERIS |
|---|---|---|---|
| **Public Landing Page** | `frontend/src/pages/LandingPage.jsx` | `apps/web/src/pages/LandingPage.tsx` | ✅ Preserved & Elevated: Cinematic hero with flowing water canvas, live stats ticker, 4-step workflow stepper, live mini-map preview, coming soon rural ticker, AERIS branding. |
| **About Page / Vision** | `frontend/src/pages/AboutPage.jsx` | `apps/web/src/pages/AboutPage.tsx` | ✅ Preserved & Elevated: Grounded in public health presentation, public health AI ethics, decision-support notices, partner integration roadmap. |
| **Main Overview Dashboard** | `frontend/src/pages/Dashboard.jsx` | `apps/web/src/pages/Dashboard.tsx` | ✅ Preserved & Elevated: Animated count-up KPI cards, district filter chips, quick-action ribbon, live activity feed (WebSocket/SSE), top 5 attention villages with factor bars, disease breakdown chart. |
| **Monitored Villages Table** | `frontend/src/pages/Dashboard.jsx` | `apps/web/src/components/dashboard/VillageTable.tsx` | ✅ Preserved & Elevated: Village, District, State, Risk Level Badge, 7-day Cases, WQI, ML Probability, Action buttons, CSV/PDF export. |
| **Monsoon & Rainfall Trend Card** | `frontend/src/pages/Dashboard.jsx` | `apps/web/src/components/dashboard/RainfallTrendCard.tsx` | ✅ Preserved & Elevated: Interactive multi-district rainfall vs case overlay chart, flood warning threshold indicator. |
| **Interactive Map** | `frontend/src/pages/Dashboard.jsx` (Leaflet) | `apps/web/src/pages/MapPage.tsx` (MapLibre GL) | ✅ Preserved & Vastly Upgraded: 3D terrain hillshade of NE hills, clustering, heatmap layer, pulsing markers for high-risk, river & flood layer toggles, 8 NE states boundary GeoJSON, 30-day playback time slider, search & locate me. |
| **Symptom Report Form** | `frontend/src/pages/ReportForm.jsx` | `apps/web/src/pages/ReportWizardPage.tsx` | ✅ Preserved & Elevated: Multi-step guided wizard, GPS auto-detect, age groups, large icon tiles for symptoms, severity, water source, photo upload, voice note, IndexedDB offline queue with background auto-sync, tracking ID, emergency ORS triage tips. |
| **Water-Borne & AES Symptom Pool** | `backend/app/seed.py`, `ReportForm.jsx` | `apps/api/app/schemas/report.py`, `apps/web/src/constants/symptoms.ts` | ✅ Preserved 100%: Diarrhea, Vomiting, Dehydration, Abdominal Cramps, Enteric Fever, and secondary flood-linked AES (fever with neurological symptoms, altered sensorium). |
| **Alerts Management Page** | `frontend/src/pages/AlertPage.jsx` | `apps/web/src/pages/AlertsPage.tsx` | ✅ Preserved & Elevated: Active, Escalated, and Resolved tabs; threshold explanation in message; Notify Officials, Assign Field Team, Mark Verified, Mark Resolved; audio chime + live toast notifications; audit logging. |
| **Village Detail View** | `frontend/src/pages/VillageDetail.jsx` | `apps/web/src/pages/VillageDetailPage.tsx` | ✅ Preserved & Elevated: WQI gauge, 7-day & 30-day case trend charts, recent 20 reports, population, environmental telemetry, assigned ASHA, nearest health facility, recommended next steps checklist, PDF brief export. |
| **Explainable Risk Factors** | `backend/app/risk_engine.py`, `VillageDetail.jsx` | `apps/web/src/components/village/RiskExplainabilityPanel.tsx` | ✅ Preserved & Elevated: "Why this risk?" factor contribution bars, rule triggers, ML confidence, data timestamp, transparent uncertainty display. |
| **Dual-Engine Risk Scoring (Rules + ML)** | `backend/app/risk_engine.py` | `apps/api/app/services/risk_engine.py` | ✅ Preserved 100%: Rule engine (HIGH: cases>15 & WQI<50 & rain>400mm; MEDIUM: cases>8 or WQI<60; else LOW) + Scikit-Learn Logistic Regression (calibrated outbreak probability 0–100% + confidence index) + NEW rolling z-score anomaly velocity detector. |
| **3-Mode Theme Switcher** | `frontend/src/App.jsx`, `index.css` | `apps/web/src/context/ThemeContext.tsx`, `apps/web/src/index.css` | ✅ Preserved & Strictly Styled: Default Light (`--pale-green` bg, `--forest` text), Dark Mode (low-light field ops), High-Contrast Mode (sunlight-readable for ASHA field workers). Strictly bound to official Sentinel palette. |
| **Database Entities (5 Core Tables)** | `backend/app/models.py` | `apps/api/app/models/` | ✅ Preserved & Expanded: `locations`, `symptom_reports`, `environmental_data`, `risk_scores`, `alerts`. Enriched with `users`, `audit_logs`, `notifications`. |
| **Seed Data (Synthetic Telemetry)** | `backend/app/seed.py` | `apps/api/app/seed.py` | ✅ Preserved & Expanded: 8 Assam villages expanded to 36–40 realistic villages across all 8 NE states (Assam, Meghalaya, Tripura, Manipur, Arunachal Pradesh, Nagaland, Mizoram, Sikkim), plus Coming Soon villages and pre-seeded quick-access accounts. |
| **One-Command Launch Scripts** | `start_app.bat`, `requirements.txt` | `run_aeris.bat`, `run_aeris.sh`, `docker-compose.yml` | ✅ Preserved & Polished: Reliable Windows and Unix one-command launch scripts with automated DB setup, seed execution, and dual-server startup. |

---

## 2. Brand-New Features Added in AERIS

1. **Authentication & Identity Verification System:**
   - Role-based login and signup: `Civilian` vs `Official` (ASHA, NGO, Police, Govt Health, District Officer, Super Admin).
   - Phone OTP simulation with swappable SMS gateway interface.
   - Government ID validation with client and server checks:
     - Aadhaar: 12 digits with authentic **Verhoeff checksum**.
     - PAN: 5 letters + 4 digits + 1 letter.
     - Voter ID (EPIC): 3 letters + 7 digits.
     - Driving Licence: State code + RTO + year + serial.
   - Privacy-safe storage: salted SHA-256 hash + masked display (`XXXX-XXXX-1234`), zero plain-text IDs.
   - Official Account Verification Workflow (`PENDING_VERIFICATION` → Admin Approval → `APPROVED`/`REJECTED`).

2. **Anti-Fake Reporting & Trust Mechanics:**
   - Rate limiting per user and device.
   - Duplicate report suppression (same user, village, symptom cluster within 24 hours).
   - Dynamic reporter trust scoring.
   - Verification status: Civilian reports enter as `unverified` and require ASHA / Official verification.
   - Geo-consistency validation: flags reports submitted far from registered home village.

3. **MapLibre GL 3D Map Architecture:**
   - Native WebGL vector mapping with NE terrain hillshading.
   - 8 Northeast India state boundaries GeoJSON layer.
   - Risk heatmaps, cluster bubbles, water body overlays, pulsing risk rings.
   - 30-day historical time-scrubber slider.

4. **Offline-First PWA & Background Sync:**
   - IndexedDB report submission queue.
   - Service worker app shell caching.
   - Automatic re-sync when internet connectivity is re-established in remote rural pockets.

5. **Outbreak Simulation Sandbox:**
   - Admin tool to inject realistic epidemic surges into any chosen village.
   - Live observation of risk score elevation, alert generation, and push notification broadcast.

6. **Water Quality & Weather Dedicated Intelligence Center:**
   - Comprehensive water-source monitoring (tube well, pond, river, piped supply).
   - Physico-chemical telemetry (pH, turbidity NTU, chlorine ppm, pathogen load).
   - 3–5 day predictive risk outlook.

7. **Advanced Public Health Analytics:**
   - Lead time, Sensitivity, False-Alert Rate, and Village Coverage tracking.
   - Anomaly detection with daily rolling z-scores.
   - State-by-state comparative matrices.

8. **Multilingual Localization (i18n):**
   - English, Hindi, and Assamese fully supported, extensible to other NE languages.
