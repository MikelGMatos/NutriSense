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

// POST /api/diary/entries - Crear nueva entrada de alimento
router.post('/entries', authMiddleware, async (req, res) => {
  let connection;
  try {
    const { 
      date,
      meal_type,
      food_name,
      portion,
      amount,
      calories,
      protein,
      carbohydrates,
      fat,
      food_id
    } = req.body;

    const userId = req.userId; // Viene del middleware de autenticación

    console.log('📥 POST /entries - Usuario:', userId);
    console.log('📦 Datos recibidos:', { date, meal_type, food_name });

    // Validaciones básicas
    if (!date || !meal_type || !food_name) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos: date, meal_type, food_name' 
      });
    }

    // Obtener conexión del pool
    connection = await db.getConnection();

    // Buscar o crear el diario para esta fecha
    const [diaries] = await connection.execute(
      'SELECT id FROM diaries WHERE user_id = ? AND date = ?',
      [userId, date]
    );

    let diaryId;

    if (diaries.length === 0) {
      console.log('📝 Creando nuevo diario para fecha:', date);
      const [result] = await connection.execute(
        'INSERT INTO diaries (user_id, date, created_at) VALUES (?, ?, NOW())',
        [userId, date]
      );
      diaryId = result.insertId;
    } else {
      diaryId = diaries[0].id;
    }

    // Crear la entrada de alimento
    const [result] = await connection.execute(
      `INSERT INTO diary_entries 
       (diary_id, meal_type, food_name, portion, amount, calories, protein, carbohydrates, fat, food_ref, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        diaryId,
        meal_type,
        food_name,
        portion || `${amount}g`,
        amount || 100,
        calories || 0,
        protein || 0,
        carbohydrates || 0,
        fat || 0,
        food_id || null
      ]
    );

    const entryId = result.insertId;
    console.log('✅ Entrada creada con ID:', entryId);

    // Devolver la entrada creada
    res.status(201).json({
      success: true,
      message: 'Alimento añadido al diario',
      data: {
        id: entryId,
        diary_id: diaryId,
        meal_type: meal_type,
        food_name: food_name,
        portion: portion || `${amount}g`,
        amount: amount || 100,
        calories: calories || 0,
        protein: protein || 0,
        carbohydrates: carbohydrates || 0,
        fat: fat || 0
      }
    });

  } catch (error) {
    console.error('❌ Error al crear entrada:', error);
    res.status(500).json({ 
      error: 'Error al guardar el alimento',
      details: error.message 
    });
  } finally {
    if (connection) connection.release();
  }
});

// ============================================
// GET /api/diary/entries/:date
// Obtener todas las entradas de alimentos de un día específico
// ============================================
router.get('/entries/:date', authMiddleware, async (req, res) => {
  let connection;
  try {
    const { date } = req.params;
    const userId = req.userId;

    console.log('📥 GET /entries/:date - Usuario:', userId, 'Fecha:', date);

    // Obtener conexión del pool
    connection = await db.getConnection();

    // Buscar el diario de esta fecha
    const [diaries] = await connection.execute(
      'SELECT id FROM diaries WHERE user_id = ? AND date = ?',
      [userId, date]
    );

    if (diaries.length === 0) {
      console.log('📭 No hay diario para esta fecha');
      return res.json({ 
        success: true,
        data: {
          date,
          meals: {
            desayuno: [],
            almuerzo: [],
            comida: [],
            merienda: [],
            cena: []
          },
          totals: {
            calories: 0,
            protein: 0,
            carbohydrates: 0,
            fat: 0
          }
        }
      });
    }

    const diaryId = diaries[0].id;

    // Obtener todas las entradas
    const [entries] = await connection.execute(
      `SELECT 
        id,
        meal_type,
        food_name,
        portion,
        amount,
        calories,
        protein,
        carbohydrates,
        fat,
        created_at
      FROM diary_entries 
      WHERE diary_id = ?
      ORDER BY created_at ASC`,
      [diaryId]
    );

    console.log(`📦 Encontradas ${entries.length} entradas`);

    // Organizar por tipo de comida
    const meals = {
      desayuno: [],
      almuerzo: [],
      comida: [],
      merienda: [],
      cena: []
    };

    let totals = {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0
    };

    entries.forEach(entry => {
      const entryData = {
        id: entry.id,
        meal_type: entry.meal_type,
        food_name: entry.food_name,
        portion: entry.portion,
        amount: entry.amount,
        calories: parseFloat(entry.calories) || 0,
        protein: parseFloat(entry.protein) || 0,
        carbohydrates: parseFloat(entry.carbohydrates) || 0,
        fat: parseFloat(entry.fat) || 0,
        created_at: entry.created_at
      };

      if (meals[entry.meal_type]) {
        meals[entry.meal_type].push(entryData);
      }

      totals.calories += entryData.calories;
      totals.protein += entryData.protein;
      totals.carbohydrates += entryData.carbohydrates;
      totals.fat += entryData.fat;
    });

    res.json({
      success: true,
      data: {
        date,
        meals,
        totals: {
          calories: Math.round(totals.calories),
          protein: Math.round(totals.protein * 10) / 10,
          carbohydrates: Math.round(totals.carbohydrates * 10) / 10,
          fat: Math.round(totals.fat * 10) / 10
        }
      }
    });

  } catch (error) {
    console.error('❌ Error al obtener entradas:', error);
    res.status(500).json({ 
      error: 'Error al obtener las entradas del diario',
      details: error.message 
    });
  } finally {
    if (connection) connection.release();
  }
});

// ============================================
// DELETE /api/diary/entries/:id
// Eliminar una entrada de alimento del diario
// ============================================
router.delete('/entries/:id', authMiddleware, async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const userId = req.userId;

    console.log('📥 DELETE /entries/:id - Usuario:', userId, 'Entry ID:', id);

    // Obtener conexión del pool
    connection = await db.getConnection();

    // Verificar que la entrada existe y pertenece al usuario
    const [entries] = await connection.execute(
      `SELECT de.id 
       FROM diary_entries de
       JOIN diaries d ON de.diary_id = d.id
       WHERE de.id = ? AND d.user_id = ?`,
      [id, userId]
    );

    if (entries.length === 0) {
      return res.status(404).json({ 
        error: 'Entrada no encontrada o no tienes permisos' 
      });
    }

    // Eliminar la entrada
    await connection.execute(
      'DELETE FROM diary_entries WHERE id = ?',
      [id]
    );

    console.log('✅ Entrada eliminada:', id);

    res.json({
      success: true,
      message: 'Entrada eliminada correctamente'
    });

  } catch (error) {
    console.error('❌ Error al eliminar entrada:', error);
    res.status(500).json({ 
      error: 'Error al eliminar la entrada',
      details: error.message 
    });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;






