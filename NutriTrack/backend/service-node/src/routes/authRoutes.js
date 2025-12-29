const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Registrar nuevo usuario
 *     description: Crea una nueva cuenta de usuario en el sistema
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email del usuario (debe ser único)
 *                 example: usuario@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Contraseña (mínimo 6 caracteres)
 *                 example: password123
 *               name:
 *                 type: string
 *                 description: Nombre completo del usuario
 *                 example: Juan Pérez
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Usuario registrado exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                       example: 1
 *                     email:
 *                       type: string
 *                       example: usuario@example.com
 *                     name:
 *                       type: string
 *                       example: Juan Pérez
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: El email ya está registrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Iniciar sesión
 *     description: Autenticar usuario y obtener token JWT
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
 *                 description: Email del usuario
 *                 example: usuario@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Contraseña del usuario
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login exitoso
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: Token JWT para autenticación
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Obtener perfil del usuario
 *     description: Obtener toda la información del usuario autenticado
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: No autenticado o token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/profile', authMiddleware, authController.getProfile);

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     tags:
 *       - Authentication
 *     summary: Actualizar perfil del usuario
 *     description: |
 *       Actualizar información del usuario y calcular calorías diarias.
 *       
 *       ### Cálculo de calorías (Fórmula Harris-Benedict):
 *       
 *       **TMB (Tasa Metabólica Basal):**
 *       - Hombre: 88.362 + (13.397 × peso) + (4.799 × altura) - (5.677 × edad)
 *       - Mujer: 447.593 + (9.247 × peso) + (3.098 × altura) - (4.330 × edad)
 *       
 *       **Multiplicadores por actividad:**
 *       - sedentary: 1.2 (poco o ningún ejercicio)
 *       - light: 1.375 (ejercicio ligero 1-3 días/semana)
 *       - moderate: 1.55 (ejercicio moderado 3-5 días/semana)
 *       - active: 1.725 (ejercicio intenso 6-7 días/semana)
 *       - very_active: 1.9 (ejercicio muy intenso, trabajo físico)
 *       
 *       **Ajuste por objetivo:**
 *       - lose: -500 kcal (perder peso)
 *       - maintain: 0 kcal (mantener peso)
 *       - gain: +500 kcal (ganar peso)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del usuario
 *                 example: Juan Pérez
 *               age:
 *                 type: integer
 *                 description: Edad en años
 *                 example: 30
 *               weight:
 *                 type: number
 *                 description: Peso en kilogramos
 *                 example: 75.5
 *               height:
 *                 type: number
 *                 description: Altura en centímetros
 *                 example: 175
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *                 description: Género del usuario
 *                 example: male
 *               activity_level:
 *                 type: string
 *                 enum: [sedentary, light, moderate, active, very_active]
 *                 description: Nivel de actividad física
 *                 example: moderate
 *               goal:
 *                 type: string
 *                 enum: [lose, maintain, gain]
 *                 description: Objetivo nutricional
 *                 example: maintain
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Perfil actualizado correctamente
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/profile', authMiddleware, authController.updateProfile);

module.exports = router;
