const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Registrar usuario
exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validaciones básicas
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email y contraseña son requeridos' 
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ 
        error: 'El email ya está registrado' 
      });
    }

    // Crear usuario
    const userId = await User.create(email, password, name);

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      userId
    });
  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validaciones
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email y contraseña son requeridos' 
      });
    }

    // Buscar usuario
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas' 
      });
    }

    // Verificar contraseña
    const isValidPassword = await User.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas' 
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

// Obtener perfil (requiere autenticación)
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Error en getProfile:', error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};

// Actualizar perfil de usuario (calculadora de calorías)
exports.updateProfile = async (req, res) => {
  try {
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
    } = req.body;

    // Validaciones básicas opcionales (permitir actualización parcial)
    if (age && (age < 15 || age > 100)) {
      return res.status(400).json({ error: 'Edad debe estar entre 15 y 100 años' });
    }

    if (height && (height < 100 || height > 250)) {
      return res.status(400).json({ error: 'Altura debe estar entre 100 y 250 cm' });
    }

    if (weight && (weight < 30 || weight > 300)) {
      return res.status(400).json({ error: 'Peso debe estar entre 30 y 300 kg' });
    }

    if (gender && !['male', 'female'].includes(gender)) {
      return res.status(400).json({ error: 'Género inválido' });
    }

    if (activity_level && !['sedentary', 'light', 'moderate', 'active', 'very_active'].includes(activity_level)) {
      return res.status(400).json({ error: 'Nivel de actividad inválido' });
    }

    if (goal && !['lose', 'maintain', 'gain'].includes(goal)) {
      return res.status(400).json({ error: 'Objetivo inválido' });
    }

    // Actualizar perfil
    const updated = await User.updateProfile(req.userId, {
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
    });

    if (!updated) {
      return res.status(500).json({ 
        success: false,
        message: 'Error al actualizar el perfil' 
      });
    }

    // Obtener el perfil actualizado
    const user = await User.findById(req.userId);

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: user
    });
  } catch (error) {
    console.error('Error en updateProfile:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al actualizar perfil' 
    });
  }
};
