from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "TwinRehab"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str  
    ACCESS_TOKEN: str = None
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ALGORITHM: str = "HS256"
    SECRET_KEY: str = "your-secret-key"
    BACKEND_CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://192.168.1.190:3000",
        "http://192.168.1.190:8081",
        "exp://192.168.1.190:8081"
    ]
    GOOGLE_CLIENT_ID_IOS: str
    GOOGLE_CLIENT_ID_ANDROID: str

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
