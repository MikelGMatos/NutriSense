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