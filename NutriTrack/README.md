# NutriTrack

NutriTrack es una aplicación web de seguimiento nutricional que permite a los usuarios registrar sus comidas diarias, consultar información nutricional de alimentos y monitorear sus macronutrientes en tiempo real. El proyecto implementa una arquitectura de microservicios moderna con React, Node.js y Python.

## 🚀 Inicio Rápido con Docker (Recomendado)

La forma más sencilla de ejecutar NutriTrack es usando Docker Compose, que configura automáticamente todos los servicios necesarios.

### Requisitos previos

- **Docker Desktop** 4.0 o superior: https://www.docker.com/products/docker-desktop/
- **Docker Compose** 2.0 o superior (incluido con Docker Desktop)
- 4GB de RAM disponible
- 2GB de espacio en disco

### Instalación y ejecución

1. **Clonar el repositorio:**
```bash
git clone [URL_DEL_REPOSITORIO]
cd NutriTrack
```

2. **Iniciar todos los servicios:**
```bash
docker-compose up
```

O para reconstruir las imágenes:
```bash
docker-compose up --build
```

3. **Acceder a la aplicación:**

Una vez que veas estos mensajes en la consola, la aplicación estará lista:

```
✅ MySQL: ready for connections (puerto 3306)
✅ MongoDB: Waiting for connections (puerto 27017)
✅ Backend Node.js: Servidor corriendo en http://localhost:3001
✅ Backend Python: Uvicorn running on http://0.0.0.0:8000
✅ Frontend: VITE ready - http://localhost:5173/
```

**Abre tu navegador en:** http://localhost:5173

### Comandos útiles de Docker

```bash
# Iniciar servicios (en segundo plano)
docker-compose up -d

# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f frontend
docker-compose logs -f backend-node
docker-compose logs -f backend-python

# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (reiniciar bases de datos)
docker-compose down -v

# Reiniciar un servicio específico
docker-compose restart backend-node

# Ver estado de los servicios
docker-compose ps
```

### Estructura de contenedores

Docker Compose crea 5 contenedores:

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| **frontend** | 5173 | Interfaz React con Vite |
| **backend-node** | 3001 | API de autenticación y diarios |
| **backend-python** | 8000 | API de catálogo de alimentos |
| **mysql** | 3306 | Base de datos relacional |
| **mongodb** | 27017 | Base de datos de alimentos |

### Verificación del sistema

Puedes verificar que todos los servicios están funcionando:

1. **Frontend**: http://localhost:5173 - Pantalla de login
2. **Backend Node.js**: http://localhost:3001/health - `{"status":"ok"}`
3. **Backend Python**: http://localhost:8000/health - `{"ok":true}`
4. **Documentación API**: http://localhost:8000/docs - Interfaz Swagger
5. **Alimentos disponibles**: http://localhost:8000/foods - Lista de 54 alimentos

### Datos precargados

Al iniciar por primera vez, el sistema:
- ✅ Crea automáticamente las tablas en MySQL
- ✅ Importa 54 alimentos españoles en MongoDB
- ✅ Configura las bases de datos necesarias

No necesitas ejecutar scripts de importación manualmente.

## 📦 Estructura del proyecto

```
NutriTrack/
├── docker-compose.yml          # Configuración de servicios
├── frontend/                   # React + Vite
│   ├── Dockerfile
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── service-node/          # Node.js + Express
│   │   ├── Dockerfile
│   │   ├── server.js
│   │   ├── package.json
│   │   └── .env.example
│   └── service-python/        # Python + FastAPI
│       ├── Dockerfile
│       ├── main.py
│       ├── requirements.txt
│       └── etl/
│           └── import_sample_foods.py
└── scripts/
    └── init-mysql.sql         # Schema de MySQL
```

---

## 🏗️ Arquitectura del sistema

```
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
```

### Flujo de datos

1. **Autenticación**: Frontend → Node.js → MySQL → JWT Token
2. **Búsqueda de alimentos**: Frontend → Python → MongoDB → Resultados
3. **Añadir comida al diario**: Frontend → Node.js → MySQL
4. **Consultar diario**: Frontend → Node.js → MySQL

---

## 🎯 Características principales

### Sistema de usuarios
- ✅ Registro con validación de email y contraseña
- ✅ Autenticación mediante JWT
- ✅ Gestión de sesiones seguras
- ✅ Protección de rutas privadas

### Dashboard nutricional
- ✅ Seguimiento de 5 comidas diarias: desayuno, almuerzo, comida, merienda y cena
- ✅ Visualización de macronutrientes en tiempo real
- ✅ Barra de progreso de calorías con código de colores
- ✅ Cálculo automático de totales diarios
- ✅ Límite de calorías personalizable

### Búsqueda de alimentos
- ✅ Búsqueda en tiempo real desde MongoDB
- ✅ 54 alimentos españoles precargados
- ✅ Información nutricional detallada por 100g
- ✅ Selección de porciones predefinidas
- ✅ 12 categorías organizadas

---

## 📚 API Endpoints

### Backend Node.js (Puerto 3001)

#### Autenticación (`/api/auth`)
```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/profile (requiere autenticación)
```

#### Diarios (`/api/diary`)
```
GET    /api/diary/entries/:date (requiere autenticación)
POST   /api/diary/entries/:date (requiere autenticación)
DELETE /api/diary/entries/:entryId (requiere autenticación)
```

### Backend Python (Puerto 8000)

#### Alimentos (`/foods`)
```
GET  /foods/search?q={query}&limit={limit}
GET  /foods/categories
GET  /foods/{food_id}
GET  /foods (con paginación)
POST /foods
```

#### Health Check
```
GET /health
```

**Documentación interactiva:** http://localhost:8000/docs

---

## 🗄️ Base de datos

### MySQL - Tablas principales

**users**
```sql
- id (PK)
- email (UNIQUE)
- password_hash
- name
- created_at
```

**diaries**
```sql
- id (PK)
- user_id (FK → users)
- date (UNIQUE con user_id)
- created_at
```

**diary_entries**
```sql
- id (PK)
- diary_id (FK → diaries)
- food_name
- calories, protein, carbohydrates, fat
- quantity
- meal_type (desayuno, almuerzo, comida, merienda, cena)
- created_at
```

### MongoDB - Colección `foods`

Estructura del documento:

```json
{
  "name": "Pechuga de pollo",
  "category": "Carnes y Embutidos",
  "nutrients": {
    "calories": 165,
    "protein": 31,
    "carbs": 0,
    "fat": 3.6,
    "fiber": 0
  },
  "portions": [
    {
      "name": "filete",
      "grams": 150
    }
  ],
  "source": "manual"
}
```

### Categorías de alimentos disponibles

1. Lácteos (6 productos)
2. Carnes y Embutidos (6 productos)
3. Pescados y Mariscos (4 productos)
4. Huevos (2 productos)
5. Cereales y Granos (5 productos)
6. Legumbres (3 productos)
7. Verduras y Hortalizas (8 productos)
8. Frutas (8 productos)
9. Frutos Secos (3 productos)
10. Aceites y Grasas (2 productos)
11. Panadería (4 productos)
12. Bebidas (3 productos)

**Total: 54 alimentos**

---

## 🛠️ Tecnologías utilizadas

### Frontend
- **React** 18 - Biblioteca de interfaz de usuario
- **React Router DOM** - Navegación
- **Axios** - Cliente HTTP
- **Vite** - Build tool y dev server
- **CSS3** - Estilos personalizados con gradientes y animaciones

### Backend Node.js
- **Node.js** 18+
- **Express** - Framework web
- **MySQL2** - Driver de MySQL con Promises
- **bcryptjs** - Hash de contraseñas
- **jsonwebtoken** - Autenticación JWT
- **cors** - Manejo de CORS
- **dotenv** - Variables de entorno

### Backend Python
- **Python** 3.11+
- **FastAPI** - Framework web moderno
- **Uvicorn** - Servidor ASGI
- **PyMongo** - Driver de MongoDB
- **Pydantic** - Validación de datos
- **python-dotenv** - Variables de entorno

### Bases de datos
- **MySQL** 8.0 - Datos relacionales (usuarios, diarios)
- **MongoDB** 6.0 - Datos no relacionales (alimentos)

### DevOps
- **Docker** - Contenedorización
- **Docker Compose** - Orquestación de servicios

---

## 🔧 Configuración avanzada

### Variables de entorno

Puedes personalizar la configuración editando `docker-compose.yml`:

**Backend Node.js:**
```yaml
environment:
  - PORT=3001
  - DB_HOST=mysql
  - DB_USER=root
  - DB_PASSWORD=rootpassword
  - DB_NAME=nutrition_db
  - JWT_SECRET=your-super-secret-key
```

**Backend Python:**
```yaml
environment:
  - MONGO_URI=mongodb://mongodb:27017
  - MONGO_DB=nutrition_db
```

### Cambiar puertos

Si necesitas cambiar los puertos expuestos, edita `docker-compose.yml`:

```yaml
services:
  frontend:
    ports:
      - "8080:5173"  # Cambiar 8080 por el puerto deseado
```

---

## 🐛 Desarrollo manual (sin Docker)

Si prefieres ejecutar los servicios manualmente para desarrollo avanzado:

### Requisitos
- Node.js 20.0+
- Python 3.11+
- MySQL 8.0+
- MongoDB 6.0+

### 1. Configurar bases de datos

**MySQL:**
```bash
mysql -u root -p < scripts/init-mysql.sql
```

**MongoDB:**
```bash
mongosh
use nutrition_db
db.createCollection("foods")
```

### 2. Backend Node.js

```bash
cd backend/service-node
npm install
cp .env.example .env
# Editar .env con tus credenciales
npm run dev
```

### 3. Backend Python

```bash
cd backend/service-python
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python etl/import_sample_foods.py
python main.py
```

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Testing

### Probar endpoints con cURL

**Registrar usuario:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

**Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Buscar alimentos:**
```bash
curl http://localhost:8000/foods/search?q=pollo&limit=5
```

---

## 📝 Notas importantes

### Seguridad
- ⚠️ Cambia `JWT_SECRET` en producción
- ⚠️ Usa contraseñas seguras para MySQL
- ⚠️ Habilita HTTPS en producción
- ⚠️ No expongas puertos de bases de datos públicamente

### Rendimiento
- El sistema está optimizado para ~1000 alimentos en MongoDB
- MySQL maneja eficientemente hasta 100k entradas de diario
- Frontend usa lazy loading para mejor performance

### Backup
Para hacer backup de los datos:

```bash
# MySQL
docker exec nutritrack-mysql mysqldump -u root -prootpassword nutrition_db > backup.sql

# MongoDB
docker exec nutritrack-mongodb mongodump --out /backup
docker cp nutritrack-mongodb:/backup ./mongodb-backup
```

---

## 🤝 Contribución

Para contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está licenciado bajo la licencia MIT. Consulta el archivo LICENSE para más detalles.

---

## 📞 Soporte

¿Necesitas ayuda? Puedes:
- Crear un issue en GitHub
- Consultar la documentación de la API en http://localhost:8000/docs
- Revisar los logs de Docker: `docker-compose logs -f`

---

## 🎉 ¡Disfruta de NutriTrack!

Ahora estás listo para empezar a rastrear tu nutrición. ¡Buena suerte con tus objetivos de salud! 🥗💪
