from fastapi import APIRouter, Depends
from fastapi.encoders import jsonable_encoder
from database import db
from bson import ObjectId
#from auth.dependencias import obtener_usuario
import datetime
import json


router = APIRouter()

@router.get("/ordenes_completadas")
#def obtener_completadas(usuario: str = Depends(obtener_usuario)):
def obtener_completadas():
    ordenes = list(db["trabajos"].find({"status": "completado"}))

    if ordenes:
        print(ordenes)

        for orden in ordenes:
            orden["id"] = str(orden["_id"])
            del orden["_id"]

        return ordenes
    else:
        print("No se han completado ordenes")
        return jsonable_encoder(ordenes)
