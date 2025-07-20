from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from auth_utils import crear_token, verificar_contrasena, encriptar_contrasena

router = APIRouter()

# ⚠️ Para demo: usuario hardcodeado
USUARIO_DB = {
    "jjaramillo": encriptar_contrasena("123456")
}

class Credenciales(BaseModel):
    usuario: str
    password: str

@router.post("/login")
def login(data: Credenciales):
    if data.usuario not in USUARIO_DB or not verificar_contrasena(data.password, USUARIO_DB[data.usuario]):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    token = crear_token({"usuario": data.usuario})
    return {"access_token": token}
