require('dotenv').config();

const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

// Verificar que las variables de entorno se cargaron
console.log('\n🔧 === VERIFICANDO CONFIGURACIÓN ===');
console.log('JWT_SECRET cargado:', process.env.JWT_SECRET ? 'SÍ (' + process.env.JWT_SECRET.substring(0, 15) + '...)' : '❌ NO');
console.log('DB_NAME:', process.env.DB_NAME || '❌ NO CONFIGURADO');
console.log('PORT:', process.env.PORT || '3001 (default)');
console.log('='.repeat(50) + '\n');

const authRoutes = require('./src/routes/authRoutes');
const diaryRoutes = require('./src/routes/diaryRoutes'); 

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// MIDDLEWARES
// ============================================
app.use(cors());
app.use(express.json());

// Logging middleware (comentar si no quieres ver todos los requests)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ============================================
// DOCUMENTACIÓN SWAGGER
// ============================================
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'NutriTrack API Docs',
}));

// Endpoint para obtener el spec JSON
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

/**
 * @swagger
 * /:
 *   get:
 *     tags:
 *       - Health
 *     summary: Información de la API
 *     description: Obtener información básica y enlaces de documentación
 *     responses:
 *       200:
 *         description: Información de la API
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: NutriTrack Auth & Diary Service
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                 docs:
 *                   type: string
 *                   example: /api-docs
 *                 health:
 *                   type: string
 *                   example: /health
 */
app.get('/', (req, res) => {
  res.json({
    message: 'NutriTrack Auth & Diary Service',
    version: '1.0.0',
    docs: '/api-docs',
    health: '/health'
  });
});

/**
 * @swagger
 * /health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Verificar estado del servicio
 *     description: Endpoint para verificar que el servicio está funcionando correctamente
 *     responses:
 *       200:
 *         description: Servicio funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 service:
 *                   type: string
 *                   example: nutrition-node-service
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 env:
 *                   type: object
 *                   properties:
 *                     jwt_configured:
 *                       type: boolean
 *                       example: true
 *                     db_configured:
 *                       type: boolean
 *                       example: true
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'nutrition-node-service',
    timestamp: new Date().toISOString(),
    env: {
      jwt_configured: !!process.env.JWT_SECRET,
      db_configured: !!process.env.DB_NAME
    }
  });
});

// ============================================
// RUTAS
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/diary', diaryRoutes);

// ============================================
// MANEJO DE RUTAS NO ENCONTRADAS
// ============================================
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.path,
    method: req.method
  });
});

// ============================================
// MANEJO DE ERRORES
// ============================================
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: err.message 
  });
});

// ============================================
// INICIAR SERVIDOR
// ============================================
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 Servidor corriendo en http://localhost:' + PORT);
  console.log('📚 Documentación Swagger: http://localhost:' + PORT + '/api-docs');
  console.log('📊 Health check: http://localhost:' + PORT + '/health');
  console.log('🔐 Auth: http://localhost:' + PORT + '/api/auth');
  console.log('📔 Diary: http://localhost:' + PORT + '/api/diary');
  console.log('='.repeat(60) + '\n');
});
