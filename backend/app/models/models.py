# models/models.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Productos(BaseModel):
    timestamp: str
    producto: str
    siguiente_producto: str
    formato: str
    siguiente_formato: str
    linea: str
    status: str
    responsable: str
    cambio_formato: bool
    produccion: bool
    observaciones: Optional[str] = None

class Problema(BaseModel):
    descripcion: str
    responsable: str
    fecha: str
    status: str
    fecha_registro: Optional[str] = None
    hora_registro: Optional[str] = None

class PrediccionInput(BaseModel):
    hora: str
    linea: str
    dia_semana: int
    turno: int

class StatusUpdate(BaseModel):
    status: str
    timestamp: str

class Credenciales(BaseModel):
    usuario: str
    password: str
    rol: Optional[str] = None

