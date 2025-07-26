from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext

SECRET_KEY = "tu_clave_secreta"
ALGORITHM = "HS256"
EXPIRATION_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def crear_token(datos: dict):
    datos_copy = datos.copy()
    datos_copy["exp"] = datetime.utcnow() + timedelta(minutes=EXPIRATION_MINUTES)
    return jwt.encode(datos_copy, SECRET_KEY, algorithm=ALGORITHM)

def verificar_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload  # 👈 devuelve todo el payload (no solo "usuario")
    except JWTError:
        return None

def encriptar_contrasena(password: str):
    return pwd_context.hash(password)

def verificar_contrasena(password: str, hashed: str):
    return pwd_context.verify(password, hashed)
