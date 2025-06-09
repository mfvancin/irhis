from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import PostgresDsn, field_validator, model_validator
from typing import Optional, Any
import os

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Core application settings
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days

    # Database settings (from individual env vars)
    DB_USER: str
    DB_PASSWORD: str
    DB_HOST: str
    DB_PORT: int
    DB_NAME: str
    
    # Assembled Database URL
    DATABASE_URL: Optional[PostgresDsn] = None

    @model_validator(mode='before')
    def assemble_db_connection(cls, v: Any) -> Any:
        if isinstance(v, dict) and 'DATABASE_URL' not in v:
            db_user = v.get('DB_USER')
            db_password = v.get('DB_PASSWORD')
            db_host = v.get('DB_HOST')
            db_port = v.get('DB_PORT')
            db_name = v.get('DB_NAME')
            
            if all([db_user, db_password, db_host, db_port, db_name]):
                v['DATABASE_URL'] = (
                    f"postgresql+psycopg2://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
                )
        return v
    
    # Local development settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG_MODE: bool = False
    
    # CORS settings
    ALLOWED_ORIGINS: list[str] = ["*"]

settings = Settings()
