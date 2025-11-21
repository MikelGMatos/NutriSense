const db = require('../config/database');

class Diary {
  // Obtener o crear diario para una fecha
  static async getOrCreate(userId, date) {
    // Intentar obtener el diario existente
    const [rows] = await db.execute(
      'SELECT * FROM diaries WHERE user_id = ? AND date = ?',
      [userId, date]
    );

    if (rows.length > 0) {
      return rows[0];
    }

    // Si no existe, crear uno nuevo
    const [result] = await db.execute(
      'INSERT INTO diaries (user_id, date) VALUES (?, ?)',
      [userId, date]
    );

    return {
      id: result.insertId,
      user_id: userId,
      date: date,
    };
  }

  // Obtener diario con todas sus entradas
  static async getWithEntries(userId, date) {
    const diary = await this.getOrCreate(userId, date);

    const [entries] = await db.execute(
      `SELECT * FROM diary_entries 
       WHERE diary_id = ? 
       ORDER BY created_at DESC`,
      [diary.id]
    );

    return {
      ...diary,
      entries: entries,
      totals: this.calculateTotals(entries),
    };
  }

  // Calcular totales de macros
  static calculateTotals(entries) {
    return entries.reduce(
      (acc, entry) => {
        acc.calories += parseFloat(entry.calories) || 0;
        acc.protein += parseFloat(entry.protein) || 0;
        acc.carbs += parseFloat(entry.carbs) || 0;
        acc.fat += parseFloat(entry.fat) || 0;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }
}

module.exports = Diary;