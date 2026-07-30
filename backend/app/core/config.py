import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Smart Trolley OS Backend Gateway"
    API_V1_STR: str = "/api/v1"
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "*"
    ]
    DATA_PATH: str = os.getenv("DATA_PATH", "data/Cleaned_data.csv")

    class Config:
        case_sensitive = True

settings = Settings()
