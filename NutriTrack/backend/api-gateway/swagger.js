const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NutriTrack API Gateway',
      version: '1.0.0',
      description: `
# 🌐 API Gateway de NutriTrack

Este es el **punto de entrada unificado** para todos los servicios de NutriTrack. 
El API Gateway actúa como proxy inteligente que enruta las peticiones a los microservicios correspondientes.

## 🎯 Arquitectura de Microservicios

NutriTrack utiliza una arquitectura basada en microservicios:

### 📦 Microservicios Disponibles:

#### 🔐 Auth & Diary Service (Node.js)
* **Puerto**: 3001
* **Base de datos**: MySQL
* **Responsabilidades**:
  * Autenticación de usuarios (registro, login, JWT)
  * Gestión de perfiles de usuario
  * Cálculo de calorías y macros
  * Gestión de diarios alimentarios
* **Documentación específica**: http://localhost:3001/api-docs

#### 🍎 Food Catalog Service (Python FastAPI)
* **Puerto**: 8000
* **Base de datos**: MongoDB
* **Responsabilidades**:
  * Catálogo de alimentos (500+ productos españoles)
  * Búsqueda y filtrado de alimentos
  * Información nutricional detallada
  * Importación de datos desde Open Food Facts
* **Documentación específica**: http://localhost:8000/docs

## 🚀 Características del Gateway

### Funcionalidades principales:
* ✅ **Routing inteligente** - Enruta automáticamente a cada microservicio
* ✅ **Unified API** - Un solo punto de acceso para el frontend
* ✅ **Rate Limiting** - Protección contra sobrecarga
* ✅ **CORS configurado** - Acceso seguro desde el frontend
* ✅ **Health checks** - Monitoreo del estado de todos los servicios
* ✅ **Logging** - Registro de todas las peticiones
* ✅ **Security headers** - Helmet para seguridad adicional

## 📋 Rutas del Gateway

### Rutas de Autenticación y Diarios (→ Node.js Service)
Todas las rutas que empiezan con \`/api/auth\` y \`/api/diary\` son enrutadas al servicio Node.js:
* \`POST /api/auth/register\` - Registro de usuarios
* \`POST /api/auth/login\` - Login
* \`GET /api/auth/profile\` - Obtener perfil
* \`PUT /api/auth/profile\` - Actualizar perfil
* \`GET /api/diary/:date\` - Obtener diario
* \`POST /api/diary/entries\` - Añadir entrada
* \`PUT /api/diary/entries/:id\` - Actualizar entrada
* \`DELETE /api/diary/entries/:id\` - Eliminar entrada

### Rutas de Alimentos (→ Python Service)
Todas las rutas que empiezan con \`/api/foods\` son enrutadas al servicio Python:
* \`GET /api/foods\` - Listar todos los alimentos
* \`GET /api/foods/search\` - Buscar alimentos
* \`GET /api/foods/categories\` - Obtener categorías
* \`GET /api/foods/:id\` - Obtener alimento por ID
* \`POST /api/foods\` - Crear nuevo alimento

## 🔧 Tecnologías Utilizadas
* **Express** - Framework web
* **http-proxy-middleware** - Proxy HTTP para microservicios
* **Swagger UI** - Documentación interactiva
* **Helmet** - Security headers
* **Morgan** - HTTP request logger
* **express-rate-limit** - Rate limiting

## 📊 Estado de Servicios
El gateway incluye endpoints de health check para monitorear todos los servicios:
* \`GET /health\` - Estado del gateway
* \`GET /health/all\` - Estado de todos los servicios (gateway + microservicios)

## 🔒 Seguridad
* JWT para autenticación (gestionado por Node.js service)
* Rate limiting para prevenir abusos
* CORS configurado específicamente para el frontend
* Helmet para headers de seguridad
* Validación de tokens en rutas protegidas

## 📖 Documentación de Microservicios
Para documentación detallada de cada microservicio:
* **Node.js Service**: http://localhost:3001/api-docs
* **Python Service**: http://localhost:8000/docs
* **API Gateway** (este documento): http://localhost:4000/api-docs

## 💡 Uso Recomendado
El frontend de NutriTrack debe hacer todas sus peticiones al Gateway (puerto 4000) en lugar de conectarse directamente a los microservicios. El Gateway se encargará de enrutar cada petición al servicio correcto.

**Ejemplo de configuración del frontend:**
\`\`\`javascript
// Antes (conexión directa a microservicios):
const AUTH_API = 'http://localhost:3001'
const FOOD_API = 'http://localhost:8000'

// Después (usando el Gateway):
const API_GATEWAY = 'http://localhost:4000'
// Todas las peticiones van al gateway, él se encarga del routing
\`\`\`

## 📝 Notas Importantes
* El Gateway debe iniciarse después de que los microservicios estén funcionando
* Usa Docker Compose para levantar toda la arquitectura automáticamente
* Todos los endpoints mantienen la misma estructura, solo cambia la URL base
      `,
      contact: {
        name: 'NutriTrack Team',
        email: 'info@nutritrack.com',
      },
      license: {
        name: 'MIT License',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'API Gateway - Servidor de desarrollo',
      },
      {
        url: 'http://localhost:3001',
        description: 'Node.js Service (directo) - Solo para desarrollo',
      },
      {
        url: 'http://localhost:8000',
        description: 'Python Service (directo) - Solo para desarrollo',
      },
    ],
    tags: [
      {
        name: 'Gateway',
        description: 'Endpoints del API Gateway (health checks y estado)',
      },
      {
        name: 'Authentication (Node.js)',
        description: '🔐 Endpoints de autenticación - Enrutados al servicio Node.js',
      },
      {
        name: 'Diary (Node.js)',
        description: '📔 Endpoints de diarios - Enrutados al servicio Node.js',
      },
      {
        name: 'Foods (Python)',
        description: '🍎 Endpoints de alimentos - Enrutados al servicio Python',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenido del endpoint /api/auth/login. Se debe incluir en el header Authorization como: Bearer <token>',
        },
      },
      schemas: {
        // Schemas del servicio Node.js
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'ID único del usuario', example: 1 },
            email: { type: 'string', format: 'email', description: 'Email del usuario', example: 'usuario@example.com' },
            name: { type: 'string', description: 'Nombre del usuario', example: 'Juan Pérez' },
            age: { type: 'integer', description: 'Edad del usuario', example: 30 },
            weight: { type: 'number', format: 'float', description: 'Peso en kg', example: 75.5 },
            height: { type: 'number', format: 'float', description: 'Altura en cm', example: 175 },
            gender: { type: 'string', enum: ['male', 'female'], example: 'male' },
            activity_level: { type: 'string', enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'], example: 'moderate' },
            goal: { type: 'string', enum: ['lose', 'maintain', 'gain'], example: 'maintain' },
            daily_calories: { type: 'integer', description: 'Calorías diarias calculadas', example: 2200 },
          },
        },
        DiaryEntry: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'ID único de la entrada', example: 1 },
            diary_id: { type: 'integer', description: 'ID del diario', example: 5 },
            meal_type: { type: 'string', enum: ['desayuno', 'almuerzo', 'comida', 'merienda', 'cena'], example: 'desayuno' },
            food_name: { type: 'string', description: 'Nombre del alimento', example: 'Pechuga de pollo' },
            amount: { type: 'number', description: 'Cantidad en gramos', example: 150 },
            calories: { type: 'number', description: 'Calorías totales', example: 247.5 },
            protein: { type: 'number', description: 'Proteínas en gramos', example: 46.5 },
            carbohydrates: { type: 'number', description: 'Carbohidratos en gramos', example: 0 },
            fat: { type: 'number', description: 'Grasas en gramos', example: 5.4 },
          },
        },
        // Schemas del servicio Python
        Food: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'ID único del alimento (MongoDB)', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', description: 'Nombre del alimento', example: 'Pechuga de pollo' },
            brand: { type: 'string', description: 'Marca del producto', example: 'Carrefour' },
            category: { type: 'string', description: 'Categoría del alimento', example: 'Carnes' },
            nutrients: {
              type: 'object',
              properties: {
                calories: { type: 'number', description: 'Kcal por 100g', example: 165 },
                protein: { type: 'number', description: 'Proteínas por 100g', example: 31 },
                carbs: { type: 'number', description: 'Carbohidratos por 100g', example: 0 },
                fat: { type: 'number', description: 'Grasas por 100g', example: 3.6 },
              },
            },
            portions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: '1 pechuga (150g)' },
                  grams: { type: 'number', example: 150 },
                },
              },
            },
          },
        },
        HealthStatus: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['healthy', 'degraded', 'unhealthy'], example: 'healthy' },
            service: { type: 'string', description: 'Nombre del servicio', example: 'api-gateway' },
            timestamp: { type: 'string', format: 'date-time', description: 'Timestamp del check' },
            uptime: { type: 'number', description: 'Tiempo activo en segundos', example: 3600 },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', description: 'Mensaje de error', example: 'Error al procesar la solicitud' },
            details: { type: 'string', description: 'Detalles del error', example: 'Campo requerido faltante' },
            service: { type: 'string', description: 'Servicio que generó el error', example: 'node-service' },
          },
        },
      },
    },
  },
  apis: ['./server.js', './src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = swaggerSpec;
