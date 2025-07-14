# routers/pendientes.py
from fastapi import APIRouter, HTTPException
from fastapi import WebSocket, WebSocketDisconnect
import asyncio
from models.models import Pendientes
from database import db
import json

router = APIRouter()
clientes_websocket = []

@router.post("/pendientes")
async def registrar_produccion(data: Pendientes):
    result = db["trabajos"].insert_one(data.dict())

    mensaje = {
        "timestamp": data.timestamp,
        "trabajo": data.trabajo,
        "maquina_equipo": data.maquina_equipo,
        "linea": data.linea,
        "status": data.status,
        "tecnico": data.tecnico,
        "observaciones": data.observaciones,
    }
    print(mensaje)

    for ws in clientes_websocket.copy():
        try:
            await ws.send_text(json.dumps(mensaje))
        except Exception:
            clientes_websocket.remove(ws)

    return {"id": str(result.inserted_id)}

"""@router.get("/pendientes")
def obtener_produccion():
    datos = list(db["trabajos"].find())
    for d in datos:
        d["id"] = str(d["_id"])
        del d["_id"]
    return datos"""

@router.get("/pendientes")
def obtener_produccion():
    datos = list(db["trabajos"].find())
    for d in datos:
        d["id"] = str(d["_id"])
        del d["_id"]

    # Contadores de estado
    resumen = {
        "pendiente": 0,
        "en_proceso": 0,
        "completado": 0
    }

    for d in datos:
        estado = d.get("status", "").lower()
        if estado in resumen:
            resumen[estado] += 1

    return {
        "ordenes": datos,
        "resumen_estados": resumen
    }


"""@router.websocket("/ws/grafana")
async def websocket_grafana(websocket: WebSocket):
    await websocket.accept()
    clientes_websocket.append(websocket)

    try:
        while True:
            await asyncio.sleep(10)  # Mantener la conexión viva
    except WebSocketDisconnect:
        clientes_websocket.remove(websocket)"""
