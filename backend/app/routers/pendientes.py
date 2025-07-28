from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from bson import ObjectId
from datetime import datetime
from models.models import Pendientes, StatusUpdate
from database import db
import asyncio
import json

router = APIRouter()
clientes_websocket = []

def generar_payload_estadistico(timestamp_ref=None):
    datos = list(db["trabajos"].find())
    for d in datos:
        d["id"] = str(d["_id"])
        del d["_id"]

    resumen_estados = {"pendiente": 0, "en_proceso": 0, "completado": 0}
    por_tecnico, por_linea, por_maquina = {}, {}, {}

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

    return {
        "ordenes_totales": len(datos),
        "resumen_estados": resumen_estados,
        "por_tecnico": por_tecnico,
        "por_linea": por_linea,
        "por_maquina": por_maquina,
        "timestamp": timestamp_ref
    }

async def emitir_payload(payload):
    for ws in clientes_websocket.copy():
        try:
            await ws.send_text(json.dumps(payload))
        except Exception:
            clientes_websocket.remove(ws)

def obtener_pendientes():
    pendientes = list(db["trabajos"].find({}, {"_id": 0}))
    return pendientes

def obtener_payload_pendientes():
    payload = generar_payload_estadistico()

    payload["trabajos_completados_totales"] = db["trabajos_completados"].count_documents({})

    hoy_str = datetime.utcnow().date().isoformat()
    payload["trabajos_completados_hoy"] = db["trabajos_completados"].count_documents({
        "fecha_completado": {"$regex": f"^{hoy_str}"}
    })

    cursor = db["trabajos_completados"].aggregate([
        {"$group": {"_id": "$tecnico", "total": {"$sum": 1}}},
        {"$sort": {"total": -1}},
        {"$limit": 1}
    ])
    top_tecnico = next(cursor, {"_id": None, "total": 0})

    payload["top_tecnico_completador"] = {
        "nombre": top_tecnico["_id"],
        "cantidad": top_tecnico["total"]
    }

    return payload


@router.post("/pendientes")
async def registrar_produccion(data: Pendientes):
    db["trabajos"].insert_one(data.dict())

    # Generar estadísticas con el timestamp original
    payload = generar_payload_estadistico(timestamp_ref=data.timestamp)
    await emitir_payload(payload)

    return {"mensaje": "Orden registrada correctamente"}


@router.patch("/pendientes/{id}")
async def actualizar_estado(id: str, datos: StatusUpdate):
    result = db["trabajos"].update_one(
        {"_id": ObjectId(id)},
        {"$set": {"status": datos.status}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Orden no encontrada")

    payload = generar_payload_estadistico(timestamp_ref=datos.timestamp)

    # 🧮 Agregados estadísticos al payload
    payload["trabajos_completados_totales"] = db["trabajos_completados"].count_documents({})
    
    hoy_str = datetime.utcnow().date().isoformat()
    payload["trabajos_completados_hoy"] = db["trabajos_completados"].count_documents({
        "fecha_completado": {"$regex": f"^{hoy_str}"}
    })

    cursor = db["trabajos_completados"].aggregate([
        {"$group": {"_id": "$tecnico", "total": {"$sum": 1}}},
        {"$sort": {"total": -1}},
        {"$limit": 1}
    ])
    top_tecnico = next(cursor, {"_id": None, "total": 0})
    
    payload["top_tecnico_completador"] = {
        "nombre": top_tecnico["_id"],
        "cantidad": top_tecnico["total"]
    }

    # 📌 Info específica del patch
    payload["estado_actualizado"] = datos.status
    payload["id_modificado"] = id

    await emitir_payload(payload)

    return {"mensaje": "Estado actualizado correctamente"}


@router.get("/pendientes")
def obtener_produccion():
    payload = obtener_payload_pendientes()
    return payload



@router.delete("/pendientes/{id}")
async def eliminar_pendiente(id: str):
    try:
        # Buscar la orden original
        orden = db["trabajos"].find_one({"_id": ObjectId(id)})
        #notificar_cambios()
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
        
        payload = generar_payload_estadistico(timestamp_ref=None)

        # 🔢 Agregamos cantidad total de trabajos completados
        cantidad_completados = db["trabajos_completados"].count_documents({})
        payload["trabajos_completados_totales"] = cantidad_completados

        print(payload)
        await emitir_payload(payload)


        return {"mensaje": "Orden eliminada y archivada correctamente"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@router.websocket("/ws/grafana")
async def websocket_grafana(websocket: WebSocket):
    await websocket.accept()
    clientes_websocket.append(websocket)

    try:
        # ⏱️ Enviar estado inicial equivalente al GET /pendientes
        payload_inicial = obtener_payload_pendientes()
        await websocket.send_text(json.dumps(payload_inicial))

        # 🔁 Mantener conexión viva
        while True:
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        clientes_websocket.remove(websocket)