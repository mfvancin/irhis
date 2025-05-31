from pydantic_settings import BaseSettings
from typing import List, Optional
import secrets
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "IRHIS API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "irhis"
    POSTGRES_PORT: str = "5432"
    
    DIGITAL_TWIN_POSTGRES_SERVER: str = "localhost"
    DIGITAL_TWIN_POSTGRES_USER: str = "postgres"
    DIGITAL_TWIN_POSTGRES_PASSWORD: str = "postgres"
    DIGITAL_TWIN_POSTGRES_DB: str = "digital_twin"
    DIGITAL_TWIN_POSTGRES_PORT: str = "5433"
    
    DATABASE_URL: Optional[str] = None
    DIGITAL_TWIN_DATABASE_URL: Optional[str] = None
    
    SECRET_KEY: str = "your-secret-key-here"  # Change this in prod
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
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
    AZURE_TENANT_ID: str = os.getenv("AZURE_TENANT_ID", "")
    AZURE_CLIENT_ID: str = os.getenv("AZURE_CLIENT_ID", "")
    AZURE_CLIENT_SECRET: str = os.getenv("AZURE_CLIENT_SECRET", "")
    AZURE_SUBSCRIPTION_ID: str = os.getenv("AZURE_SUBSCRIPTION_ID", "")
    IOT_HUB_CONNECTION_STRING: str = os.getenv("IOT_HUB_CONNECTION_STRING", "")
    APP_SERVICE_NAME: str = os.getenv("APP_SERVICE_NAME", "")
    APP_SERVICE_RESOURCE_GROUP: str = os.getenv("APP_SERVICE_RESOURCE_GROUP", "")
    AZURE_DEVOPS_ORG: str = os.getenv("AZURE_DEVOPS_ORG", "")
    AZURE_DEVOPS_PAT: str = os.getenv("AZURE_DEVOPS_PAT", "")
    PHYSITRACK_API_KEY: str = os.getenv("PHYSITRACK_API_KEY", "")
    REHUB_API_KEY: str = os.getenv("REHUB_API_KEY", "")

    @property
    def get_database_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
    @property
    def get_digital_twin_database_url(self) -> str:
        if self.DIGITAL_TWIN_DATABASE_URL:
            return self.DIGITAL_TWIN_DATABASE_URL
        return f"postgresql://{self.DIGITAL_TWIN_POSTGRES_USER}:{self.DIGITAL_TWIN_POSTGRES_PASSWORD}@{self.DIGITAL_TWIN_POSTGRES_SERVER}:{self.DIGITAL_TWIN_POSTGRES_PORT}/{self.DIGITAL_TWIN_POSTGRES_DB}"

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
