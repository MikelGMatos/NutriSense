# NutriTrack - Sistema de Seguimiento Nutricional

NutriTrack es una aplicación web completa de seguimiento nutricional que permite a los usuarios registrar sus comidas diarias, consultar información nutricional de alimentos y monitorear sus macronutrientes en tiempo real.

---

## 📋 Tabla de Contenidos

- [Opción A: Arrancar con Docker (RECOMENDADO)](#opción-a-arrancar-con-docker-recomendado)
- [Opción B: Arrancar sin Docker (Manual)](#opción-b-arrancar-sin-docker-manual)
- [Acceder a la Aplicación](#acceder-a-la-aplicación)

---

## Opción A: Arrancar con Docker (RECOMENDADO)

Esta es la forma más sencilla de ejecutar NutriTrack. Docker se encarga de todo automáticamente.

> 💡 **¿Primera vez con Docker?** Para una guía detallada con instalación paso a paso en Windows/Mac/Linux y comandos avanzados, consulta [DOCKER_README.md](DOCKER_README.md)

### 1. Software Necesario

Solo necesitas tener instalado:

- **Docker Desktop** v4.0 o superior
  - Descarga: https://www.docker.com/products/docker-desktop/
  - Incluye Docker Compose automáticamente
  - Requiere: 4GB RAM disponible, 2GB espacio en disco

### 2. Arrancar todos los servicios

Desde el directorio raíz del proyecto, ejecuta:

```bash
docker-compose up
```

O si quieres forzar la reconstrucción:

```bash
docker-compose up --build
```

**⏱️ Espera 2-3 minutos** hasta ver este mensaje (indica que los alimentos se han importado):
```
nutritrack-backend-python  | INFO:     127.0.0.1:51880 - "GET /health HTTP/1.1" 200 OK
```

Si prefieres ejecutar en segundo plano:

```bash
docker-compose up -d
```

### 3. Servicios que arranca Docker

Docker arranca automáticamente estos 5 servicios:

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| **mysql** | 3306 | Base de datos relacional (usuarios y diarios) |
| **mongodb** | 27017 | Base de datos de documentos (catálogo de alimentos) |
| **backend-node** | 3001 | API REST de autenticación y gestión de diarios |
| **backend-python** | 8000 | API REST del catálogo de alimentos |
| **frontend** | 5173 | Aplicación web React |

### 4. Mensajes esperados

Cuando todo esté listo verás:

```
✅ MySQL: ready for connections (puerto 3306)
✅ MongoDB: Waiting for connections (puerto 27017)
✅ Backend Node.js: Servidor corriendo en http://localhost:3001
✅ Backend Python: Uvicorn running on http://0.0.0.0:8000
✅ Frontend: VITE ready - http://localhost:5173/
```

### 5. Comandos útiles de Docker

```bash
# Iniciar servicios
docker-compose up                    # Primera vez o después de cambios
docker-compose up --build           # Forzar reconstrucción
docker-compose up -d                # En segundo plano (detached mode)

# Ver logs
docker-compose logs -f              # Todos los servicios
docker-compose logs -f backend-node # Un servicio específico
docker-compose logs -f backend-python
docker-compose logs -f frontend

# Gestión de servicios
docker-compose restart backend-node  # Reiniciar un servicio
docker-compose ps                    # Ver estado de servicios
docker-compose down                  # Parar todos los servicios
docker-compose down -v              # Parar y borrar bases de datos

# Acceder a contenedores (avanzado)
docker-compose exec backend-node sh
docker-compose exec mysql mysql -u nutritrack -pnutritrack123 nutrition_db
docker-compose exec mongodb mongosh
```

### 6. Verificar que todo funciona

Abre estas URLs en tu navegador:

1. **Frontend**: http://localhost:5173 ✅ (Deberías ver la pantalla de login)
2. **Backend Node.js**: http://localhost:3001/health ✅ (Respuesta: `{"status":"ok"}`)
3. **Backend Python**: http://localhost:8000/health ✅ (Respuesta: `{"ok":true}`)
4. **Alimentos**: http://localhost:8000/foods ✅ (Lista JSON con alimentos)
5. **Documentación API**: http://localhost:8000/docs ✅ (Interfaz Swagger)

### ✅ ¡Listo! Salta a la sección [Acceder a la Aplicación](#acceder-a-la-aplicación)

---

## Opción B: Arrancar sin Docker (Manual)

Si prefieres ejecutar cada servicio manualmente sin Docker, sigue estos pasos.

### 1. Software Necesario

Necesitas instalar lo siguiente en tu sistema:

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

### 2. Instalar dependencias

#### Backend Node.js

```bash
cd backend/service-node
npm install
```

**Dependencias instaladas:**
- `express` - Framework web
- `mysql2` - Driver MySQL con soporte de Promises
- `bcryptjs` - Encriptación de contraseñas
- `jsonwebtoken` - Autenticación con tokens JWT
- `dotenv` - Gestión de variables de entorno
- `cors` - Control de acceso entre dominios
- `nodemon` (dev) - Recarga automática del servidor

#### Backend Python

```bash
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
```

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

```bash
cd frontend
npm install
```

**Dependencias instaladas:**
- `react` - Biblioteca de interfaz de usuario
- `react-dom` - Renderizado del DOM
- `react-router-dom` - Navegación entre páginas
- `axios` - Cliente HTTP para APIs
- `recharts` - Gráficos interactivos
- `vite` - Build tool y servidor de desarrollo
- `eslint` - Linter de código

### 3. Configurar bases de datos

#### Configurar MySQL

```bash
# Conectar a MySQL
mysql -u root -p

# Crear la base de datos
CREATE DATABASE nutrition_db;

# Importar el esquema inicial
USE nutrition_db;
source scripts/init-mysql.sql;

# O desde la terminal directamente:
mysql -u root -p nutrition_db < scripts/init-mysql.sql
```

#### Importar alimentos a MongoDB

```bash
cd backend/service-python
python etl/import_sample_foods.py
```

Este script importa alimentos españoles organizados en 12 categorías.

### 4. Arrancar los servicios

Necesitas **5 terminales** abiertas simultáneamente:

#### Terminal 1: MySQL

```bash
# En Windows
mysql.server start

# En Linux/Mac
sudo service mysql start

# O usar MySQL Workbench para iniciar el servidor

# Verificar:
mysql -u root -p -e "SHOW DATABASES;"
```

#### Terminal 2: MongoDB

```bash
# En Windows
net start MongoDB

# En Linux/Mac
sudo service mongod start

# O ejecutar directamente
mongod

# Verificar:
mongosh
> show dbs
> use nutrition_db
> show collections
```

#### Terminal 3: Backend Node.js

```bash
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
```

#### Terminal 4: Backend Python

```bash
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
```

#### Terminal 5: Frontend React

```bash
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
```

### 5. Verificar que todo funciona

Abre estas URLs en tu navegador:

1. **Frontend**: http://localhost:5173 ✅ (Deberías ver la pantalla de login)
2. **Backend Node.js**: http://localhost:3001/health ✅ (Respuesta: `{"status":"ok"}`)
3. **Backend Python**: http://localhost:8000/health ✅ (Respuesta: `{"ok":true}`)
4. **Alimentos**: http://localhost:8000/foods ✅ (Lista JSON con alimentos)
5. **Documentación API**: http://localhost:8000/docs ✅ (Interfaz Swagger)

---

## Acceder a la Aplicación

### URL Principal

**Abre tu navegador en:** http://localhost:5173

### Pantalla Inicial

Verás la **pantalla de Login/Registro** de NutriTrack con:
- Formulario de inicio de sesión
- Opción para crear una cuenta nueva
- Validación de contraseñas en tiempo real

### Crear tu Primera Cuenta

1. Haz clic en **"¿No tienes cuenta? Regístrate"**
2. Completa el formulario:
   - **Nombre**: Tu nombre
   - **Email**: tu@email.com
   - **Contraseña**: Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número
3. Haz clic en **"Registrarse"**
4. Automáticamente serás redirigido al Dashboard

### Pantalla Principal (Dashboard)

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

### Añadir tu Primera Comida

1. Haz clic en **"+ Añadir alimento"** en cualquier sección
2. Se abrirá un modal de búsqueda
3. Escribe el nombre del alimento (ej: "pollo")
4. Selecciona el alimento de la lista
5. Elige la cantidad y porción
6. Haz clic en **"Añadir al diario"**
7. Verás el alimento añadido y las estadísticas actualizadas en tiempo real

---

## ¡Listo para usar NutriTrack!

Ahora puedes empezar a registrar tus comidas y monitorear tu nutrición. ¡Buena suerte con tus objetivos de salud! 🥗💪
