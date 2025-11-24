const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Crear usuario
  static async create(email, password, name) {
    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
      [email, passwordHash, name]
    );
    return result.insertId;
  }

  // Buscar por email
  static async findByEmail(email) {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  // Buscar por ID - ACTUALIZADO con campos de calculadora
  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT 
        id, 
        email, 
        name, 
        age, 
        height, 
        weight, 
        gender, 
        activity_level, 
        goal, 
        daily_calories, 
        daily_protein, 
        daily_carbs, 
        daily_fat, 
        created_at 
      FROM users 
      WHERE id = ?`,
      [id]
    );
    return rows[0];
  }

  // 🆕 NUEVO: Actualizar perfil de usuario (calculadora de calorías)
  static async updateProfile(userId, profileData) {
    const {
      age,
      height,
      weight,
      gender,
      activity_level,
      goal,
      daily_calories,
      daily_protein,
      daily_carbs,
      daily_fat
    } = profileData;

    const [result] = await db.execute(
      `UPDATE users 
       SET age = ?, 
           height = ?, 
           weight = ?, 
           gender = ?, 
           activity_level = ?, 
           goal = ?,
           daily_calories = ?, 
           daily_protein = ?, 
           daily_carbs = ?, 
           daily_fat = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [age, height, weight, gender, activity_level, goal, daily_calories, daily_protein, daily_carbs, daily_fat, userId]
    );

    return result.affectedRows > 0;
  }

  // Verificar contraseña
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;
