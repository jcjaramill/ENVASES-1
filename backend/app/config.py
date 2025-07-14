# config.py
import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/mantencion?authSource=admin")
    DB_NAME = os.getenv("DB_NAME", "mantencion")
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

settings = Settings()
