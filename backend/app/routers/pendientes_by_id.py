from fastapi import APIRouter, HTTPException, WebSocketDisconnect, WebSocket
from bson import ObjectId
from database import db
from pydantic import BaseModel
import asyncio
import json

router = APIRouter()
clientes_websocket = []

class StatusUpdate(BaseModel):
    status: str

def generar_payload_estadistico():
    datos = list(db["trabajos"].find())
    for d in datos:
        d["id"] = str(d["_id"])
        del d["_id"]

    # Estadísticas por estado
    resumen_estados = {
        "pendiente": 0,
        "en_proceso": 0,
        "completado": 0
    }

    por_tecnico = {}
    por_linea = {}
    por_maquina = {}

    for d in datos:
        estado = d.get("status", "").lower()
        if estado in resumen_estados:
            resumen_estados[estado] += 1

        tecnico = d.get("tecnico")
        if tecnico:
            por_tecnico[tecnico] = por_tecnico.get(tecnico, 0) + 1

        linea = d.get("linea")
        if linea:
            por_linea[linea] = por_linea.get(linea, 0) + 1

        maquina = d.get("maquina_equipo")
        if maquina:
            por_maquina[maquina] = por_maquina.get(maquina, 0) + 1

    payload = {
        "ordenes_totales": len(datos),
        "resumen_estados": resumen_estados,
        "por_tecnico": por_tecnico,
        "por_linea": por_linea,
        "por_maquina": por_maquina,
        "timestamp": asyncio.get_event_loop().time()
    }

    return payload

async def notificar_grafana():
    payload = generar_payload_estadistico()
    for ws in clientes_websocket.copy():
        try:
            await ws.send_text(json.dumps(payload))
        except Exception:
            clientes_websocket.remove(ws)

@router.patch("/pendientes/{id}")
async def actualizar_estado(id: str, datos: StatusUpdate):
    try:
        resultado = db["trabajos"].update_one(
            {"_id": ObjectId(id)},
            {"$set": {"status": datos.status}}
        )

        if resultado.matched_count == 0:
            raise HTTPException(status_code=404, detail="Orden no encontrada")

        # Generar payload estadístico actualizado
        payload = generar_payload_estadistico()

        print(payload)

        # Emitir a todos los clientes conectados
        for ws in clientes_websocket.copy():
            try:
                await ws.send_text(json.dumps(payload))
            except Exception:
                clientes_websocket.remove(ws)

        return {"mensaje": "Estado actualizado correctamente"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@router.websocket("/ws/grafana")
async def websocket_grafana(websocket: WebSocket):
    print(websocket)
    await websocket.accept()
    clientes_websocket.append(websocket)

    try:
        while True:
            await asyncio.sleep(10)  # Mantener la conexión viva
    except WebSocketDisconnect:
        clientes_websocket.remove(websocket)
