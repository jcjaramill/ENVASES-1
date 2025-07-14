from fastapi import APIRouter, HTTPException
from bson import ObjectId
from database import db

router = APIRouter()

@router.delete("/pendientes/{id}")
def eliminar_pendiente(id: str):
    try:
        resultado = db["trabajos"].delete_one({"_id": ObjectId(id)})
        if resultado.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Orden no encontrada")
        return {"mensaje": "Orden eliminada correctamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))  # ← paréntesis corregido aquí
