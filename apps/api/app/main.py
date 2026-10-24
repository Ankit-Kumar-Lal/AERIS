import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .core.config import settings
from .database import engine, Base
from .services.risk_engine import _train_ml_risk_model
from .routers import auth, locations, reports, alerts, risk, environmental, analytics, users, ws, news


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure database schema is created
    Base.metadata.create_all(bind=engine)
    # Pre-train and calibrate the Scikit-Learn ML risk model
    _train_ml_risk_model()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API for AERIS: AI-Powered Epidemic Risk Intelligence & Response System for Northeast India Water-Borne Disease Surveillance",
    lifespan=lifespan
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all API routers under /api/v1
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(locations.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(alerts.router, prefix=settings.API_V1_STR)
app.include_router(risk.router, prefix=settings.API_V1_STR)
app.include_router(environmental.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(news.router, prefix=settings.API_V1_STR)
app.include_router(news.router, prefix="/api")
app.include_router(ws.router)

# Mount static web build if present (for single-command unified server mode)
WEB_DIST_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "web", "dist"))
if os.path.exists(WEB_DIST_DIR):
    app.mount("/app", StaticFiles(directory=WEB_DIST_DIR, html=True), name="web_dist")


@app.get("/")
def read_root():
    return {
        "system": "AERIS — AI-Powered Epidemic Risk Intelligence & Response System",
        "platform": "AERIS",
        "status": "Operational",
        "philosophy": "A risk signal is a prompt to verify, not a confirmed outbreak.",
        "dual_engine": {
            "authoritative": "Deterministic Public Health Rule Engine (Cases > 15 & WQI < 50 & Rain > 400mm)",
            "ml_layer": "Scikit-Learn Calibrated Logistic Regression + Rolling Z-Score Anomaly Detection"
        },
        "coverage": "8 Northeast India States (Assam, Meghalaya, Tripura, Manipur, Arunachal Pradesh, Nagaland, Mizoram, Sikkim)",
        "docs": "/docs",
        "api_v1": settings.API_V1_STR
    }


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "AERIS API"}
