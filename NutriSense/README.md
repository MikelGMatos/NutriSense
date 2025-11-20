# NutriTrack

NutriTrack es una aplicación web de seguimiento nutricional que permite a los usuarios registrar sus comidas diarias, consultar información nutricional de alimentos y monitorear sus macronutrientes en tiempo real. El proyecto implementa una arquitectura de microservicios moderna con React, Node.js y Python.

## Requisitos previos

- Node.js 18.0 o superior
- Python 3.9 o superior
- MySQL 8.0 o superior
- MongoDB 5.0 o superior
- npm 8.0 o superior
- pip 21.0 o superior

## Estructura del proyecto

El proyecto está dividido en tres módulos principales:
- `frontend`: Interfaz de usuario basada en React con Vite
- `service-node`: Backend de autenticación y diarios con Node.js/Express y MySQL
- `service-python`: Backend de catálogo de alimentos con Python/FastAPI y MongoDB

## Instalación y configuración

### 1. Configuración de la base de datos MySQL

Cree la base de datos y las tablas necesarias ejecutando los siguientes comandos en MySQL:

```sql
CREATE DATABASE nutrition_db;
USE nutrition_db;

-- Tabla de usuarios
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de diarios
CREATE TABLE diaries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_date (user_id, date)
);

-- Tabla de entradas de comidas
CREATE TABLE diary_entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  diary_id INT NOT NULL,
  food_name VARCHAR(255) NOT NULL,
  calories INT NOT NULL,
  protein DECIMAL(5,1),
  carbohydrates DECIMAL(5,1),
  fat DECIMAL(5,1),
  quantity DECIMAL(6,1) DEFAULT 1,
  meal_type ENUM('desayuno', 'almuerzo', 'comida', 'merienda', 'cena') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (diary_id) REFERENCES diaries(id) ON DELETE CASCADE
);

-- Índices para optimizar consultas
CREATE INDEX idx_diary_user_date ON diaries(user_id, date);
CREATE INDEX idx_entry_diary ON diary_entries(diary_id);
CREATE INDEX idx_entry_meal_type ON diary_entries(meal_type);
```

### 2. Configuración de MongoDB

Inicie MongoDB y cree la base de datos:

```bash
mongosh

use nutrition_db
db.createCollection("foods")
```

### 3. Configuración del backend Node.js

Navegue a la carpeta `service-node` e instale las dependencias:

```bash
cd service-node
npm install
```

Cree un archivo `.env` con la siguiente configuración:

```env
# Puerto del servidor
PORT=3001

# Configuración de MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña_mysql
DB_NAME=nutrition_db
DB_PORT=3306

# Clave secreta para JWT
JWT_SECRET=tu_clave_secreta_super_segura_cambiar_en_produccion

# CORS Origins
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Entorno
NODE_ENV=development
```

> **Nota**: Modifique `DB_PASSWORD` y `JWT_SECRET` con valores seguros apropiados para su entorno.

### 4. Configuración del backend Python

Navegue a la carpeta `service-python` y cree un entorno virtual:

```bash
cd service-python
python -m venv venv

# Activar entorno virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate
```

Instale las dependencias:

```bash
pip install --break-system-packages -r requirements.txt
```

Importe los datos de ejemplo en MongoDB:

```bash
python etl/import_sample_foods.py
```

Este script importará 12 alimentos de ejemplo con información nutricional completa.

> **Nota**: Para importar datos reales desde Open Food Facts (500+ productos españoles), ejecute:
> ```bash
> python etl/import_from_openfoodfacts.py
> ```
> Este proceso tarda 2-3 minutos y requiere conexión a Internet. Los datos se pueden actualizar en cualquier momento ejecutando el mismo script nuevamente.

### 5. Configuración del frontend

Navegue a la carpeta `frontend` e instale las dependencias:

```bash
cd frontend
npm install
```

## Ejecución del proyecto

Para ejecutar el proyecto completo, necesita iniciar los tres servicios en terminales separadas:

### 1. Iniciar el backend Python (FastAPI)

```bash
cd service-python
# Activar entorno virtual si no está activo
python main.py
```

El servicio se iniciará en el puerto 8000.

### 2. Iniciar el backend Node.js

```bash
cd service-node
npm start
```

Para desarrollo con auto-reload:

```bash
npm run dev
```

El servicio se iniciará en el puerto 3001.

### 3. Iniciar el frontend React

```bash
cd frontend
npm run dev
```

El frontend se iniciará en el puerto 5173.

## Acceso a la aplicación

Una vez que todos los servicios estén en funcionamiento, puede acceder a NutriTrack a través de:

```
http://localhost:5173
```

### Verificación de servicios

Puede verificar que los servicios backend están funcionando correctamente accediendo a:

- **Health check Node.js**: http://localhost:3001/health
- **Health check Python**: http://localhost:8000/health
- **Documentación API Python**: http://localhost:8000/docs

## Características principales

### Sistema de usuarios
- Registro de usuarios con validación de contraseñas
- Autenticación mediante JWT
- Gestión de sesiones con tokens

### Dashboard nutricional
- Seguimiento de 5 categorías de comidas: desayuno, almuerzo, comida, merienda y cena
- Visualización de macronutrientes en tarjetas estadísticas
- Barra de progreso de calorías con código de colores
- Límite de calorías personalizable
- Cálculo automático de totales diarios

### Búsqueda de alimentos
- Búsqueda en tiempo real desde el catálogo MongoDB
- Más de 12 alimentos precargados con información nutricional
- Selección de porciones predefinidas (por unidad, volumen o peso)
- Preview de macros antes de añadir alimentos
- Integración con Open Food Facts API

## Arquitectura del sistema

```
Frontend React (5173) ──┐
                        ├──> Backend Node.js (3001) ──> MySQL (3306)
                        │    - Autenticación JWT
                        │    - Gestión de diarios
                        │    - Entradas de comidas
                        │
                        └──> Backend Python (8000) ──> MongoDB (27017)
                             - Catálogo de alimentos
                             - Búsqueda de alimentos
                             - ETL Open Food Facts
```

### Flujo de datos principal

1. **Autenticación**: Frontend → Node.js → MySQL → JWT
2. **Búsqueda de alimentos**: Frontend → Python → MongoDB → Resultados
3. **Añadir comida**: Frontend calcula macros → Node.js → MySQL

## API Endpoints

### Backend Node.js (Puerto 3001)

#### Autenticación (`/api/auth`)
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil (requiere autenticación)

#### Diarios (`/api/diary`)
- `GET /api/diary/entries/:date` - Obtener entradas del día (requiere autenticación)
- `POST /api/diary/entries/:date` - Añadir entrada (requiere autenticación)
- `DELETE /api/diary/entries/:entryId` - Eliminar entrada (requiere autenticación)

### Backend Python (Puerto 8000)

#### Alimentos (`/api/foods`)
- `GET /api/foods/search?q={query}&limit={limit}` - Buscar alimentos
- `GET /api/foods/categories` - Listar categorías
- `GET /api/foods/{food_id}` - Obtener alimento por ID
- `GET /api/foods` - Listar todos los alimentos (con paginación)
- `POST /api/foods` - Crear nuevo alimento

## Configuración personalizada

Puede modificar la configuración del proyecto editando los siguientes archivos:

- `service-node/.env`: Para cambiar la configuración del backend Node.js (puerto, conexión MySQL, JWT secret)
- `service-python/.env`: Para cambiar la configuración del backend Python (puerto, conexión MongoDB)
- `frontend/.env`: Para cambiar las URLs de las APIs backend

## Base de datos

### Actualización de datos de alimentos

La base de datos de alimentos se puede actualizar manualmente en cualquier momento ejecutando:

```bash
cd service-python
python etl/import_from_openfoodfacts.py
```

Este script:
- Importa 500 productos reales de Open Food Facts España
- Mantiene intactos los productos manuales existentes
- Reemplaza los productos anteriores de Open Food Facts
- Tarda aproximadamente 2-3 minutos
- Requiere conexión a Internet

**Recomendación**: Actualice la base de datos mensualmente para obtener nuevos productos y datos actualizados.

### MySQL - Tablas principales

- **users**: Información de usuarios registrados
- **diaries**: Diarios por usuario y fecha (un diario por día)
- **diary_entries**: Entradas de comidas en cada diario

### MongoDB - Colección foods

Estructura del documento de alimento:

```json
{
  "name": "Pechuga de pollo",
  "category": "Carnes",
  "brand": null,
  "nutritional_info_per_100g": {
    "calories": 165,
    "protein": 31,
    "carbohydrates": 0,
    "fat": 3.6,
    "fiber": 0,
    "sugar": 0,
    "sodium": 74
  },
  "portions": [
    {
      "name": "unidad (150g)",
      "weight_grams": 150,
      "multiplier": 1.5
    }
  ],
  "source": "manual",
  "created_at": "2024-11-20T10:00:00Z",
  "updated_at": "2024-11-20T10:00:00Z"
}
```

## Tecnologías utilizadas

### Frontend
- React 18
- React Router DOM
- Axios
- Vite
- CSS3 personalizado

### Backend Node.js
- Node.js 18+
- Express
- MySQL2 (con Promises)
- bcryptjs
- jsonwebtoken
- dotenv
- cors

### Backend Python
- Python 3.9+
- FastAPI
- Uvicorn
- PyMongo
- Motor (MongoDB async)
- Pydantic
- python-dotenv

### Bases de datos
- MySQL 8.0
- MongoDB 5.0

## Solución de problemas comunes

### Error de conexión a MySQL

Verifique que MySQL esté en ejecución y que las credenciales en el archivo `.env` sean correctas:

```bash
# Windows
net start MySQL80

# Linux/Mac
sudo systemctl start mysql
```

### Error de conexión a MongoDB

Verifique que MongoDB esté en ejecución:

```bash
# Windows
net start MongoDB

# Linux/Mac
sudo systemctl start mongod
```

### Error "JWT_SECRET not configured"

Asegúrese de que el archivo `.env` existe en `service-node/` y contiene la variable `JWT_SECRET` sin espacios ni comillas adicionales.

### Error CORS en el navegador

Verifique que ambos backends tengan CORS configurado correctamente y que el frontend esté en el puerto 5173.

### Puerto ya en uso

Si algún puerto (3001, 8000, 5173) está en uso, puede cambiar el puerto en el archivo `.env` correspondiente o detener el proceso que lo está utilizando:

```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID [PID] /F

# Linux/Mac
lsof -i :3001
kill -9 [PID]
```

### Búsqueda de alimentos no funciona

Verifique que MongoDB tiene datos importados:

```bash
mongosh
use nutrition_db
db.foods.countDocuments()
```

Si está vacío, ejecute el script de importación:

```bash
cd service-python
python etl/import_sample_foods.py
```

## Verificación del sistema

Puede verificar que todos los componentes están funcionando correctamente accediendo a:

1. **Frontend**: http://localhost:5173 - Debe mostrar la pantalla de login
2. **Backend Node.js**: http://localhost:3001/health - Debe retornar `{ status: 'ok' }`
3. **Backend Python**: http://localhost:8000/health - Debe retornar `{ status: 'ok' }`
4. **Documentación API**: http://localhost:8000/docs - Debe mostrar la interfaz Swagger

## Contacto y soporte

Para obtener ayuda o reportar problemas, puede crear un nuevo issue en el repositorio del proyecto.

## Licencia

Este proyecto está licenciado bajo la licencia MIT. Consulte el archivo LICENSE para más detalles.
