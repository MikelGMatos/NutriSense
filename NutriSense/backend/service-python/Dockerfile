# ============================================================
# DOCKERFILE - Backend Python FastAPI (con Open Food Facts)
# ============================================================

FROM python:3.11-slim

# Información del mantenedor
LABEL maintainer="NutriTrack Team"
LABEL description="Backend Python FastAPI para NutriTrack - Gestión de catálogo de alimentos"

# Establecer directorio de trabajo
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

# Copiar script de inicialización
COPY start-python.sh /app/start-python.sh

# Dar permisos de ejecución al script
RUN chmod +x /app/start-python.sh

# Crear directorio para logs
RUN mkdir -p logs

# Exponer el puerto
EXPOSE 8000

# Variables de entorno por defecto
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')"

# Comando por defecto - usa el script de inicialización
CMD ["/app/start-python.sh"]
