import os
from pydantic import BaseModel


class Settings(BaseModel):
    PROJECT_NAME: str = "AERIS — AI-Powered Epidemic Risk Intelligence System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    SECRET_KEY: str = os.getenv("AERIS_SECRET_KEY", "aeris-sentinel-production-secret-key-change-in-env-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./aeris2.db")
    
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*",
    ]

    # OTP Service - Default verification OTP: "123456"
    DEFAULT_OTP: str = "123456"


settings = Settings()
