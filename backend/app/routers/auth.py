from fastapi import APIRouter, HTTPException
from auth.auth_utils import crear_token, verificar_contrasena
from models.models import Credenciales
from database import db

router = APIRouter()

@router.post("/login")
def login(data: Credenciales):
    usuario_encontrado = db["usuarios"].find_one({"usuario": data.usuario})
    print(usuario_encontrado)
    if not usuario_encontrado:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")

    if not verificar_contrasena(data.password, usuario_encontrado["password"]):
        raise HTTPException(status_code=401, detail="Contraseña incorrecta")

    token = crear_token({
        "usuario": data.usuario,
        "rol": usuario_encontrado["rol"]
    })

    return {
        "access_token": token,
        "usuario": data.usuario,
        "rol": usuario_encontrado["rol"]
    }

