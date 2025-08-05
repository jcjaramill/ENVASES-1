# Usa una imagen oficial de Python
FROM python:3.10-slim

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos del backend
COPY ./app /app

# Instala las dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Expone el puerto (ajústalo si usas otro)
EXPOSE 8002

# Comando para iniciar el backend (ajusta si usas Flask, etc.)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8002"]
