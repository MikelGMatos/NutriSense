const express = require('express');
const router = express.Router();
const diaryController = require('../controllers/diaryController');
const authMiddleware = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Obtener diario de una fecha
router.get('/:date', diaryController.getDiary);

// Añadir entrada a un diario
router.post('/:date/entries', diaryController.addEntry);

// Eliminar entrada
router.delete('/entries/:entryId', diaryController.deleteEntry);

module.exports = router;