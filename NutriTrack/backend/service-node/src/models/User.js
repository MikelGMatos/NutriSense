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

  // Actualizar perfil de usuario (calculadora de calorías)
  static async updateProfile(userId, profileData) {
    const {
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
      daily_fat
    } = profileData;

    // ✅ Construir query dinámicamente solo con campos definidos
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (age !== undefined) {
      updates.push('age = ?');
      values.push(age);
    }
    if (height !== undefined) {
      updates.push('height = ?');
      values.push(height);
    }
    if (weight !== undefined) {
      updates.push('weight = ?');
      values.push(weight);
    }
    if (gender !== undefined) {
      updates.push('gender = ?');
      values.push(gender);
    }
    if (activity_level !== undefined) {
      updates.push('activity_level = ?');
      values.push(activity_level);
    }
    if (goal !== undefined) {
      updates.push('goal = ?');
      values.push(goal);
    }
    if (daily_calories !== undefined) {
      updates.push('daily_calories = ?');
      values.push(daily_calories);
    }
    if (daily_protein !== undefined) {
      updates.push('daily_protein = ?');
      values.push(daily_protein);
    }
    if (daily_carbs !== undefined) {
      updates.push('daily_carbs = ?');
      values.push(daily_carbs);
    }
    if (daily_fat !== undefined) {
      updates.push('daily_fat = ?');
      values.push(daily_fat);
    }

    // Siempre actualizar updated_at
    updates.push('updated_at = CURRENT_TIMESTAMP');
    
    // Agregar userId al final
    values.push(userId);

    // Si no hay nada que actualizar, retornar true
    if (updates.length === 1) { // Solo updated_at
      return true;
    }

    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    
    console.log('📝 UPDATE Query:', query);
    console.log('📝 VALUES:', values);

    const [result] = await db.execute(query, values);

    return result.affectedRows > 0;
  }

  // Verificar contraseña
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;
