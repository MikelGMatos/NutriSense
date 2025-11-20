# ============================================================
# DOCKERFILE - Frontend React
# ============================================================

FROM node:20-alpine

# Información del mantenedor
LABEL maintainer="NutriTrack Team"
LABEL description="Frontend React para NutriTrack - Interfaz de usuario"

# Establecer directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema
RUN apk add --no-cache python3 make g++

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer el puerto de Vite
EXPOSE 5173

# Variables de entorno
ENV NODE_ENV=development

# Comando por defecto
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
