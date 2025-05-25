from pydantic_settings import BaseSettings
from typing import List
import secrets
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "IRHIS"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", secrets.token_urlsafe(32))
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./irhis.db")
    ALLOWED_ORIGINS: List[str] = ["*"]
    ALLOWED_HOSTS: List[str] = ["*"]
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG_MODE: bool = True
    DATA_RETENTION_DAYS: int = 365 * 2 
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
    CLOUD_PROVIDER: str = os.getenv("CLOUD_PROVIDER", "aws") 
    CLOUD_REGION: str = os.getenv("CLOUD_REGION", "us-east-1")
    S3_BUCKET_NAME: str = os.getenv("S3_BUCKET_NAME", "irhis-data")
    S3_ACCESS_KEY: str = os.getenv("S3_ACCESS_KEY", "")
    S3_SECRET_KEY: str = os.getenv("S3_SECRET_KEY", "")
    QUEUE_URL: str = os.getenv("QUEUE_URL", "")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    ENABLE_METRICS: bool = True
    METRICS_PORT: int = 9090

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
