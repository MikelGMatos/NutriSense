require('dotenv').config();

const express = require('express');
const cors = require('cors');

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
// HEALTH CHECK
// ============================================
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
  console.log('📊 Health check: http://localhost:' + PORT + '/health');
  console.log('🔐 Auth: http://localhost:' + PORT + '/api/auth');
  console.log('📔 Diary: http://localhost:' + PORT + '/api/diary');
  console.log('='.repeat(60) + '\n');
});