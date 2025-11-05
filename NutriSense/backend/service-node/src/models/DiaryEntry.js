const db = require('../config/database');

class DiaryEntry {
  // Crear nueva entrada
  static async create(diaryId, entryData) {
    const { food_name, calories, protein, carbs, fat, quantity, meal_type } = entryData;

    const [result] = await db.execute(
      `INSERT INTO diary_entries 
       (diary_id, food_name, calories, protein, carbs, fat, quantity, meal_type) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [diaryId, food_name, calories, protein || 0, carbs || 0, fat || 0, quantity || 1, meal_type]
    );

    return {
      id: result.insertId,
      ...entryData,
    };
  }

  // Eliminar entrada
  static async delete(entryId, userId) {
    // Verificar que la entrada pertenece al usuario
    const [rows] = await db.execute(
      `SELECT de.* FROM diary_entries de
       JOIN diaries d ON de.diary_id = d.id
       WHERE de.id = ? AND d.user_id = ?`,
      [entryId, userId]
    );

    if (rows.length === 0) {
      throw new Error('Entrada no encontrada');
    }

    await db.execute('DELETE FROM diary_entries WHERE id = ?', [entryId]);
    return true;
  }

  // Obtener entrada por ID
  static async findById(entryId) {
    const [rows] = await db.execute(
      'SELECT * FROM diary_entries WHERE id = ?',
      [entryId]
    );
    return rows[0];
  }
}

module.exports = DiaryEntry;