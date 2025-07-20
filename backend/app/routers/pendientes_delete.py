from fastapi import APIRouter, HTTPException
from bson import ObjectId
from database import db
from datetime import datetime
import json
import asyncio

router = APIRouter()

clientes_conectados = []

@router.delete("/pendientes/{id}")
def eliminar_pendiente(id: str):
    try:
        # Buscar la orden original
        orden = db["trabajos"].find_one({"_id": ObjectId(id)})
        notificar_cambios()
        if not orden:
            raise HTTPException(status_code=404, detail="Orden no encontrada")

        # Preparar la copia para la colección archivada
        orden["id_original"] = str(orden["_id"])
        orden["fecha_completado"] = datetime.utcnow().isoformat()
        del orden["_id"]

        # Insertar en colección de auditoría
        db["trabajos_completados"].insert_one(orden)

        # Eliminar definitivamente de trabajos
        resultado = db["trabajos"].delete_one({"_id": ObjectId(id)})
        if resultado.deleted_count == 0:
            raise HTTPException(status_code=404, detail="No se pudo eliminar la orden")

        return {"mensaje": "Orden eliminada y archivada correctamente"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

def notificar_cambios():
    datos = list(db["trabajos"].find())
    for d in datos:
        d["id"] = str(d["_id"])
        del d["_id"]
    texto = json.dumps(datos)

    for ws in clientes_conectados:
        try:
            asyncio.create_task(ws.send_text(texto))
        except:
            pass



"""@router.delete("/pendientes/{id}")
def eliminar_pendiente(id: str):
    try:
        resultado = db["trabajos"].delete_one({"_id": ObjectId(id)})
        notificar_cambios()
        if resultado.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Orden no encontrada")
        return {"mensaje": "Orden eliminada correctamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))  # ← paréntesis corregido aquí


def notificar_cambios():
    datos = list(db["trabajos"].find())
    for d in datos:
        d["id"] = str(d["_id"])
        del d["_id"]
    texto = json.dumps(datos)

    for ws in clientes_conectados:
        try:
            asyncio.create_task(ws.send_text(texto))
        except:
            pass"""
