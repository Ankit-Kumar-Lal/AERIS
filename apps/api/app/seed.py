import datetime
import random
from sqlalchemy.orm import Session
from .database import Base, engine, SessionLocal
from .models.user import User, UserRole, VerificationStatus
from .models.location import Location, LocationStatus
from .models.symptom_report import SymptomReport, ReportVerificationStatus
from .models.environmental_data import EnvironmentalData
from .models.risk_score import RiskScore
from .models.alert import Alert, AlertStatus, AlertSeverity
from .models.audit_log import AuditLog
from .models.notification import Notification
from .core.security import get_password_hash
from .core.id_verification import hash_id_number, mask_id_number, IdType
from .core.verhoeff import generate_valid_aadhaar
from .services.risk_engine import compute_risk_scores_for_all_locations

# 40 Realistic Sentinel Villages across all 8 Northeast India States
SEED_VILLAGES = [
    # 1. ASSAM
    {"name": "Dhakuakhana", "district": "Lakhimpur", "state": "Assam", "lat": 27.25, "lng": 94.45, "pop": 45000, "status": "active", "target_risk": "high", "target_cases": 24, "wqi": 36.0, "rain": 490.0, "facility": "Dhakuakhana Sub-Div Civil Hospital (3.2 km)", "terrain": "Brahmaputra Flood Plain Basin"},
    {"name": "Majuli", "district": "Majuli", "state": "Assam", "lat": 26.95, "lng": 94.17, "pop": 42000, "status": "active", "target_risk": "low", "target_cases": 4, "wqi": 74.0, "rain": 180.0, "facility": "Garamur Model Hospital (4.5 km)", "terrain": "River Island Alluvial Catchment"},
    {"name": "Mayong", "district": "Morigaon", "state": "Assam", "lat": 26.15, "lng": 92.35, "pop": 31000, "status": "active", "target_risk": "medium", "target_cases": 11, "wqi": 52.0, "rain": 260.0, "facility": "Mayong Community Health Centre (2.1 km)", "terrain": "Kopili Lowland Wetland"},
    {"name": "Kaliabor", "district": "Nagaon", "state": "Assam", "lat": 26.45, "lng": 92.60, "pop": 52000, "status": "active", "target_risk": "low", "target_cases": 3, "wqi": 78.0, "rain": 150.0, "facility": "Kaliabor Sub-Divisional Hospital (1.8 km)", "terrain": "Central Assam Foothills Catchment"},
    {"name": "Bilasipara", "district": "Dhubri", "state": "Assam", "lat": 26.23, "lng": 90.23, "pop": 61000, "status": "active", "target_risk": "medium", "target_cases": 13, "wqi": 54.0, "rain": 290.0, "facility": "Bilasipara Model Hospital (2.5 km)", "terrain": "Lower Brahmaputra Riparian Zone"},

    # 2. MEGHALAYA
    {"name": "Mawlynnong", "district": "East Khasi Hills", "state": "Meghalaya", "lat": 25.20, "lng": 91.88, "pop": 18000, "status": "active", "target_risk": "low", "target_cases": 2, "wqi": 86.0, "rain": 210.0, "facility": "Pynursla Community Health Centre (8.4 km)", "terrain": "Sub-Tropical High Ridge Plateau"},
    {"name": "Mawsynram", "district": "East Khasi Hills", "state": "Meghalaya", "lat": 25.30, "lng": 91.58, "pop": 22000, "status": "active", "target_risk": "high", "target_cases": 19, "wqi": 38.0, "rain": 530.0, "facility": "Mawsynram PHC (1.5 km)", "terrain": "Ultra-High Precipitation Karst Gorge"},
    {"name": "Sohra (Cherrapunji)", "district": "East Khasi Hills", "state": "Meghalaya", "lat": 25.27, "lng": 91.73, "pop": 29000, "status": "active", "target_risk": "medium", "target_cases": 9, "wqi": 58.0, "rain": 380.0, "facility": "Sohra Civil Hospital (2.0 km)", "terrain": "Himalayan Rainshadow Escarpment"},
    {"name": "Nongriat", "district": "East Khasi Hills", "state": "Meghalaya", "lat": 25.25, "lng": 91.67, "pop": 12000, "status": "active", "target_risk": "low", "target_cases": 3, "wqi": 79.0, "rain": 240.0, "facility": "Sohra Sub-Centre (6.2 km)", "terrain": "Deep River Canyon Rainforest"},
    {"name": "Dawki", "district": "West Jaintia Hills", "state": "Meghalaya", "lat": 25.18, "lng": 92.02, "pop": 16000, "status": "active", "target_risk": "low", "target_cases": 4, "wqi": 82.0, "rain": 190.0, "facility": "Dawki Border PHC (1.1 km)", "terrain": "Umngot River Fluvial Basin"},

    # 3. TRIPURA
    {"name": "Amarpur", "district": "Gomati", "state": "Tripura", "lat": 23.53, "lng": 91.64, "pop": 28000, "status": "active", "target_risk": "medium", "target_cases": 12, "wqi": 56.0, "rain": 270.0, "facility": "Amarpur Sub-Divisional Hospital (1.9 km)", "terrain": "Gomati River Flood Catchment"},
    {"name": "Kamalpur", "district": "Dhalai", "state": "Tripura", "lat": 24.20, "lng": 91.83, "pop": 34000, "status": "active", "target_risk": "high", "target_cases": 21, "wqi": 34.0, "rain": 460.0, "facility": "Dhalai District Hospital (3.4 km)", "terrain": "Dhalai Valley Alluvial Basin"},
    {"name": "Teliamura", "district": "Khowai", "state": "Tripura", "lat": 23.83, "lng": 91.60, "pop": 39000, "status": "active", "target_risk": "low", "target_cases": 5, "wqi": 72.0, "rain": 160.0, "facility": "Teliamura Sub-Div Hospital (1.4 km)", "terrain": "Khowai River Catchment Basin"},
    {"name": "Belonia", "district": "South Tripura", "state": "Tripura", "lat": 23.25, "lng": 91.45, "pop": 32000, "status": "active", "target_risk": "medium", "target_cases": 10, "wqi": 57.0, "rain": 240.0, "facility": "South Tripura District Hospital (2.8 km)", "terrain": "Muhuri River Basin"},
    {"name": "Sabroom", "district": "South Tripura", "state": "Tripura", "lat": 23.00, "lng": 91.73, "pop": 25000, "status": "active", "target_risk": "low", "target_cases": 3, "wqi": 76.0, "rain": 180.0, "facility": "Sabroom Rural Hospital (2.0 km)", "terrain": "Feni River Border Basin"},

    # 4. MANIPUR
    {"name": "Moirang", "district": "Bishnupur", "state": "Manipur", "lat": 24.50, "lng": 93.77, "pop": 35000, "status": "active", "target_risk": "high", "target_cases": 18, "wqi": 40.0, "rain": 440.0, "facility": "Moirang Community Health Centre (1.7 km)", "terrain": "Loktak Lake Freshwater Wetland"},
    {"name": "Thanga (Loktak)", "district": "Bishnupur", "state": "Manipur", "lat": 24.53, "lng": 93.83, "pop": 19000, "status": "active", "target_risk": "medium", "target_cases": 10, "wqi": 55.0, "rain": 280.0, "facility": "Thanga PHC (0.9 km)", "terrain": "Floating Phumdi Lacustrine Marsh"},
    {"name": "Ukhrul", "district": "Ukhrul", "state": "Manipur", "lat": 25.11, "lng": 94.36, "pop": 41000, "status": "active", "target_risk": "low", "target_cases": 4, "wqi": 79.0, "rain": 140.0, "facility": "Ukhrul District Hospital (2.5 km)", "terrain": "Naga Hills Mountain Range"},
    {"name": "Sugnu", "district": "Kakching", "state": "Manipur", "lat": 24.28, "lng": 93.87, "pop": 23000, "status": "active", "target_risk": "medium", "target_cases": 9, "wqi": 58.0, "rain": 250.0, "facility": "Kakching Civil Hospital (5.0 km)", "terrain": "Manipur River Meander Basin"},
    {"name": "Bishnupur", "district": "Bishnupur", "state": "Manipur", "lat": 24.63, "lng": 93.76, "pop": 37000, "status": "active", "target_risk": "low", "target_cases": 4, "wqi": 75.0, "rain": 170.0, "facility": "Bishnupur District Hospital (1.2 km)", "terrain": "Valley Piedmont Catchment"},

    # 5. ARUNACHAL PRADESH
    {"name": "Ziro", "district": "Lower Subansiri", "state": "Arunachal Pradesh", "lat": 27.53, "lng": 93.83, "pop": 26000, "status": "active", "target_risk": "low", "target_cases": 2, "wqi": 84.0, "rain": 190.0, "facility": "Ziro General Hospital (2.3 km)", "terrain": "Sub-Himalayan Apatani Plateau"},
    {"name": "Tawang", "district": "Tawang", "state": "Arunachal Pradesh", "lat": 27.58, "lng": 91.86, "pop": 30000, "status": "active", "target_risk": "low", "target_cases": 1, "wqi": 88.0, "rain": 110.0, "facility": "Khandro Drowa Yangey Hospital (1.5 km)", "terrain": "High-Altitude Glacial Stream Basin"},
    {"name": "Pasighat", "district": "East Siang", "state": "Arunachal Pradesh", "lat": 28.07, "lng": 95.33, "pop": 38000, "status": "active", "target_risk": "high", "target_cases": 20, "wqi": 37.0, "rain": 510.0, "facility": "Bakin Pertin General Hospital (2.0 km)", "terrain": "Siang River Himalayan Runoff Delta"},
    {"name": "Along", "district": "West Siang", "state": "Arunachal Pradesh", "lat": 28.18, "lng": 94.80, "pop": 27000, "status": "active", "target_risk": "medium", "target_cases": 9, "wqi": 59.0, "rain": 310.0, "facility": "Along General Hospital (1.8 km)", "terrain": "Yomgo River Valley"},
    {"name": "Roing", "district": "Lower Dibang Valley", "state": "Arunachal Pradesh", "lat": 28.14, "lng": 95.83, "pop": 22000, "status": "active", "target_risk": "medium", "target_cases": 11, "wqi": 53.0, "rain": 330.0, "facility": "Roing District Hospital (1.6 km)", "terrain": "Dibang River Alluvial Fan"},

    # 6. NAGALAND
    {"name": "Khonoma", "district": "Kohima", "state": "Nagaland", "lat": 25.65, "lng": 94.02, "pop": 17000, "status": "active", "target_risk": "low", "target_cases": 2, "wqi": 81.0, "rain": 160.0, "facility": "Khonoma PHC (0.8 km)", "terrain": "Terraced Mountain Eco-Habitat"},
    {"name": "Longwa", "district": "Mon", "state": "Nagaland", "lat": 26.85, "lng": 95.12, "pop": 21000, "status": "active", "target_risk": "medium", "target_cases": 10, "wqi": 54.0, "rain": 260.0, "facility": "Mon District Hospital (14.2 km)", "terrain": "Indo-Myanmar Border Ridge"},
    {"name": "Mon town", "district": "Mon", "state": "Nagaland", "lat": 26.75, "lng": 95.06, "pop": 36000, "status": "active", "target_risk": "high", "target_cases": 17, "wqi": 41.0, "rain": 430.0, "facility": "Mon Civil Hospital (1.1 km)", "terrain": "Tizit River Sub-Catchment"},
    {"name": "Tuensang", "district": "Tuensang", "state": "Nagaland", "lat": 26.28, "lng": 94.83, "pop": 39000, "status": "active", "target_risk": "medium", "target_cases": 8, "wqi": 60.0, "rain": 240.0, "facility": "Tuensang Civil Hospital (2.1 km)", "terrain": "Eastern Naga Highlands"},
    {"name": "Mokokchung", "district": "Mokokchung", "state": "Nagaland", "lat": 26.32, "lng": 94.52, "pop": 42000, "status": "active", "target_risk": "low", "target_cases": 4, "wqi": 78.0, "rain": 170.0, "facility": "Imkongliba Memorial Hospital (1.7 km)", "terrain": "Milak River Ridge Catchment"},

    # 7. MIZORAM
    {"name": "Reiek", "district": "Mamit", "state": "Mizoram", "lat": 23.68, "lng": 92.60, "pop": 15000, "status": "active", "target_risk": "low", "target_cases": 2, "wqi": 85.0, "rain": 150.0, "facility": "Reiek PHC (1.0 km)", "terrain": "Tlawng Western Ridge"},
    {"name": "Thenzawl", "district": "Serchhip", "state": "Mizoram", "lat": 23.31, "lng": 92.76, "pop": 21000, "status": "active", "target_risk": "low", "target_cases": 3, "wqi": 77.0, "rain": 190.0, "facility": "Thenzawl CHC (1.4 km)", "terrain": "Lau River Valley Plain"},
    {"name": "Champhai", "district": "Champhai", "state": "Mizoram", "lat": 23.47, "lng": 93.33, "pop": 38000, "status": "active", "target_risk": "medium", "target_cases": 11, "wqi": 56.0, "rain": 270.0, "facility": "Champhai District Hospital (1.9 km)", "terrain": "Tiau River Valley Floodplain"},
    {"name": "Lunglei", "district": "Lunglei", "state": "Mizoram", "lat": 22.88, "lng": 92.73, "pop": 57000, "status": "active", "target_risk": "high", "target_cases": 18, "wqi": 43.0, "rain": 450.0, "facility": "Lunglei Civil Hospital (2.2 km)", "terrain": "South Mizoram Watershed Catchment"},
    {"name": "Serchhip", "district": "Serchhip", "state": "Mizoram", "lat": 23.34, "lng": 92.85, "pop": 24000, "status": "active", "target_risk": "low", "target_cases": 3, "wqi": 79.0, "rain": 180.0, "facility": "Serchhip District Hospital (1.5 km)", "terrain": "Mat River Highland Basin"},

    # 8. SIKKIM
    {"name": "Lachung", "district": "North Sikkim", "state": "Sikkim", "lat": 27.68, "lng": 88.75, "pop": 12000, "status": "active", "target_risk": "low", "target_cases": 1, "wqi": 90.0, "rain": 130.0, "facility": "Lachung Military & Tribal PHC (1.2 km)", "terrain": "Lachung Chu Glacial Gorge"},
    {"name": "Yuksom", "district": "West Sikkim", "state": "Sikkim", "lat": 27.37, "lng": 88.22, "pop": 14000, "status": "active", "target_risk": "low", "target_cases": 2, "wqi": 83.0, "rain": 170.0, "facility": "Yuksom Primary Health Centre (1.1 km)", "terrain": "Khangchendzonga Foothill Basin"},
    {"name": "Pelling", "district": "West Sikkim", "state": "Sikkim", "lat": 27.30, "lng": 88.23, "pop": 18000, "status": "active", "target_risk": "low", "target_cases": 3, "wqi": 79.0, "rain": 160.0, "facility": "Gyalshing District Hospital (4.5 km)", "terrain": "Western Ridge Mountain Catchment"},
    {"name": "Ravangla", "district": "South Sikkim", "state": "Sikkim", "lat": 27.30, "lng": 88.36, "pop": 22000, "status": "active", "target_risk": "medium", "target_cases": 8, "wqi": 59.0, "rain": 250.0, "facility": "Ravangla Primary Health Centre (1.3 km)", "terrain": "Maenam Hill Ridge Watershed"},
    {"name": "Namchi", "district": "South Sikkim", "state": "Sikkim", "lat": 27.16, "lng": 88.35, "pop": 34000, "status": "active", "target_risk": "high", "target_cases": 17, "wqi": 42.0, "rain": 420.0, "facility": "Namchi District Hospital (1.8 km)", "terrain": "Teesta Sub-Catchment Ravine"},

    # COMING SOON EXPANSION ZONES
    {"name": "Shillong Rural Catchment", "district": "East Khasi Hills", "state": "Meghalaya", "lat": 25.57, "lng": 91.89, "pop": 35000, "status": "coming_soon", "target_risk": "low", "target_cases": 0, "wqi": 75.0, "rain": 140.0, "facility": "Shillong Civil Hospital", "terrain": "Phase 2 Pipeline (Expansion Zone)"},
    {"name": "Agartala Howrah Basin", "district": "West Tripura", "state": "Tripura", "lat": 23.83, "lng": 91.28, "pop": 48000, "status": "coming_soon", "target_risk": "low", "target_cases": 0, "wqi": 70.0, "rain": 150.0, "facility": "Agartala Govt Medical College", "terrain": "Phase 2 Pipeline (Expansion Zone)"},
    {"name": "Imphal Valley Lowlands", "district": "Imphal West", "state": "Manipur", "lat": 24.81, "lng": 93.93, "pop": 52000, "status": "coming_soon", "target_risk": "low", "target_cases": 0, "wqi": 72.0, "rain": 160.0, "facility": "RIMS Regional Institute", "terrain": "Phase 2 Pipeline (Expansion Zone)"},
    {"name": "Itanagar Papum Pare Rural", "district": "Papum Pare", "state": "Arunachal Pradesh", "lat": 27.08, "lng": 93.60, "pop": 31000, "status": "coming_soon", "target_risk": "low", "target_cases": 0, "wqi": 78.0, "rain": 170.0, "facility": "Tomo Riba Institute (TRIHMS)", "terrain": "Phase 2 Pipeline (Expansion Zone)"},
    {"name": "Kohima Highland Villages", "district": "Kohima", "state": "Nagaland", "lat": 25.67, "lng": 94.10, "pop": 33000, "status": "coming_soon", "target_risk": "low", "target_cases": 0, "wqi": 80.0, "rain": 130.0, "facility": "Naga Hospital Authority Kohima", "terrain": "Phase 2 Pipeline (Expansion Zone)"},
    {"name": "Aizawl Tlawng Rural", "district": "Aizawl", "state": "Mizoram", "lat": 23.72, "lng": 92.71, "pop": 44000, "status": "coming_soon", "target_risk": "low", "target_cases": 0, "wqi": 76.0, "rain": 160.0, "facility": "Zoram Medical College (Falkawn)", "terrain": "Phase 2 Pipeline (Expansion Zone)"},
    {"name": "Gangtok Teesta Rural", "district": "East Sikkim", "state": "Sikkim", "lat": 27.33, "lng": 88.60, "pop": 29000, "status": "coming_soon", "target_risk": "low", "target_cases": 0, "wqi": 82.0, "rain": 120.0, "facility": "STNM Multi-Speciality Hospital", "terrain": "Phase 2 Pipeline (Expansion Zone)"},
]

# Water-borne symptom clusters prioritized
SYMPTOM_CLUSTERS = [
    ["diarrhea", "vomiting"],
    ["diarrhea", "dehydration"],
    ["vomiting", "dehydration", "abdominal_pain"],
    ["diarrhea", "abdominal_pain"],
    ["diarrhea", "fever", "vomiting"],
    ["vomiting", "fever"],
    ["diarrhea"],
    ["fever_with_neurological_symptoms", "high_fever", "altered_sensorium"],  # AES flood-linked flag
]

WATER_SOURCES = ["Community Tube Well", "Pond Water", "River / Stream", "Public Standpost Piped Supply", "Rainwater Harvesting Tank"]
AGE_GROUPS = ["under_5", "5_18", "18_60", "60_plus"]
SEVERITIES = ["mild", "moderate", "severe"]


def seed_database():
    print("[AERIS Seeder] Resetting database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    now = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)

    print("[AERIS Seeder] Creating default access accounts...")
    demo_password_hash = get_password_hash("Sentinel@123")

    # 1. Civilian User
    demo_aadhaar = generate_valid_aadhaar("98765432101")
    civilian_user = User(
        phone_number="+919876543210",
        email="civilian@sentinel.org",
        full_name="Pranab Gogoi",
        hashed_password=demo_password_hash,
        role=UserRole.CIVILIAN.value,
        verification_status=VerificationStatus.APPROVED.value,
        state="Assam",
        district="Lakhimpur",
        village="Dhakuakhana",
        age=34,
        gender="Male",
        gov_id_type=IdType.AADHAAR.value,
        gov_id_masked=mask_id_number(IdType.AADHAAR.value, demo_aadhaar),
        gov_id_hash=hash_id_number(demo_aadhaar),
        is_id_verified=True,
        trust_score=0.95
    )
    db.add(civilian_user)

    # 2. ASHA Field Worker
    asha_user = User(
        phone_number="+919876543211",
        email="asha@sentinel.org",
        full_name="Anamika Saikia (ASHA)",
        hashed_password=demo_password_hash,
        role=UserRole.ASHA_NGO.value,
        verification_status=VerificationStatus.APPROVED.value,
        designation="Accredited Social Health Activist (ASHA)",
        department="National Health Mission (NHM Assam)",
        official_id_number="ASHA-LKP-2024-8841",
        supervisor_name="Dr. Hemanta Barua (MOIC)",
        state="Assam",
        district="Lakhimpur",
        village="Dhakuakhana",
        jurisdiction_villages=["Dhakuakhana", "Majuli"],
        gov_id_type=IdType.OFFICIAL_ID.value,
        gov_id_masked="ASHA-XXXX-8841",
        gov_id_hash=hash_id_number("ASHA-LKP-2024-8841"),
        is_id_verified=True,
        trust_score=1.00
    )
    db.add(asha_user)

    # 3. District Health Officer
    officer_user = User(
        phone_number="+919876543212",
        email="officer@sentinel.org",
        full_name="Dr. Bhupen Kalita",
        hashed_password=demo_password_hash,
        role=UserRole.HEALTH_OFFICIAL.value,
        verification_status=VerificationStatus.APPROVED.value,
        designation="District Surveillance Officer (IDSP)",
        department="Integrated Disease Surveillance Programme (IDSP)",
        official_id_number="IDSP-ASM-4421",
        state="Assam",
        district="Lakhimpur",
        jurisdiction_villages=["Dhakuakhana", "Majuli", "Mayong", "Kaliabor", "Bilasipara"],
        gov_id_type=IdType.OFFICIAL_ID.value,
        gov_id_masked="IDSP-XXXX-4421",
        gov_id_hash=hash_id_number("IDSP-ASM-4421"),
        is_id_verified=True,
        trust_score=1.00
    )
    db.add(officer_user)

    # 4. Super Admin
    admin_user = User(
        phone_number="+919876543213",
        email="admin@sentinel.org",
        full_name="Sentinel System Administrator",
        hashed_password=demo_password_hash,
        role=UserRole.SUPER_ADMIN.value,
        verification_status=VerificationStatus.APPROVED.value,
        designation="Chief Public Health Intelligence Architect",
        department="State Health Intelligence Unit",
        official_id_number="SENTINEL-ROOT-001",
        state="Assam",
        district="Guwahati Headquarter",
        gov_id_type=IdType.OFFICIAL_ID.value,
        gov_id_masked="SENTINEL-ROOT-001",
        gov_id_hash=hash_id_number("SENTINEL-ROOT-001"),
        is_id_verified=True,
        trust_score=1.00
    )
    db.add(admin_user)

    # 5. Pending Official (Official Verification Workflow)
    pending_user = User(
        phone_number="+919876543214",
        email="pending@sentinel.org",
        full_name="Rahul Sharma (Field NGO)",
        hashed_password=demo_password_hash,
        role=UserRole.ASHA_NGO.value,
        verification_status=VerificationStatus.PENDING_VERIFICATION.value,
        designation="Water Aid Northeast Coordinator",
        department="Arghyam Foundation / Rural Water NGO",
        official_id_number="NGO-DARPAN-AS-2026-993",
        supervisor_name="Sunita Rao",
        state="Assam",
        district="Morigaon",
        village="Mayong",
        jurisdiction_villages=["Mayong"],
        gov_id_type=IdType.OFFICIAL_ID.value,
        gov_id_masked="NGO-XXXX-993",
        gov_id_hash=hash_id_number("NGO-DARPAN-AS-2026-993"),
        is_id_verified=False,
        verification_notes="Awaiting credential cross-verification by District Admin.",
        trust_score=0.80
    )
    db.add(pending_user)
    db.commit()

    print("[AERIS Seeder] Seeding 47 locations across 8 Northeast States...")
    created_locations = []
    for v in SEED_VILLAGES:
        loc = Location(
            name=v["name"],
            district=v["district"],
            state=v["state"],
            latitude=v["lat"],
            longitude=v["lng"],
            population=v["pop"],
            status=v["status"],
            terrain_type=v["terrain"],
            nearest_health_facility=v["facility"],
            asha_count=random.randint(2, 6)
        )
        db.add(loc)
        db.flush()
        created_locations.append((loc, v))

    print("[AERIS Seeder] Generating historical 30-day telemetry, water quality, and symptom reports...")
    report_id_counter = 1000

    for loc, v in created_locations:
        if v["status"] == "coming_soon":
            continue

        target_risk = v.get("target_risk", "low")
        base_cases_7d = v.get("target_cases", 4)
        target_wqi = v.get("target_wqi", 75.0)
        target_rain_7d = v.get("rain", 150.0)

        # 1. Seed 30 days of environmental data (Daily rainfall & WQI)
        for day_offset in range(30, -1, -1):
            date_entry = now - datetime.timedelta(days=day_offset)
            is_recent_7d = day_offset <= 7

            if is_recent_7d:
                # Distribute 7-day cumulative rainfall
                daily_rain = round(target_rain_7d / 7.0 + random.uniform(-10.0, 10.0), 1)
                daily_rain = max(0.0, daily_rain)
                wqi = round(target_wqi + random.uniform(-2.0, 2.0), 1)
            else:
                # Historical baseline
                daily_rain = round(random.uniform(5.0, 35.0), 1)
                wqi = round(min(92.0, target_wqi + random.uniform(5.0, 15.0)), 1)

            # Physico-chemical properties
            if wqi < 50:
                ph = round(random.uniform(5.8, 6.4), 1)
                turbidity = round(random.uniform(18.0, 45.0), 1)
                chlorine = round(random.uniform(0.0, 0.05), 2)
                flood_level = "warning" if target_risk == "high" else "watch"
            elif wqi < 60:
                ph = round(random.uniform(6.4, 6.8), 1)
                turbidity = round(random.uniform(6.0, 14.0), 1)
                chlorine = round(random.uniform(0.05, 0.15), 2)
                flood_level = "watch"
            else:
                ph = round(random.uniform(7.0, 7.8), 1)
                turbidity = round(random.uniform(1.2, 4.0), 1)
                chlorine = round(random.uniform(0.2, 0.5), 2)
                flood_level = "normal"

            env = EnvironmentalData(
                location_id=loc.location_id,
                rainfall_mm=daily_rain,
                water_quality_index=max(15.0, min(100.0, wqi)),
                ph=ph,
                turbidity_ntu=turbidity,
                chlorine_ppm=chlorine,
                flood_risk_level=flood_level,
                water_source_tested=random.choice(WATER_SOURCES),
                recorded_at=date_entry
            )
            db.add(env)

        # 2. Seed Symptom Reports over the past 30 days
        # Generate reports in last 7 days to match target_cases_7d
        for r in range(base_cases_7d):
            report_id_counter += 1
            rand_days = random.uniform(0.1, 6.9)
            rpt_time = now - datetime.timedelta(days=rand_days)

            # Choose symptoms
            symptoms = random.choice(SYMPTOM_CLUSTERS)
            age = random.choice(AGE_GROUPS)
            
            if target_risk == "high":
                sev = random.choices(["moderate", "severe"], weights=[40, 60])[0]
                rep_type = random.choices(["citizen", "asha_worker"], weights=[30, 70])[0]
                status_rep = ReportVerificationStatus.VERIFIED.value
            elif target_risk == "medium":
                sev = random.choices(["mild", "moderate", "severe"], weights=[30, 50, 20])[0]
                rep_type = random.choices(["citizen", "asha_worker"], weights=[50, 50])[0]
                status_rep = random.choices([ReportVerificationStatus.VERIFIED.value, ReportVerificationStatus.UNVERIFIED.value], weights=[70, 30])[0]
            else:
                sev = random.choices(["mild", "moderate"], weights=[70, 30])[0]
                rep_type = "citizen"
                status_rep = ReportVerificationStatus.UNVERIFIED.value

            rpt = SymptomReport(
                location_id=loc.location_id,
                user_id=civilian_user.id if rep_type == "citizen" else asha_user.id,
                reporter_type=rep_type,
                symptoms=symptoms,
                patient_age_group=age,
                severity=sev,
                affected_count=random.randint(1, 3),
                water_source=random.choice(WATER_SOURCES),
                notes=f"Patient reported watery diarrhea and severe abdominal distress following recent local drinking water supply contamination." if "diarrhea" in symptoms else "Patient exhibiting sudden high fever and vomiting.",
                tracking_id=f"RPT-2026-{report_id_counter}",
                verification_status=status_rep,
                verified_by_id=asha_user.id if status_rep == ReportVerificationStatus.VERIFIED.value else None,
                verified_at=rpt_time if status_rep == ReportVerificationStatus.VERIFIED.value else None,
                verification_notes="Verified on-ground by assigned sentinel ASHA worker." if status_rep == ReportVerificationStatus.VERIFIED.value else None,
                trust_weight=1.0,
                reported_at=rpt_time
            )
            db.add(rpt)

        # Also add a few older reports (days 8-28) to give historical baseline
        older_count = random.randint(3, 8)
        for _ in range(older_count):
            report_id_counter += 1
            older_days = random.uniform(8.0, 28.0)
            rpt_time = now - datetime.timedelta(days=older_days)
            rpt = SymptomReport(
                location_id=loc.location_id,
                user_id=civilian_user.id,
                reporter_type="citizen",
                symptoms=random.choice(SYMPTOM_CLUSTERS[:4]),
                patient_age_group=random.choice(AGE_GROUPS),
                severity="mild",
                affected_count=1,
                water_source=random.choice(WATER_SOURCES),
                tracking_id=f"RPT-2026-{report_id_counter}",
                verification_status=ReportVerificationStatus.VERIFIED.value,
                verified_by_id=asha_user.id,
                reported_at=rpt_time
            )
            db.add(rpt)

    db.commit()

    print("[AERIS Seeder] Computing authoritative dual-engine risk scores for all villages...")
    compute_risk_scores_for_all_locations(db)

    print("[AERIS Seeder] Creating initial public health notifications and audit logs...")
    welcome_notif = Notification(
        title="AERIS Node Online",
        message="Epidemic Risk Intelligence system active across 8 Northeast India states with dual-engine verification.",
        notification_type="system",
        created_at=now
    )
    db.add(welcome_notif)

    audit = AuditLog(
        user_id=admin_user.id,
        action="SYSTEM_INITIALIZATION",
        entity_type="system",
        entity_id=1,
        details={"status": "Online", "villages_seeded": len(created_locations), "engine": "Dual-Engine Rules + Scikit-Learn"}
    )
    db.add(audit)
    db.commit()

    print("[AERIS Seeder] Database successfully seeded with 47 villages, test users, telemetry & alerts!")
    db.close()


if __name__ == "__main__":
    seed_database()
