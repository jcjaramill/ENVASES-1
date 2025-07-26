from fastapi import Header, HTTPException
from auth.auth_utils import verificar_token

def obtener_usuario_y_rol(authorization: str = Header(...)):
    token = authorization.split()[1]
    payload = verificar_token(token)
    if not payload or "usuario" not in payload or "rol" not in payload:
        raise HTTPException(status_code=401, detail="Token inválido")

    return payload["usuario"], payload["rol"]

def requiere_rol(rol_requerido: str):
    def validador(authorization: str = Header(...)):
        token = authorization.split()[1]
        payload = verificar_token(token)
        if not payload or payload.get("rol") != rol_requerido:
            raise HTTPException(status_code=403, detail="Permiso denegado")
        return payload["usuario"]
    return validador

