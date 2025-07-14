from fastapi import APIRouter, HTTPException
import asyncio
#from models.models import Pendientes
from bson import ObjectId
from database import db
from pydantic import BaseModel

class StatusUpdate(BaseModel):
    status: str

router = APIRouter()

@router.patch("/pendientes/{id}")
def actualizar_estado(id: str, datos: StatusUpdate):
    print(datos)
    try:
        resultado = db["trabajos"].update_one(
            {"_id": ObjectId(id)},
            {"$set": {"status": datos.status}}
        )
        if resultado.matched_count == 0:
            raise HTTPException(status_code=404, detail="Orden no encontrada")
        return {"mensaje": "Estado actualizado correctamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
