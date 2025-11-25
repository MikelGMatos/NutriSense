# NutriTrack - Sistema de Seguimiento Nutricional

NutriTrack es una aplicación web completa de seguimiento nutricional que permite a los usuarios registrar sus comidas diarias, consultar información nutricional de alimentos y monitorear sus macronutrientes en tiempo real.

## 📋 Tabla de Contenidos

- [1. Software Necesario](#1-software-necesario)
- [2. Servicios que Arrancar](#2-servicios-que-arrancar)
- [3. Dependencias a Instalar](#3-dependencias-a-instalar)
- [4. Arrancar la Parte Servidora](#4-arrancar-la-parte-servidora)
- [5. Acceder a la Parte Cliente](#5-acceder-a-la-parte-cliente)
- [Información Adicional](#información-adicional)

---

## 1. Software Necesario

Antes de comenzar, asegúrate de tener instalado el siguiente software en tu sistema:

### Opción A: Con Docker (RECOMENDADO - Más sencillo)

Si prefieres usar Docker, solo necesitas:

- **Docker Desktop** v4.0 o superior
  - Descarga: https://www.docker.com/products/docker-desktop/
  - Incluye Docker Compose automáticamente
  - Requiere: 4GB RAM disponible, 2GB espacio en disco

### Opción B: Sin Docker (Manual)

Si prefieres ejecutar cada servicio manualmente:

#### Software Base:
- **Node.js** v20.0 o superior
  - Descarga: https://nodejs.org/
  - Verifica instalación: `node --version`
  
- **Python** v3.11 o superior
  - Descarga: https://www.python.org/downloads/
  - Verifica instalación: `python --version` o `python3 --version`
  
- **npm** (incluido con Node.js)
  - Verifica instalación: `npm --version`

#### Bases de Datos:
- **MySQL** v8.0 o superior
  - Descarga: https://dev.mysql.com/downloads/mysql/
  - Crea la base de datos: `nutrition_db`
  
- **MongoDB** v6.0 o superior
  - Descarga: https://www.mongodb.com/try/download/community
  - Deja el puerto por defecto: 27017

#### Herramientas Opcionales (recomendadas):
- **Git** - Para clonar el repositorio
- **MongoDB Compass** - Cliente visual para MongoDB
- **MySQL Workbench** - Cliente visual para MySQL
- **Postman/Thunder Client** - Para probar APIs

---

## 2. Servicios que Arrancar

El proyecto está compuesto por **5 servicios** que deben estar ejecutándose:

### Con Docker:

# Arrancar todos los servicios a la vez (en la carpeta raiz)
docker-compose up
# Probar sino:
docker-compose up --build

# Esperar al siguiente mensaje para que se importen todos los alimentos (2-3min):
nutritrack-backend-python  | INFO:     127.0.0.1:51880 - "GET /health HTTP/1.1" 200 OK


# O en modo background (segundo plano)
docker-compose up -d


Los servicios que arranca Docker automáticamente son:

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| **mysql** | 3306 | Base de datos relacional (usuarios y diarios) |
| **mongodb** | 27017 | Base de datos de documentos (catálogo de alimentos) |
| **backend-node** | 3001 | API REST de autenticación y gestión de diarios |
| **backend-python** | 8000 | API REST del catálogo de alimentos |
| **frontend** | 5173 | Aplicación web React |

### Sin Docker (Manual):

Debes arrancar cada servicio en su propia terminal:

#### 1. MySQL (Terminal 1)
# En Windows
mysql.server start

# En Linux/Mac
sudo service mysql start

# O usar MySQL Workbench para iniciar el servidor


#### 2. MongoDB (Terminal 2)
# En Windows
net start MongoDB

# En Linux/Mac
sudo service mongod start

# O ejecutar directamente
mongod

#### 3. Backend Node.js (Terminal 3)
cd backend/service-node
npm run dev

#### 4. Backend Python (Terminal 4)
cd backend/service-python
python main.py

#### 5. Frontend React (Terminal 5)
cd frontend
npm run dev


## 3. Dependencias a Instalar

### Con Docker:

**No necesitas instalar dependencias manualmente**. Docker Compose se encarga automáticamente de:
- Instalar todas las dependencias de Node.js (backend y frontend)
- Instalar todas las dependencias de Python
- Configurar las bases de datos
- Importar los alimentos 

### Sin Docker (Manual):

Debes instalar las dependencias para cada servicio:

#### Backend Node.js

cd backend/service-node
npm install

**Dependencias instaladas:**
- `express` - Framework web
- `mysql2` - Driver MySQL con soporte de Promises
- `bcryptjs` - Encriptación de contraseñas
- `jsonwebtoken` - Autenticación con tokens JWT
- `dotenv` - Gestión de variables de entorno
- `cors` - Control de acceso entre dominios
- `nodemon` (dev) - Recarga automática del servidor

#### Backend Python

cd backend/service-python

# Crear entorno virtual (recomendado)
python -m venv venv

# Activar entorno virtual
# En Windows:
venv\Scripts\activate
# En Linux/Mac:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

**Dependencias instaladas:**
- `fastapi` - Framework web moderno
- `uvicorn` - Servidor ASGI de alto rendimiento
- `pymongo` - Driver MongoDB
- `motor` - Driver MongoDB asíncrono
- `python-dotenv` - Variables de entorno
- `pydantic` - Validación de datos
- `aiohttp` - Cliente HTTP asíncrono
- `requests` - Cliente HTTP

#### Frontend React

cd frontend
npm install

**Dependencias instaladas:**
- `react` - Biblioteca de interfaz de usuario
- `react-dom` - Renderizado del DOM
- `react-router-dom` - Navegación entre páginas
- `axios` - Cliente HTTP para APIs
- `recharts` - Gráficos interactivos
- `vite` - Build tool y servidor de desarrollo
- `eslint` - Linter de código

#### Configurar Base de Datos MySQL

# Conectar a MySQL
mysql -u root -p

# Crear la base de datos
CREATE DATABASE nutrition_db;

# Importar el esquema inicial
USE nutrition_db;
source scripts/init-mysql.sql;

# O desde la terminal directamente:
mysql -u root -p nutrition_db < scripts/init-mysql.sql

#### Importar Alimentos a MongoDB

cd backend/service-python
python etl/import_sample_foods.py

Este script importa **alimentos españoles** organizados en **12 categorías**.


## 4. Arrancar la Parte Servidora

### Con Docker:

# Desde el directorio raíz del proyecto
docker-compose up

# La primera vez tardará unos minutos en:
# 1. Descargar las imágenes de Docker
# 2. Construir los contenedores
# 3. Instalar todas las dependencias
# 4. Arrancar todos los servicios

# Verás estos mensajes cuando esté listo:
# ✅ MySQL: ready for connections (puerto 3306)
# ✅ MongoDB: Waiting for connections (puerto 27017)
# ✅ Backend Node.js: Servidor corriendo en http://localhost:3001
# ✅ Backend Python: Uvicorn running on http://0.0.0.0:8000
# ✅ Frontend: VITE ready - http://localhost:5173/

**Comandos útiles de Docker:**

# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend-node
docker-compose logs -f backend-python

# Reiniciar un servicio
docker-compose restart backend-node

# Parar todos los servicios
docker-compose down

# Parar y eliminar volúmenes (reiniciar bases de datos)
docker-compose down -v

# Ver estado de los servicios
docker-compose ps

### Sin Docker (Manual):

Necesitas **5 terminales** abiertas simultáneamente:

#### Terminal 1: Base de Datos MySQL
# Ya debería estar corriendo (ver sección 1)
# Verificar:
mysql -u root -p -e "SHOW DATABASES;"

#### Terminal 2: Base de Datos MongoDB
# Ya debería estar corriendo (ver sección 1)
# Verificar:
mongosh
> show dbs
> use nutrition_db
> show collections

#### Terminal 3: Backend Node.js
cd backend/service-node

# Crear archivo .env si no existe
echo "DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=rootpassword
DB_NAME=nutrition_db
JWT_SECRET=your-super-secret-jwt-key
PORT=3001
NODE_ENV=development" > .env

# Arrancar servidor
npm run dev

# Salida esperada:
# Servidor corriendo en http://localhost:3001
# ✅ Conexión exitosa a la base de datos MySQL


#### Terminal 4: Backend Python
cd backend/service-python

# Activar entorno virtual (si lo creaste)
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Arrancar servidor
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Salida esperada:
# INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
# INFO:     Started reloader process
# Conexión exitosa a MongoDB


#### Terminal 5: Frontend React
cd frontend

# Crear archivo .env si no existe
echo "VITE_API_NODE_URL=http://localhost:3001
VITE_API_PYTHON_URL=http://localhost:8000" > .env

# Arrancar servidor de desarrollo
npm run dev

# Salida esperada:
# VITE v5.x.x ready in xxx ms
# ➜  Local:   http://localhost:5173/
# ➜  Network: use --host to expose



## 5. Acceder a la Parte Cliente

### URL Principal:

**Abre tu navegador en:** http://localhost:5173

### Pantalla Inicial:

Verás la **pantalla de Login/Registro** de NutriTrack con:
- Formulario de inicio de sesión
- Opción para crear una cuenta nueva
- Validación de contraseñas en tiempo real

### Crear tu Primera Cuenta:

1. Haz clic en **"¿No tienes cuenta? Regístrate"**
2. Completa el formulario:
   - **Nombre**: Tu nombre
   - **Email**: tu@email.com
   - **Contraseña**: Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número
3. Haz clic en **"Registrarse"**
4. Automáticamente serás redirigido al Dashboard

### Pantalla Principal (Dashboard):

Una vez dentro verás:

- **Barra superior**: Logo, navegación y perfil de usuario
- **Selector de fecha**: Para cambiar entre días
- **Calculadora de calorías**: Configura tu objetivo diario
- **Estadísticas del día**:
  - Barra de progreso de calorías
  - Gráfico circular de macronutrientes
  - Gráfico de barras por comida
- **5 secciones de comidas**:
  - 🌅 Desayuno
  - 🍎 Almuerzo
  - 🍽️ Comida
  - 🥤 Merienda
  - 🌙 Cena
- **Botón "+ Añadir alimento"** en cada comida

### Añadir tu Primera Comida:

1. Haz clic en **"+ Añadir alimento"** en cualquier sección
2. Se abrirá un modal de búsqueda
3. Escribe el nombre del alimento (ej: "pollo")
4. Selecciona el alimento de la lista
5. Elige la cantidad y porción
6. Haz clic en **"Añadir al diario"**
7. Verás el alimento añadido y las estadísticas actualizadas en tiempo real

### Otras URLs Disponibles:

| URL | Descripción |
|-----|-------------|
| http://localhost:5173 | Frontend - Aplicación web |
| http://localhost:3001/health | Backend Node.js - Health check |
| http://localhost:8000/health | Backend Python - Health check |
| http://localhost:8000/docs | Backend Python - Documentación Swagger interactiva |
| http://localhost:8000/foods | Backend Python - Lista de alimentos |

### Verificación del Sistema:

Puedes comprobar que todo funciona correctamente abriendo estas URLs:

1. **Frontend funcionando**: http://localhost:5173
   - Deberías ver la pantalla de login

2. **Backend Node.js funcionando**: http://localhost:3001/health
   - Respuesta: `{"status":"ok"}`

3. **Backend Python funcionando**: http://localhost:8000/health
   - Respuesta: `{"ok":true}`

4. **Alimentos cargados**: http://localhost:8000/foods
   - Respuesta: Lista JSON con 54 alimentos

5. **Documentación API**: http://localhost:8000/docs
   - Interfaz Swagger interactiva para probar endpoints


## Información Adicional

### Estructura del Proyecto

NutriTrack/
├── docker-compose.yml              # Configuración de servicios Docker
├── README.md                       # Este archivo
│
├── frontend/                       # Aplicación React
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── components/             # Componentes React
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── Dashboard.jsx
│       │   ├── AddFoodModal.jsx
│       │   ├── MacrosChart.jsx
│       │   └── ...
│       ├── services/
│       │   ├── api.js             # Cliente HTTP
│       │   └── sessionManager.js  # Gestión de sesión
│       ├── App.jsx
│       └── main.jsx
│
├── backend/
│   ├── service-node/               # Backend Node.js + Express
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── server.js              # Punto de entrada
│   │   └── src/
│   │       ├── config/
│   │       │   └── database.js    # Conexión MySQL
│   │       ├── controllers/
│   │       │   ├── authController.js
│   │       │   └── diaryController.js
│   │       ├── middleware/
│   │       │   └── auth.js        # Middleware JWT
│   │       ├── models/
│   │       │   ├── User.js
│   │       │   ├── Diary.js
│   │       │   └── DiaryEntry.js
│   │       └── routes/
│   │           ├── authRoutes.js
│   │           └── diaryRoutes.js
│   │
│   └── service-python/             # Backend Python + FastAPI
│       ├── Dockerfile
│       ├── requirements.txt
│       ├── main.py                # Punto de entrada
│       ├── app/
│       │   ├── config/
│       │   │   └── database.py    # Conexión MongoDB
│       │   ├── models/
│       │   │   └── food.py        # Modelo Pydantic
│       │   ├── routes/
│       │   │   └── foods.py       # Endpoints de alimentos
│       │   └── services/
│       │       └── food_service.py
│       └── etl/
│           └── import_sample_foods.py  # Script importación
│
└── scripts/
    └── init-mysql.sql              # Schema inicial MySQL

### Arquitectura del Sistema

┌─────────────────┐
│  Frontend React │ (Puerto 5173)
│    (Vite)       │
└────────┬────────┘
         │
    ┌────┴─────────────────────┐
    │                          │
    ▼                          ▼
┌──────────────┐      ┌──────────────┐
│ Backend Node │      │ Backend Python│
│   (Express)  │      │   (FastAPI)   │
│ Puerto 3001  │      │  Puerto 8000  │
└──────┬───────┘      └───────┬───────┘
       │                      │
       ▼                      ▼
┌──────────────┐      ┌──────────────┐
│    MySQL     │      │   MongoDB    │
│  Puerto 3306 │      │ Puerto 27017 │
└──────────────┘      └──────────────┘

### Flujo de Datos

1. **Autenticación**: Frontend → Node.js → MySQL → JWT Token
2. **Búsqueda de alimentos**: Frontend → Python → MongoDB → Resultados
3. **Añadir comida**: Frontend → Node.js → MySQL
4. **Consultar diario**: Frontend → Node.js → MySQL

### Características Principales

✅ **Sistema de usuarios**
- Registro con validación de email y contraseña
- Autenticación mediante JWT
- Gestión de sesiones seguras

✅ **Dashboard nutricional**
- Seguimiento de 5 comidas diarias
- Visualización de macronutrientes en tiempo real
- Barra de progreso de calorías
- Cálculo automático de totales

✅ **Búsqueda de alimentos**
- 54 alimentos españoles precargados
- Búsqueda en tiempo real
- 12 categorías organizadas
- Información nutricional detallada

### Base de Datos

#### MySQL - Tablas:
- **users**: Usuarios del sistema
- **diaries**: Diarios diarios de cada usuario
- **diary_entries**: Entradas de alimentos en cada diario

#### MongoDB - Colección:
- **foods**: Catálogo de alimentos con información nutricional

### Tecnologías Utilizadas

- **Frontend**: React 18, React Router, Axios, Vite, Recharts
- **Backend Node.js**: Express, MySQL2, bcryptjs, JWT, CORS
- **Backend Python**: FastAPI, Uvicorn, PyMongo, Pydantic
- **Bases de Datos**: MySQL 8.0, MongoDB 6.0
- **DevOps**: Docker, Docker Compose

### Solución de Problemas

#### El frontend no carga:
# Verificar que el backend Node.js esté funcionando
curl http://localhost:3001/health

# Si no responde, revisar logs
docker-compose logs backend-node

#### Error al buscar alimentos:
# Verificar que el backend Python esté funcionando
curl http://localhost:8000/health

# Verificar que MongoDB tenga alimentos
curl http://localhost:8000/foods

# Si está vacío, importar alimentos
docker-compose exec backend-python python etl/import_sample_foods.py

#### Error de autenticación:
# Verificar que MySQL esté funcionando
docker-compose logs mysql

# Verificar conexión
mysql -h 127.0.0.1 -P 3306 -u nutritrack -pnutritrack123 nutrition_db

#### Resetear todo y empezar de cero:
# Parar todos los servicios
docker-compose down

# Eliminar volúmenes (borra datos)
docker-compose down -v

# Volver a arrancar
docker-compose up --build

## ¡Listo para usar NutriTrack!

Ahora puedes empezar a registrar tus comidas y monitorear tu nutrición. ¡Buena suerte con tus objetivos de salud! 🥗💪
