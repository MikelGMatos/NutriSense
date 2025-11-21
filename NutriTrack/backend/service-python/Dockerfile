# ============================================================
# DOCKERFILE - Backend Python FastAPI
# ============================================================

FROM python:3.11-slim

LABEL maintainer="NutriTrack Team"
LABEL description="Backend Python FastAPI para NutriTrack"

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements.txt
COPY requirements.txt .

# Instalar dependencias de Python
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copiar el resto del código
COPY . .

# Crear directorio para logs
RUN mkdir -p logs

# Hacer ejecutable el script de inicio
RUN chmod +x /app/start-python.sh

# Exponer el puerto
EXPOSE 8000

# Variables de entorno por defecto
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')"

# Ejecutar script de inicio
CMD ["/app/start-python.sh"]
