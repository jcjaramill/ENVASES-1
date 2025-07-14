# routers/prediccion.py
from fastapi import APIRouter, HTTPException
from models.models import PrediccionInput
import joblib

router = APIRouter()

@router.post("/predecir")
def predecir_uc(data: PrediccionInput):
    try:
        modelo = joblib.load("modelo_prediccion.pkl")
        entrada = [[data.dia_semana, data.turno]]
        uc_estimado = modelo.predict(entrada)
        return {"uc_estimado": int(uc_estimado[0])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en predicción: {str(e)}")
