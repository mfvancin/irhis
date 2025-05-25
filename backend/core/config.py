from pydantic_settings import BaseSettings
from typing import List
import secrets

class Settings(BaseSettings):
    PROJECT_NAME: str = "IRHIS"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    DATABASE_URL: str = "postgresql://user:password@localhost/irhis"
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "https://irhis.app"
    ]
    ALLOWED_HOSTS: List[str] = ["localhost", "irhis.app"]
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG_MODE: bool = True
    DATA_RETENTION_DAYS: int = 365 * 2  # 2 years
    ENCRYPTION_KEY: str = secrets.token_urlsafe(32)
    SMTP_TLS: bool = True
    SMTP_PORT: int = 587
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAILS_FROM_EMAIL: str = ""
    EMAILS_FROM_NAME: str = "IRHIS"
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    AZURE_STORAGE_CONNECTION_STRING: str = ""
    AZURE_STORAGE_CONTAINER: str = "irhis-data"

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
