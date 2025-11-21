const Diary = require('../models/Diary');
const DiaryEntry = require('../models/DiaryEntry');

// Obtener diario de una fecha específica
exports.getDiary = async (req, res) => {
  try {
    const { date } = req.params;
    const userId = req.userId;

    const diary = await Diary.getWithEntries(userId, date);

    res.json(diary);
  } catch (error) {
    console.error('Error en getDiary:', error);
    res.status(500).json({ error: 'Error al obtener diario' });
  }
};

// Añadir entrada de comida
exports.addEntry = async (req, res) => {
  try {
    const { date } = req.params;
    const userId = req.userId;
    const entryData = req.body;

    // Validaciones básicas
    if (!entryData.food_name || !entryData.calories || !entryData.meal_type) {
      return res.status(400).json({
        error: 'Faltan campos requeridos: food_name, calories, meal_type',
      });
    }

    // Obtener o crear diario
    const diary = await Diary.getOrCreate(userId, date);

    // Crear entrada
    const entry = await DiaryEntry.create(diary.id, entryData);

    res.status(201).json({
      message: 'Entrada añadida exitosamente',
      entry,
    });
  } catch (error) {
    console.error('Error en addEntry:', error);
    res.status(500).json({ error: 'Error al añadir entrada' });
  }
};

// Eliminar entrada de comida
exports.deleteEntry = async (req, res) => {
  try {
    const { entryId } = req.params;
    const userId = req.userId;

    await DiaryEntry.delete(entryId, userId);

    res.json({ message: 'Entrada eliminada exitosamente' });
  } catch (error) {
    console.error('Error en deleteEntry:', error);
    if (error.message === 'Entrada no encontrada') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Error al eliminar entrada' });
  }
};