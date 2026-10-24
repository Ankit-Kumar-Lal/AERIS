import os
from pydantic import BaseModel


environment = os.getenv("ENVIRONMENT", "development").lower()
secret_key = os.getenv("AERIS_SECRET_KEY")

if environment == "production" and not secret_key:
    raise RuntimeError("Set AERIS_SECRET_KEY before starting in production.")

default_origins = (
    "http://localhost:5173,"
    "http://127.0.0.1:5173,"
    "http://localhost:3000,"
    "http://localhost:8000,"
    "http://127.0.0.1:8000"
)
allowed_origins = os.getenv("CORS_ORIGINS", default_origins)


class Settings(BaseModel):
    PROJECT_NAME: str = "AERIS — AI-Powered Epidemic Risk Intelligence System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    SECRET_KEY: str = secret_key or "local-development-only-change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./aeris2.db")

    CORS_ORIGINS: list[str] = [
        origin.strip()
        for origin in allowed_origins.split(",")
        if origin.strip()
    ]

    # Demo-only OTP. Do not use for real accounts.
    DEFAULT_OTP: str = os.getenv("DEFAULT_OTP", "123456")


settings = Settings()