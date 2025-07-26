# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import pendientes, problemas, prediccion, ws_pendientes, pendientes_delete, auth, vistas, ordenes_completadas
from config import settings
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir rutas organizadas por módulos
app.include_router(auth.router)
app.include_router(pendientes.router)
app.include_router(problemas.router)
app.include_router(prediccion.router)
#app.include_router(pendientes_by_id.router)
app.include_router(pendientes_delete.router)
app.include_router(ws_pendientes.router)
app.include_router(vistas.router)
app.include_router(ordenes_completadas.router)



@app.get("/")
def home():
    return {"mensaje": "API funcionando correctamente"}

# --- Mantener el servidor escuchando ---
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=settings.PORT, reload=True)
