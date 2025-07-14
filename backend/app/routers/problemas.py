# routers/problemas.py
from fastapi import APIRouter
from models.models import Problema
from database import db

router = APIRouter()

@router.post("/problemas")
def registrar_problema(data: Problema):
    result = db["problemas"].insert_one(data.dict())
    return {"id": str(result.inserted_id)}

@router.get("/problemas")
def obtener_problemas():
    datos = list(db["problemas"].find())
    for d in datos:
        d["id"] = str(d["_id"])
        del d["_id"]
    return datos
