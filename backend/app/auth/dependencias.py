from fastapi import Header, HTTPException
from auth_utils import verificar_token

def obtener_usuario(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Formato de token inválido")

    token = authorization.split()[1]
    usuario = verificar_token(token)
    if not usuario:
        raise HTTPException(status_code=401, detail="Token inválido")

    return usuario
