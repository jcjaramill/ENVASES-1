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
    # Listas fijas
    tecnicos_registrados = [
        "Juan Bolivar", "Jorge Pendola", "Kevin Nuñez", "Cristopher Martinez",
        "Andres Muñoz", "Miguel Hidalgo", "Jorge Cardenas", "Ivan Delgado"
    ]
    maquinas_registradas = [
        "Compresor A", "Bomba Hidráulica", "Motor Principal", "Generador X",
        "Torno CNC", "Fresadora Y", "Caldera Z"
    ]
    lineas_registradas = [
        "Línea 1", "Línea 2", "Línea 3", "Línea 4", "Línea 5", "Línea 6", "Línea 7", "Línea 8", "Línea 9", "Línea 10"
    ]

    # Obtener todos los trabajos
    datos = list(db["trabajos"].find())
    for d in datos:
        d["id"] = str(d["_id"])
        del d["_id"]

    resumen_estados = {"pendiente": 0, "en_proceso": 0, "completado": 0}
    por_linea, por_maquina = {}, {}

    for d in datos:
        estado = d.get("status", "").lower()
        if estado in resumen_estados:
            resumen_estados[estado] += 1

        linea = d.get("linea")
        if linea:
            por_linea[linea] = por_linea.get(linea, 0) + 1

        maquina = d.get("maquina_equipo")
        if maquina:
            por_maquina[maquina] = por_maquina.get(maquina, 0) + 1

    # 🔍 Obtener trabajos por técnico usando agregación
    pipeline = [
        {
            "$group": {
                "_id": "$tecnico",
                "cantidad_trabajos": {"$sum": 1}
            }
        },
        {
            "$project": {
                "_id": 0,
                "tecnico": {"$ifNull": ["$_id", "Sin asignar"]},
                "cantidad_trabajos": 1
            }
        }
    ]
    resultados_tecnicos = list(db["trabajos"].aggregate(pipeline))

    if resultados_tecnicos:
        por_tecnico = {nombre: 0 for nombre in tecnicos_registrados}
        for r in resultados_tecnicos:
            por_tecnico[r["tecnico"]] = r["cantidad_trabajos"]
    else:
        por_tecnico = {nombre: 0 for nombre in tecnicos_registrados}

    # 🧾 Respaldo para máquinas
    por_maquina_completo = {nombre: 0 for nombre in maquinas_registradas}
    for nombre, cantidad in por_maquina.items():
        por_maquina_completo[nombre] = cantidad

    # 🧾 Respaldo para líneas
    por_linea_completo = {nombre: 0 for nombre in lineas_registradas}
    for nombre, cantidad in por_linea.items():
        por_linea_completo[nombre] = cantidad

    # 📦 Payload final
    return {
        "ordenes_totales": len(datos),
        "resumen_estados": resumen_estados,
        "por_tecnico": por_tecnico,
        "por_linea": por_linea_completo,
        "por_maquina": por_maquina_completo,
        "timestamp": timestamp_ref
    }

async def emitir_payload(payload):
    for ws in clientes_websocket.copy():
        try:
            await ws.send_text(json.dumps(payload))
        except Exception:
            clientes_websocket.remove(ws)


def obtener_payload_pendientes():
    payload = generar_payload_estadistico()

    # Total de trabajos completados
    payload["trabajos_completados_totales"] = db["trabajos_completados"].count_documents({})

    # Trabajos completados hoy
    hoy_str = datetime.utcnow().date().isoformat()
    payload["trabajos_completados_hoy"] = db["trabajos_completados"].count_documents({
        "fecha_completado": {"$regex": f"^{hoy_str}"}
    })

    # Técnico con más trabajos completados
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

    # Último trabajo completado
    ultimo_trabajo = db["trabajos_completados"].find_one(
        {},
        sort=[("timestamp", -1)],
        projection={"_id": 0, "trabajo": 1, "maquina_equipo": 1, "linea": 1}
    )

    payload["ultimo_trabajo_completado"] = (
        ultimo_trabajo if ultimo_trabajo else {
            "trabajo": None,
            "maquina_equipo": None,
            "linea": None
        }
    )
    print(payload)

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
    print(payload)

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

        # 🔄 Generar payload estadístico completo
        payload = obtener_payload_pendientes()

        print(payload)
        await emitir_payload(payload)

        return {
            "mensaje": "Orden eliminada y archivada correctamente",
            "payload": payload
        }

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

"""@router.websocket("/ws/grafana")
async def websocket_grafana(websocket: WebSocket):
    await websocket.accept()
    clientes_websocket.append(websocket)

    try:
        while True:
            await asyncio.sleep(1)  # Mantener la conexión viva sin emitir nada
    except WebSocketDisconnect:
        clientes_websocket.remove(websocket)"""
