const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const pool = require('../config/database');

/**
 * @swagger
 * /api/diary/entries:
 *   post:
 *     tags:
 *       - Diary
 *     summary: Crear nueva entrada de alimento
 *     description: |
 *       Añade un nuevo alimento al diario del usuario.
 *       
 *       ### Funcionamiento:
 *       1. Busca o crea un diario para la fecha especificada
 *       2. Crea una nueva entrada con el alimento y sus macros
 *       3. Calcula automáticamente los valores nutricionales según la cantidad
 *       
 *       ### Tipos de comida disponibles:
 *       - **desayuno**: Primera comida del día
 *       - **almuerzo**: Media mañana
 *       - **comida**: Comida principal del mediodía
 *       - **merienda**: Media tarde
 *       - **cena**: Última comida del día
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
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Fecha del diario (YYYY-MM-DD)
 *                 example: "2025-12-29"
 *               meal_type:
 *                 type: string
 *                 enum: [desayuno, almuerzo, comida, merienda, cena]
 *                 description: Tipo de comida
 *                 example: desayuno
 *               food_name:
 *                 type: string
 *                 description: Nombre del alimento
 *                 example: Pechuga de pollo
 *               amount:
 *                 type: number
 *                 description: Cantidad en gramos (por defecto 100)
 *                 example: 150
 *               calories:
 *                 type: number
 *                 description: Calorías totales
 *                 example: 247.5
 *               protein:
 *                 type: number
 *                 description: Proteínas en gramos
 *                 example: 46.5
 *               carbohydrates:
 *                 type: number
 *                 description: Carbohidratos en gramos
 *                 example: 0
 *               fat:
 *                 type: number
 *                 description: Grasas en gramos
 *                 example: 5.4
 *     responses:
 *       201:
 *         description: Entrada creada exitosamente
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
 *                   example: Alimento añadido al diario
 *                 data:
 *                   $ref: '#/components/schemas/DiaryEntry'
 *       400:
 *         description: Faltan campos requeridos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

    const userId = req.userId;

    console.log('📥 POST /entries - Usuario:', userId);
    console.log('📦 Datos recibidos:', { date, meal_type, food_name, amount: amount || 100 });

    // Validaciones básicas
    if (!date || !meal_type || !food_name) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos: date, meal_type, food_name' 
      });
    }

    // Obtener conexión del pool
    connection = await pool.getConnection();

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
       (diary_id, meal_type, food_name, quantity, calories, protein, carbs, fat, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        diaryId,
        meal_type,
        food_name,
        amount || 100,         
        calories || 0,
        protein || 0,
        carbohydrates || 0,    
        fat || 0
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

/**
 * @swagger
 * /api/diary/entries/{date}:
 *   get:
 *     tags:
 *       - Diary
 *     summary: Obtener entradas del diario por fecha
 *     description: |
 *       Obtiene todas las entradas de alimentos de un día específico.
 *       
 *       ### Respuesta incluye:
 *       - Entradas organizadas por tipo de comida (desayuno, almuerzo, comida, merienda, cena)
 *       - Totales del día (calorías, proteínas, carbohidratos, grasas)
 *       - Información detallada de cada alimento
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha del diario (YYYY-MM-DD)
 *         example: "2025-12-29"
 *     responses:
 *       200:
 *         description: Entradas del diario obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     date:
 *                       type: string
 *                       format: date
 *                       example: "2025-12-29"
 *                     meals:
 *                       type: object
 *                       properties:
 *                         desayuno:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/DiaryEntry'
 *                         almuerzo:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/DiaryEntry'
 *                         comida:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/DiaryEntry'
 *                         merienda:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/DiaryEntry'
 *                         cena:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/DiaryEntry'
 *                     totals:
 *                       type: object
 *                       properties:
 *                         calories:
 *                           type: number
 *                           example: 2200
 *                         protein:
 *                           type: number
 *                           example: 150.5
 *                         carbohydrates:
 *                           type: number
 *                           example: 220.3
 *                         fat:
 *                           type: number
 *                           example: 65.2
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/entries/:date', authMiddleware, async (req, res) => {
  let connection;
  try {
    const { date } = req.params;
    const userId = req.userId;

    console.log('📥 GET /entries/:date - Usuario:', userId, 'Fecha:', date);

    connection = await pool.getConnection();

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

    const [entries] = await connection.execute(
      `SELECT 
        id,
        meal_type,
        food_name,
        quantity,
        calories,
        protein,
        carbs,
        fat,
        created_at
      FROM diary_entries 
      WHERE diary_id = ?
      ORDER BY created_at ASC`,
      [diaryId]
    );

    console.log(`📦 Encontradas ${entries.length} entradas`);

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
        portion: `${entry.quantity}g`,
        amount: entry.quantity,            
        calories: parseFloat(entry.calories) || 0,
        protein: parseFloat(entry.protein) || 0,
        carbohydrates: parseFloat(entry.carbs) || 0,  
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

/**
 * @swagger
 * /api/diary/entries/{id}:
 *   delete:
 *     tags:
 *       - Diary
 *     summary: Eliminar entrada de alimento
 *     description: |
 *       Elimina una entrada específica del diario.
 *       
 *       ### Seguridad:
 *       - Solo el propietario puede eliminar sus propias entradas
 *       - Se verifica que la entrada pertenece al usuario autenticado
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la entrada a eliminar
 *         example: 1
 *     responses:
 *       200:
 *         description: Entrada eliminada exitosamente
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
 *                   example: Entrada eliminada correctamente
 *       404:
 *         description: Entrada no encontrada o sin permisos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/entries/:id', authMiddleware, async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const userId = req.userId;

    console.log('📥 DELETE /entries/:id - Usuario:', userId, 'Entry ID:', id);

    connection = await pool.getConnection();

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

/**
 * @swagger
 * /api/diary/entries/{id}:
 *   put:
 *     tags:
 *       - Diary
 *     summary: Actualizar entrada de alimento
 *     description: |
 *       Actualiza la cantidad y valores nutricionales de una entrada existente.
 *       
 *       ### Uso típico:
 *       - Modificar la cantidad de un alimento ya registrado
 *       - Los valores de macros se recalculan proporcionalmente
 *       
 *       ### Seguridad:
 *       - Solo el propietario puede actualizar sus propias entradas
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la entrada a actualizar
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Nueva cantidad en gramos (debe ser mayor a 0)
 *                 example: 200
 *               calories:
 *                 type: number
 *                 description: Calorías actualizadas
 *                 example: 330
 *               protein:
 *                 type: number
 *                 description: Proteínas actualizadas
 *                 example: 62
 *               carbohydrates:
 *                 type: number
 *                 description: Carbohidratos actualizados
 *                 example: 0
 *               fat:
 *                 type: number
 *                 description: Grasas actualizadas
 *                 example: 7.2
 *     responses:
 *       200:
 *         description: Entrada actualizada exitosamente
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
 *                   example: Entrada actualizada correctamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     amount:
 *                       type: number
 *                       example: 200
 *                     calories:
 *                       type: number
 *                       example: 330
 *                     protein:
 *                       type: number
 *                       example: 62
 *                     carbohydrates:
 *                       type: number
 *                       example: 0
 *                     fat:
 *                       type: number
 *                       example: 7.2
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Entrada no encontrada o sin permisos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/entries/:id', authMiddleware, async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { amount, calories, protein, carbohydrates, fat } = req.body;

    console.log('🔥 PUT /entries/:id - Usuario:', userId, 'Entry ID:', id);
    console.log('📦 Nuevos valores:', { amount, calories, protein, carbohydrates, fat });

    // Validaciones básicas
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        error: 'La cantidad debe ser mayor a 0' 
      });
    }

    connection = await pool.getConnection();

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

    // Actualizar la entrada
    await connection.execute(
      `UPDATE diary_entries 
       SET quantity = ?, calories = ?, protein = ?, carbs = ?, fat = ?
       WHERE id = ?`,
      [
        amount,
        calories || 0,
        protein || 0,
        carbohydrates || 0,  
        fat || 0,
        id
      ]
    );

    console.log('✅ Entrada actualizada:', id);

    res.json({
      success: true,
      message: 'Entrada actualizada correctamente',
      data: {
        id: parseInt(id),
        amount,
        calories,
        protein,
        carbohydrates,
        fat
      }
    });

  } catch (error) {
    console.error('❌ Error al actualizar entrada:', error);
    res.status(500).json({ 
      error: 'Error al actualizar la entrada',
      details: error.message 
    });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
