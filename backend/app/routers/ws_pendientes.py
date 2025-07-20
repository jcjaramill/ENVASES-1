from fastapi import APIRouter, HTTPException
from fastapi import WebSocket, WebSocketDisconnect
import asyncio
from models.models import Pendientes
from database import db
import json

router = APIRouter()
clientes_conectados = []

@router.websocket("/ws/pendientes")
async def stream_pendientes(websocket: WebSocket):
    await websocket.accept()
    clientes_conectados.append(websocket)

    try:
        while True:
            datos = list(db["trabajos"].find())
            for d in datos:
                d["id"] = str(d["_id"])
                del d["_id"]

            for cliente in clientes_conectados:
                try:
                    await cliente.send_json(datos)
                except:
                    pass

            await asyncio.sleep(2)
    except WebSocketDisconnect:
        clientes_conectados.remove(websocket)

"""@router.websocket("/ws/pendientes")
async def stream_pendientes(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            datos = list(db["trabajos"].find())
            for d in datos:
                d["id"] = str(d["_id"])
                del d["_id"]
            await websocket.send_json(datos)
            await asyncio.sleep(2)
    except WebSocketDisconnect:
        print("Cliente desconectado de WebSocket /ws/pendientes")"""