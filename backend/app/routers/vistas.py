from fastapi import APIRouter, HTTPException
from fastapi import Depends
from auth.dependencias import requiere_rol

router = APIRouter()

@router.post("/vistas")
def actualizar_dashboard(usuario: str = Depends(requiere_rol("designer"))):
    return {"validator": usuario}
