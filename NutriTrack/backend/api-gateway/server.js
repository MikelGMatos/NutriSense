require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const axios = require('axios');

const config = require('./src/config/services');

const app = express();

// ============================================
// CONFIGURACIÓN Y SEGURIDAD
// ============================================

// Security headers
app.use(helmet());

// CORS
app.use(cors(config.cors));

// ⭐ IMPORTANTE: NO usar express.json() aquí porque consume el body
// y luego el proxy no puede re-enviarlo. El proxy maneja el body automáticamente.

// Body parser SOLO para rutas que NO son proxy (health, docs, etc.)
// Las rutas /api/* serán manejadas por el proxy que pasa el body automáticamente
app.use((req, res, next) => {
  // Si la ruta empieza con /api/, NO parsear el body (lo hace el proxy)
  if (req.path.startsWith('/api/')) {
    return next();
  }
  // Para otras rutas, sí parsear
  express.json()(req, res, next);
});

app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    error: 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo más tarde.',
    retryAfter: '15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Middleware para logging de requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============================================
// DOCUMENTACIÓN SWAGGER
// ============================================

/**
 * @swagger
 * /api-docs:
 *   get:
 *     summary: Documentación Swagger UI
 *     description: Interfaz visual interactiva para explorar y probar la API
 *     tags: [Gateway]
 */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: `
    .swagger-ui .topbar { 
      display: none; 
    }
    .swagger-ui .info { 
      margin: 20px 0; 
    }
    .swagger-ui .scheme-container {
      background: #fafafa;
      box-shadow: none;
      padding: 20px;
    }
  `,
  customSiteTitle: 'NutriTrack API Gateway - Documentación',
  customfavIcon: '/favicon.ico',
}));

/**
 * @swagger
 * /api-docs.json:
 *   get:
 *     summary: Especificación OpenAPI en formato JSON
 *     description: Obtener el esquema OpenAPI completo en formato JSON
 *     tags: [Gateway]
 *     responses:
 *       200:
 *         description: Especificación OpenAPI
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ============================================
// HEALTH CHECKS
// ============================================

/**
 * @swagger
 * /:
 *   get:
 *     summary: Información del API Gateway
 *     description: Obtener información básica del gateway y enlaces útiles
 *     tags: [Gateway]
 *     responses:
 *       200:
 *         description: Información del gateway
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "NutriTrack API Gateway"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 docs:
 *                   type: string
 *                   example: "/api-docs"
 *                 health:
 *                   type: string
 *                   example: "/health"
 *                 services:
 *                   type: object
 *                   properties:
 *                     auth:
 *                       type: string
 *                       example: "http://backend-node:3001"
 *                     food:
 *                       type: string
 *                       example: "http://backend-python:8000"
 */
app.get('/', (req, res) => {
  res.json({
    message: 'NutriTrack API Gateway',
    version: '1.0.0',
    docs: '/api-docs',
    health: '/health',
    services: {
      auth: config.services.auth.url,
      food: config.services.food.url,
    },
    endpoints: {
      authentication: '/api/auth/*',
      diary: '/api/diary/*',
      foods: '/api/foods/*',
    },
  });
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Estado del API Gateway
 *     description: Verificar que el API Gateway está funcionando correctamente
 *     tags: [Gateway]
 *     responses:
 *       200:
 *         description: Gateway funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthStatus'
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * @swagger
 * /health/all:
 *   get:
 *     summary: Estado de todos los servicios
 *     description: Verificar el estado del gateway y todos los microservicios
 *     tags: [Gateway]
 *     responses:
 *       200:
 *         description: Estado de todos los servicios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 gateway:
 *                   $ref: '#/components/schemas/HealthStatus'
 *                 services:
 *                   type: object
 *                   properties:
 *                     auth:
 *                       $ref: '#/components/schemas/HealthStatus'
 *                     food:
 *                       $ref: '#/components/schemas/HealthStatus'
 */
app.get('/health/all', async (req, res) => {
  const results = {
    gateway: {
      status: 'healthy',
      service: 'api-gateway',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
    services: {},
  };

  // Check Auth Service
  try {
    const authResponse = await axios.get(
      `${config.services.auth.url}${config.services.auth.healthPath}`,
      { timeout: 5000 }
    );
    results.services.auth = {
      status: 'healthy',
      name: config.services.auth.name,
      response: authResponse.data,
    };
  } catch (error) {
    results.services.auth = {
      status: 'unhealthy',
      name: config.services.auth.name,
      error: error.message,
    };
  }

  // Check Food Service
  try {
    const foodResponse = await axios.get(
      `${config.services.food.url}${config.services.food.healthPath}`,
      { timeout: 5000 }
    );
    results.services.food = {
      status: 'healthy',
      name: config.services.food.name,
      response: foodResponse.data,
    };
  } catch (error) {
    results.services.food = {
      status: 'unhealthy',
      name: config.services.food.name,
      error: error.message,
    };
  }

  const overallStatus = 
    results.services.auth.status === 'healthy' && 
    results.services.food.status === 'healthy'
      ? 'healthy'
      : 'degraded';

  res.json({
    ...results,
    overallStatus,
  });
});

// ============================================
// PROXY A MICROSERVICIOS
// ============================================

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     description: Crear una nueva cuenta de usuario (Proxy a Node.js Service)
 *     tags: [Authentication (Node.js)]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: Datos inválidos
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     description: Autenticar usuario y obtener token JWT (Proxy a Node.js Service)
 *     tags: [Authentication (Node.js)]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Credenciales inválidas
 */

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Obtener perfil del usuario
 *     description: Obtener información del perfil del usuario autenticado (Proxy a Node.js Service)
 *     tags: [Authentication (Node.js)]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *   put:
 *     summary: Actualizar perfil del usuario
 *     description: Actualizar información del perfil (Proxy a Node.js Service)
 *     tags: [Authentication (Node.js)]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               age:
 *                 type: integer
 *               weight:
 *                 type: number
 *               height:
 *                 type: number
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *               activity_level:
 *                 type: string
 *               goal:
 *                 type: string
 *     responses:
 *       200:
 *         description: Perfil actualizado
 */

// Proxy para Auth Service (Node.js)
app.use('/api/auth', createProxyMiddleware({
  target: config.services.auth.url,
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '/api/auth',
  },
  timeout: config.proxy.timeout,
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[PROXY] → Auth Service: ${req.method} ${req.path}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[PROXY] ← Auth Service: ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    console.error('[PROXY ERROR] Auth Service:', err.message);
    res.status(503).json({
      error: 'Service Unavailable',
      message: 'Auth service is currently unavailable',
      service: 'auth-service',
    });
  },
}));

/**
 * @swagger
 * /api/diary/{date}:
 *   get:
 *     summary: Obtener diario por fecha
 *     description: Obtener todas las entradas del diario para una fecha específica (Proxy a Node.js Service)
 *     tags: [Diary (Node.js)]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha en formato YYYY-MM-DD
 *     responses:
 *       200:
 *         description: Entradas del diario
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DiaryEntry'
 */

/**
 * @swagger
 * /api/diary/entries:
 *   post:
 *     summary: Añadir entrada al diario
 *     description: Crear una nueva entrada de alimento en el diario (Proxy a Node.js Service)
 *     tags: [Diary (Node.js)]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - meal_type
 *               - food_name
 *               - amount
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               meal_type:
 *                 type: string
 *                 enum: [desayuno, almuerzo, comida, merienda, cena]
 *               food_name:
 *                 type: string
 *               amount:
 *                 type: number
 *               calories:
 *                 type: number
 *               protein:
 *                 type: number
 *               carbohydrates:
 *                 type: number
 *               fat:
 *                 type: number
 *     responses:
 *       201:
 *         description: Entrada creada exitosamente
 */

/**
 * @swagger
 * /api/diary/entries/{id}:
 *   put:
 *     summary: Actualizar entrada del diario
 *     description: Modificar una entrada existente (Proxy a Node.js Service)
 *     tags: [Diary (Node.js)]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Entrada actualizada
 *   delete:
 *     summary: Eliminar entrada del diario
 *     description: Borrar una entrada del diario (Proxy a Node.js Service)
 *     tags: [Diary (Node.js)]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Entrada eliminada
 */

// ⭐ Proxy para Auth Service (Node.js) - CRITICAL: Debe ir ANTES de /api/diary
app.use('/api/auth', createProxyMiddleware({
  target: config.services.auth.url,
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '/api/auth',
  },
  timeout: 60000, // 60 segundos
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[PROXY AUTH] → ${req.method} ${req.path}`);
    console.log(`[PROXY AUTH] → Target: ${config.services.auth.url}${req.path}`);
    
    // El proxy middleware maneja el body automáticamente
    // No intentar leer req.body porque puede estar undefined si no se parseó
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[PROXY AUTH] ← ${proxyRes.statusCode} ${req.method} ${req.path}`);
  },
  onError: (err, req, res) => {
    console.error('[PROXY AUTH ERROR]', {
      message: err.message,
      method: req.method,
      path: req.path,
      code: err.code,
    });
    res.status(503).json({
      error: 'Service Unavailable',
      message: 'Auth service is currently unavailable',
      service: 'auth-service',
      details: err.message,
    });
  },
}));

// Proxy para Diary Service (Node.js)
app.use('/api/diary', createProxyMiddleware({
  target: config.services.auth.url,
  changeOrigin: true,
  pathRewrite: {
    '^/api/diary': '/api/diary',
  },
  timeout: 60000,
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[PROXY DIARY] → ${req.method} ${req.path}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[PROXY DIARY] ← ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    console.error('[PROXY DIARY ERROR]:', err.message);
    res.status(503).json({
      error: 'Service Unavailable',
      message: 'Diary service is currently unavailable',
      service: 'diary-service',
    });
  },
}));

/**
 * @swagger
 * /api/foods:
 *   get:
 *     summary: Listar todos los alimentos
 *     description: Obtener lista completa de alimentos disponibles (Proxy a Python Service)
 *     tags: [Foods (Python)]
 *     responses:
 *       200:
 *         description: Lista de alimentos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Food'
 */

/**
 * @swagger
 * /api/foods/search:
 *   get:
 *     summary: Buscar alimentos
 *     description: Buscar alimentos por nombre, marca o categoría (Proxy a Python Service)
 *     tags: [Foods (Python)]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Término de búsqueda
 *         example: pollo
 *     responses:
 *       200:
 *         description: Resultados de búsqueda
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Food'
 */

/**
 * @swagger
 * /api/foods/categories:
 *   get:
 *     summary: Obtener categorías de alimentos
 *     description: Listar todas las categorías disponibles (Proxy a Python Service)
 *     tags: [Foods (Python)]
 *     responses:
 *       200:
 *         description: Lista de categorías
 */

/**
 * @swagger
 * /api/foods/{id}:
 *   get:
 *     summary: Obtener alimento por ID
 *     description: Obtener información detallada de un alimento específico (Proxy a Python Service)
 *     tags: [Foods (Python)]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del alimento (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Detalles del alimento
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Food'
 */

// Proxy para Food Service (Python)
app.use('/api/foods', createProxyMiddleware({
  target: config.services.food.url,
  changeOrigin: true,
  pathRewrite: {
    '^/api/foods': '/api/foods',
  },
  timeout: 60000,
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[PROXY FOODS] → ${req.method} ${req.path}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[PROXY FOODS] ← ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    console.error('[PROXY FOODS ERROR]:', err.message);
    res.status(503).json({
      error: 'Service Unavailable',
      message: 'Food service is currently unavailable',
      service: 'food-service',
    });
  },
}));

// ============================================
// 404 HANDLER
// ============================================
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `La ruta ${req.originalUrl} no existe`,
    availableRoutes: {
      docs: '/api-docs',
      health: '/health',
      auth: '/api/auth/*',
      diary: '/api/diary/*',
      foods: '/api/foods/*',
    },
  });
});

// ============================================
// ERROR HANDLER
// ============================================
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ============================================
// INICIAR SERVIDOR
// ============================================
const PORT = config.gateway.port;
const HOST = config.gateway.host;

app.listen(PORT, HOST, () => {
  console.log('\n' + '='.repeat(80));
  console.log('🚀 NUTRITRACK API GATEWAY');
  console.log('='.repeat(80));
  console.log(`🌐 Gateway URL:       http://localhost:${PORT}`);
  console.log(`📚 Swagger Docs:      http://localhost:${PORT}/api-docs`);
  console.log(`📋 OpenAPI Spec:      http://localhost:${PORT}/api-docs.json`);
  console.log(`❤️  Health Check:      http://localhost:${PORT}/health`);
  console.log(`📊 All Health:        http://localhost:${PORT}/health/all`);
  console.log('─'.repeat(80));
  console.log('📦 Microservices:');
  console.log(`   🔐 Auth & Diary:   ${config.services.auth.url}`);
  console.log(`   🍎 Food Catalog:   ${config.services.food.url}`);
  console.log('─'.repeat(80));
  console.log('🔗 Available Routes:');
  console.log('   POST   /api/auth/register');
  console.log('   POST   /api/auth/login');
  console.log('   GET    /api/auth/profile');
  console.log('   PUT    /api/auth/profile');
  console.log('   GET    /api/diary/:date');
  console.log('   POST   /api/diary/entries');
  console.log('   PUT    /api/diary/entries/:id');
  console.log('   DELETE /api/diary/entries/:id');
  console.log('   GET    /api/foods');
  console.log('   GET    /api/foods/search?q=pollo');
  console.log('   GET    /api/foods/categories');
  console.log('   GET    /api/foods/:id');
  console.log('='.repeat(80) + '\n');
});

module.exports = app;
