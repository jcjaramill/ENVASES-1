# models/models.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Pendientes(BaseModel):
    timestamp: str
    trabajo: str
    maquina_equipo: str
    linea: str
    status: str
    tecnico: str
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
