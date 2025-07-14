# database.py
from pymongo import MongoClient, errors
from fastapi import HTTPException
from config import settings
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    client = MongoClient(settings.MONGO_URL, serverSelectionTimeoutMS=5000)
    client.server_info()  # Verificar conexión
    db = client[settings.DB_NAME]
    logger.info(f"Conectado exitosamente a MongoDB en {settings.MONGO_URL}")
except errors.ServerSelectionTimeoutError as err:
    logger.error("Error al conectar con MongoDB: %s", err)
    raise HTTPException(status_code=500, detail="No se pudo conectar con la base de datos")
