# ============================================================
# DOCKERFILE - Backend Node.js
# ============================================================

FROM node:18-alpine

# Información del mantenedor
LABEL maintainer="NutriTrack Team"
LABEL description="Backend Node.js para NutriTrack - Gestión de usuarios y diarios"

# Establecer directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache \
    python3 \
    make \
    g++

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de Node.js
RUN npm install

# Copiar el resto del código
COPY . .

# Crear directorio para logs si no existe
RUN mkdir -p logs

# Exponer el puerto
EXPOSE 3001

# Variables de entorno por defecto (se sobrescriben con docker-compose)
ENV NODE_ENV=development
ENV PORT=3001

# Comando por defecto (se sobrescribe en docker-compose)
CMD ["npm", "run", "dev"]
