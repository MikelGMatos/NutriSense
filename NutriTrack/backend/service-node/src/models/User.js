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

  // Buscar por ID
  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT id, email, name, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  // Verificar contraseña
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;