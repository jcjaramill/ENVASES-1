# config.py
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Cargar archivo .env
load_dotenv()

class Settings(BaseSettings):
    MONGO_URL: str
    DB_NAME: str
    PORT: int = 8002

    class Config:
        env_file = ".env"

settings = Settings()

