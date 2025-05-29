from pydantic_settings import BaseSettings
from typing import Optional

class AzureSettings(BaseSettings):
    """Azure IoT Hub configuration settings."""
    IOT_HUB_CONNECTION_STRING: Optional[str] = None
    IOT_HUB_HOSTNAME: Optional[str] = None
    IOT_HUB_SHARED_ACCESS_KEY: Optional[str] = None
    IOT_HUB_SHARED_ACCESS_KEY_NAME: Optional[str] = None
    IOT_HUB_DEVICE_ID: Optional[str] = None

    class Config:
        env_file = ".env"
        case_sensitive = True

azure_settings = AzureSettings() 