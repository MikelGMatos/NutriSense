FROM node:20-alpine

# Crear directorio de la aplicación
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer el puerto del gateway
EXPOSE 4000

# Comando para iniciar el servidor
CMD ["npm", "run", "dev"]
