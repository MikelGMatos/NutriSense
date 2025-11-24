const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Rutas públicas
router.post('/register', authController.register);
router.post('/login', authController.login);

// Rutas protegidas (requieren autenticación)
router.get('/profile', authMiddleware, authController.getProfile);

// 🆕 NUEVA RUTA: Actualizar perfil de usuario (calculadora de calorías)
router.put('/profile', authMiddleware, authController.updateProfile);

module.exports = router;
