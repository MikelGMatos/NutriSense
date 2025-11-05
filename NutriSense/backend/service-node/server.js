const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./src/routes/authRoutes');
const diaryRoutes = require('./src/routes/diaryRoutes'); // ← NUEVA LÍNEA

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'nutrition-node-service',
    timestamp: new Date().toISOString()
  });
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/diaries', diaryRoutes); 

// Ruta 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});