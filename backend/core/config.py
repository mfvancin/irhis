from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "IRHIS API"
    API_V1_STR: str = "/api/v1"
    
    # Render DB settings from env vars, with local fallbacks
    DB_USER: str = os.getenv("DB_USER", "postgres")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "postgres")
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: str = os.getenv("DB_PORT", "5432")
    DB_NAME: str = os.getenv("DB_NAME", "irhis")
    
    @property
    def DATABASE_URL(self) -> str:
        # If running on Render, it provides a DATABASE_URL directly
        if "RENDER" in os.environ:
            return os.getenv("DATABASE_URL").replace("postgres://", "postgresql://", 1)
        
        # Local development connection string
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    SECRET_KEY: str = os.getenv("SECRET_KEY", "a_very_secret_key")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8 # 8 days
    
    ALLOWED_ORIGINS: list[str] = ["*"]
    
    HOST: str = "0.0.0.0"
    PORT: int = int(os.getenv("PORT", 8000))
    DEBUG_MODE: bool = os.getenv("DEBUG_MODE", "False").lower() in ("true", "1", "t")
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
