require('dotenv').config();

module.exports = {
  // Configuración del Gateway
  gateway: {
    port: process.env.GATEWAY_PORT || 4000,
    host: process.env.GATEWAY_HOST || '0.0.0.0',
  },

  // URLs de los microservicios
  services: {
    auth: {
      url: process.env.AUTH_SERVICE_URL || 'http://backend-node:3001',
      name: 'Auth & Diary Service (Node.js)',
      healthPath: '/health',
    },
    food: {
      url: process.env.FOOD_SERVICE_URL || 'http://backend-python:8000',
      name: 'Food Catalog Service (Python)',
      healthPath: '/health',
    },
  },

  // Configuración de CORS
  cors: {
    origin: process.env.CORS_ORIGINS 
      ? process.env.CORS_ORIGINS.split(',') 
      : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  },

  // Configuración de Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por ventana
  },

  // Timeouts
  proxy: {
    timeout: 30000, // 30 segundos
  },
};
