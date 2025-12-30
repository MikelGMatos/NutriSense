# 🌐 NutriTrack API Gateway

## Descripción

El API Gateway es el **punto de entrada unificado** para todos los servicios de NutriTrack. Actúa como proxy inteligente que enruta las peticiones a los microservicios correspondientes (Node.js y Python).

## 🎯 Funcionalidades

### Routing Inteligente
- **Rutas de Auth**: `/api/auth/*` → Node.js Service (puerto 3001)
- **Rutas de Diary**: `/api/diary/*` → Node.js Service (puerto 3001)  
- **Rutas de Foods**: `/api/foods/*` → Python Service (puerto 8000)

### Características Adicionales
✅ **Documentación Swagger** - Interfaz interactiva en `/api-docs`  
✅ **Health Checks** - Monitoreo del estado de todos los servicios  
✅ **Rate Limiting** - Protección contra sobrecarga (100 req/15min)  
✅ **CORS** - Configurado para el frontend  
✅ **Security Headers** - Helmet para seguridad  
✅ **Request Logging** - Morgan para logs HTTP  
✅ **Error Handling** - Manejo centralizado de errores

## 📦 Tecnologías

- **Express** - Framework web
- **http-proxy-middleware** - Proxy HTTP
- **Swagger UI** - Documentación interactiva
- **Helmet** - Security headers
- **Morgan** - Request logger
- **express-rate-limit** - Rate limiting

## 🚀 Instalación y Uso

### Con Docker Compose (Recomendado)

```bash
# Desde el directorio raíz del proyecto
docker-compose up api-gateway
```

El gateway estará disponible en `http://localhost:4000`

### Sin Docker (Desarrollo Local)

```bash
# 1. Instalar dependencias
cd backend/api-gateway
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# 3. Iniciar el servidor
npm run dev
```

## 📚 Documentación

### Swagger UI
Una vez iniciado el gateway, accede a la documentación interactiva:

```
http://localhost:4000/api-docs
```

Aquí puedes:
- Ver todos los endpoints disponibles
- Probar las peticiones directamente desde el navegador
- Ver esquemas de datos
- Entender la arquitectura de microservicios

### OpenAPI Spec (JSON)
Obtener la especificación OpenAPI en formato JSON:

```
http://localhost:4000/api-docs.json
```

## 🔗 Endpoints Principales

### Gateway Info
```
GET /                    # Información del gateway
GET /health              # Estado del gateway
GET /health/all          # Estado de todos los servicios
```

### Authentication (→ Node.js)
```
POST /api/auth/register  # Registrar usuario
POST /api/auth/login     # Login
GET  /api/auth/profile   # Obtener perfil
PUT  /api/auth/profile   # Actualizar perfil
```

### Diary (→ Node.js)
```
GET    /api/diary/:date          # Obtener diario
POST   /api/diary/entries        # Añadir entrada
PUT    /api/diary/entries/:id    # Actualizar entrada
DELETE /api/diary/entries/:id    # Eliminar entrada
```

### Foods (→ Python)
```
GET /api/foods                   # Listar alimentos
GET /api/foods/search?q=pollo    # Buscar alimentos
GET /api/foods/categories        # Obtener categorías
GET /api/foods/:id               # Obtener alimento por ID
```

## ⚙️ Configuración

### Variables de Entorno

Archivo `.env`:

```bash
# Gateway Configuration
GATEWAY_PORT=4000
GATEWAY_HOST=0.0.0.0
NODE_ENV=development

# Microservices URLs
AUTH_SERVICE_URL=http://backend-node:3001
FOOD_SERVICE_URL=http://backend-python:8000

# CORS Configuration
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:4000
```

### Rate Limiting

Por defecto:
- **Ventana**: 15 minutos
- **Máximo**: 100 peticiones por IP

Puedes ajustar estos valores en `src/config/services.js`

## 🔒 Seguridad

### Headers de Seguridad (Helmet)
El gateway aplica automáticamente headers de seguridad recomendados:
- X-DNS-Prefetch-Control
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security
- X-Download-Options
- X-Permitted-Cross-Domain-Policies

### Autenticación
El gateway **NO maneja la autenticación directamente**. Simplemente reenvía las peticiones al servicio Node.js que gestiona JWT.

Los tokens JWT deben incluirse en el header `Authorization`:
```
Authorization: Bearer <tu-token-jwt>
```

## 📊 Monitoreo

### Health Check Simple
```bash
curl http://localhost:4000/health
```

Respuesta:
```json
{
  "status": "healthy",
  "service": "api-gateway",
  "timestamp": "2025-12-30T...",
  "uptime": 3600
}
```

### Health Check Completo
```bash
curl http://localhost:4000/health/all
```

Respuesta:
```json
{
  "gateway": { "status": "healthy", ... },
  "services": {
    "auth": { "status": "healthy", ... },
    "food": { "status": "healthy", ... }
  },
  "overallStatus": "healthy"
}
```

## 🔧 Desarrollo

### Estructura del Proyecto
```
api-gateway/
├── server.js              # Servidor principal
├── swagger.js             # Configuración Swagger
├── package.json           # Dependencias
├── Dockerfile             # Container Docker
├── .env                   # Variables de entorno
├── .dockerignore         
└── src/
    └── config/
        └── services.js    # Configuración de servicios
```

### Agregar Nuevas Rutas

1. Añadir la configuración del proxy en `server.js`:
```javascript
app.use('/api/nueva-ruta', createProxyMiddleware({
  target: 'http://nuevo-servicio:puerto',
  changeOrigin: true,
  // ... configuración
}));
```

2. Documentar en Swagger con comentarios JSDoc

3. Actualizar la documentación en `swagger.js` si es necesario

## 🐛 Troubleshooting

### El gateway no se conecta a los microservicios

**Problema**: Error 503 Service Unavailable

**Solución**:
1. Verifica que los microservicios estén funcionando:
   ```bash
   docker-compose ps
   ```
2. Verifica las URLs en las variables de entorno
3. Revisa los logs:
   ```bash
   docker-compose logs api-gateway
   ```

### Problema de CORS

**Problema**: Error de CORS en el frontend

**Solución**:
1. Añade el origen del frontend a `CORS_ORIGINS` en `.env`
2. Reinicia el gateway:
   ```bash
   docker-compose restart api-gateway
   ```

### Rate Limit alcanzado

**Problema**: Error 429 Too Many Requests

**Solución**:
- Espera 15 minutos (ventana de rate limit)
- O ajusta los límites en `src/config/services.js`

## 📝 Notas Importantes

1. **Orden de inicio**: El gateway debe iniciarse DESPUÉS de que los microservicios estén funcionando
   
2. **Conexión del frontend**: Configura el frontend para usar el gateway en lugar de conectarse directamente a los microservicios:
   ```javascript
   // Antes
   const AUTH_API = 'http://localhost:3001'
   const FOOD_API = 'http://localhost:8000'
   
   // Después (usando Gateway)
   const API_GATEWAY = 'http://localhost:4000'
   ```

3. **Docker vs Local**: Las URLs de los servicios son diferentes:
   - **Docker**: `http://backend-node:3001` (usa nombres de servicios)
   - **Local**: `http://localhost:3001` (usa localhost)

4. **Documentación de Microservicios**: El gateway tiene su propia documentación, pero también puedes acceder a:
   - Node.js Service: `http://localhost:3001/api-docs`
   - Python Service: `http://localhost:8000/docs`

## 📄 Licencia

MIT License - NutriTrack Team
