# 🐳 NutriTrack - Guía Docker

Esta guía te ayudará a ejecutar **NutriTrack completo** con un solo comando usando Docker Compose.

---

## 📋 **Requisitos Previos**

### **Instalar Docker Desktop:**

#### **Windows:**
1. Descarga Docker Desktop desde: https://www.docker.com/products/docker-desktop
2. Instala y reinicia tu computadora
3. Abre Docker Desktop y espera a que inicie

#### **Mac:**
1. Descarga Docker Desktop desde: https://www.docker.com/products/docker-desktop
2. Arrastra Docker.app a tu carpeta Applications
3. Abre Docker desde Applications

#### **Linux:**
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install docker.io docker-compose
sudo systemctl start docker
sudo usermod -aG docker $USER
```

### **Verificar instalación:**
```bash
docker --version
docker-compose --version
```

Deberías ver algo como:
```
Docker version 24.0.x
Docker Compose version 2.x.x
```

---

## 🚀 **Inicio Rápido (3 minutos)**

### **1. Clonar el proyecto:**
```bash
git clone https://github.com/tu-usuario/nutritrack.git
cd nutritrack
```

### **2. Iniciar todos los servicios:**
```bash
docker-compose up --build
```

**¡Eso es todo!** 🎉

Docker hará automáticamente:
- ✅ Descargar las imágenes necesarias (MySQL, MongoDB, Node, Python)
- ✅ Construir los contenedores de tu aplicación
- ✅ Crear las bases de datos
- ✅ Ejecutar el script de inicialización de MySQL
- ✅ Importar los 12 alimentos de ejemplo en MongoDB
- ✅ Iniciar todos los servicios conectados

### **3. Acceder a la aplicación:**

Espera 1-2 minutos y luego abre tu navegador:

- **Frontend:** http://localhost:5173
- **Backend Node.js:** http://localhost:3001/api/health
- **Backend Python (API Docs):** http://localhost:8000/docs
- **MySQL:** localhost:3306 (usuario: `nutritrack`, contraseña: `nutritrack123`)
- **MongoDB:** localhost:27017

---

## 📊 **Arquitectura de los Contenedores**

```
┌─────────────────────────────────────────────────┐
│           Docker Network (nutritrack)           │
│                                                 │
│  ┌─────────────┐    ┌──────────────┐          │
│  │  Frontend   │    │ Backend Node │          │
│  │  React:5173 │◄───┤  Express:3001│          │
│  └─────────────┘    └──────┬───────┘          │
│         │                   │                   │
│         │                   ▼                   │
│         │           ┌──────────────┐           │
│         └──────────►│ Backend      │           │
│                     │ Python:8000  │           │
│                     └──────┬───────┘           │
│                            │                    │
│         ┌──────────────────┴────────┐          │
│         ▼                           ▼          │
│  ┌────────────┐              ┌────────────┐   │
│  │   MySQL    │              │  MongoDB   │   │
│  │   :3306    │              │   :27017   │   │
│  └────────────┘              └────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 🎛️ **Comandos Útiles**

### **Iniciar servicios:**
```bash
# Primera vez (construye las imágenes)
docker-compose up --build

# Ejecuciones siguientes (más rápido)
docker-compose up

# En segundo plano (detached mode)
docker-compose up -d
```

### **Detener servicios:**
```bash
# Detener todos los contenedores
docker-compose down

# Detener Y eliminar volúmenes (CUIDADO: borra las bases de datos)
docker-compose down -v
```

### **Ver logs:**
```bash
# Logs de todos los servicios
docker-compose logs -f

# Logs de un servicio específico
docker-compose logs -f backend-node
docker-compose logs -f backend-python
docker-compose logs -f frontend
docker-compose logs -f mysql
docker-compose logs -f mongodb
```

### **Reiniciar un servicio específico:**
```bash
docker-compose restart backend-node
docker-compose restart backend-python
docker-compose restart frontend
```

### **Ver estado de los servicios:**
```bash
docker-compose ps
```

### **Acceder a un contenedor:**
```bash
# Acceder a bash del backend Node
docker-compose exec backend-node sh

# Acceder a bash del backend Python
docker-compose exec backend-python bash

# Acceder a MySQL
docker-compose exec mysql mysql -u nutritrack -pnutritrack123 nutrition_db

# Acceder a MongoDB
docker-compose exec mongodb mongosh
```

---

## 🔧 **Configuración**

### **Variables de entorno:**

Las variables de entorno se configuran en `docker-compose.yml`. Si necesitas cambiarlas:

```yaml
# Para backend Node.js
environment:
  DB_HOST: mysql
  DB_USER: nutritrack
  DB_PASSWORD: nutritrack123
  JWT_SECRET: your-secret-here

# Para backend Python
environment:
  MONGO_URI: mongodb://mongodb:27017
  MONGO_DB: nutrition_db
```

### **Puertos:**

Si tienes conflictos de puertos, cámbielos en `docker-compose.yml`:

```yaml
ports:
  - "PUERTO_HOST:PUERTO_CONTENEDOR"

# Ejemplo: cambiar frontend del 5173 al 3000
frontend:
  ports:
    - "3000:5173"  # Host:Container
```

---

## 📦 **Datos Persistentes**

Docker Compose crea **volúmenes persistentes** para las bases de datos:

- `mysql_data` - Datos de MySQL
- `mongo_data` - Datos de MongoDB

Esto significa que **tus datos se mantienen** incluso si detienes los contenedores.

### **Resetear las bases de datos:**
```bash
# Detener y eliminar volúmenes
docker-compose down -v

# Reiniciar (creará bases de datos frescas)
docker-compose up --build
```

---

## 🔍 **Solución de Problemas**

### **Error: "port is already allocated"**

**Causa:** Otro servicio está usando el puerto.

**Solución:**
```bash
# Ver qué está usando el puerto
# Windows:
netstat -ano | findstr :3001

# Mac/Linux:
lsof -i :3001

# Matar el proceso o cambiar el puerto en docker-compose.yml
```

### **Error: "Cannot connect to Docker daemon"**

**Causa:** Docker Desktop no está corriendo.

**Solución:** Abre Docker Desktop y espera a que inicie.

### **Los servicios no se conectan entre sí**

**Causa:** Los contenedores no están en la misma red.

**Solución:** Verifica que todos usen `nutritrack-network` en docker-compose.yml

### **"Frontend no encuentra el backend"**

**Causa:** URLs incorrectas en el frontend.

**Solución:** Verifica que `VITE_API_NODE_URL` y `VITE_API_PYTHON_URL` usen `localhost` (no los nombres de los contenedores) porque el frontend se ejecuta en tu navegador, no dentro de Docker.

### **Reiniciar desde cero:**
```bash
# Detener todo y limpiar
docker-compose down -v
docker system prune -a

# Reiniciar
docker-compose up --build
```

---

## 📊 **Verificación de Salud**

Una vez iniciados los servicios, verifica que todo funcione:

### **1. Healthchecks automáticos:**
```bash
docker-compose ps
```

Deberías ver "healthy" en MySQL y MongoDB.

### **2. Probar endpoints:**
```bash
# Backend Node.js
curl http://localhost:3001/api/health

# Backend Python
curl http://localhost:8000/health

# Frontend
curl http://localhost:5173
```

### **3. Verificar bases de datos:**
```bash
# MySQL
docker-compose exec mysql mysql -u nutritrack -pnutritrack123 nutrition_db -e "SHOW TABLES;"

# MongoDB
docker-compose exec mongodb mongosh nutrition_db --eval "db.foods.countDocuments()"
```

---

## 🎓 **Para Desarrollo**

### **Cambios en tiempo real (hot reload):**

Los volúmenes montados permiten que los cambios en tu código se reflejen automáticamente:

- Frontend: `./frontend:/app`
- Backend Node: `./backend/service-node:/app`
- Backend Python: `./backend/service-python:/app`

Solo guarda el archivo y el servidor se reiniciará automáticamente.

### **Instalar nuevas dependencias:**

```bash
# Backend Node.js
docker-compose exec backend-node npm install nueva-dependencia

# Backend Python
docker-compose exec backend-python pip install nueva-dependencia

# Frontend
docker-compose exec frontend npm install nueva-dependencia
```

Luego actualiza el archivo `package.json` o `requirements.txt` correspondiente.

---

## 🚢 **Producción**

Para producción, crea un `docker-compose.prod.yml` separado con:

- Variables de entorno seguras (secrets)
- Optimizaciones de build
- Sin volúmenes de desarrollo
- HTTPS configurado
- Logging configurado

---

## 📞 **Soporte**

Si tienes problemas:

1. Revisa los logs: `docker-compose logs -f`
2. Verifica el estado: `docker-compose ps`
3. Consulta la documentación de Docker: https://docs.docker.com

---

## ✅ **Checklist de Inicio**

- [ ] Docker Desktop instalado y corriendo
- [ ] Repositorio clonado
- [ ] Ejecutado `docker-compose up --build`
- [ ] Esperado 2-3 minutos
- [ ] Frontend accesible en http://localhost:5173
- [ ] Backend Node accesible en http://localhost:3001
- [ ] Backend Python accesible en http://localhost:8000
- [ ] Bases de datos saludables (`docker-compose ps`)
- [ ] Alimentos importados en MongoDB

**¡Listo para desarrollar! 🚀**