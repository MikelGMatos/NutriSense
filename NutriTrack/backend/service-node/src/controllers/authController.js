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
  console.log('🔵 === INICIO updateProfile ===');
  console.log('🔵 Method:', req.method);
  console.log('🔵 URL:', req.url);
  console.log('🔵 Headers:', req.headers);
  console.log('🔵 Body:', req.body);
  console.log('🔵 User ID:', req.userId);
  
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

    console.log('🔵 Datos extraídos:', {
      name, age, height, weight, gender, activity_level, goal,
      daily_calories, daily_protein, daily_carbs, daily_fat
    });

    // Validaciones básicas opcionales (permitir actualización parcial)
    if (age && (age < 15 || age > 100)) {
      console.log('❌ Validación fallida: edad');
      return res.status(400).json({ error: 'Edad debe estar entre 15 y 100 años' });
    }

    if (height && (height < 100 || height > 250)) {
      console.log('❌ Validación fallida: altura');
      return res.status(400).json({ error: 'Altura debe estar entre 100 y 250 cm' });
    }

    if (weight && (weight < 30 || weight > 300)) {
      console.log('❌ Validación fallida: peso');
      return res.status(400).json({ error: 'Peso debe estar entre 30 y 300 kg' });
    }

    if (gender && !['male', 'female'].includes(gender)) {
      console.log('❌ Validación fallida: género');
      return res.status(400).json({ error: 'Género inválido' });
    }

    if (activity_level && !['sedentary', 'light', 'moderate', 'active', 'very_active'].includes(activity_level)) {
      console.log('❌ Validación fallida: activity_level');
      return res.status(400).json({ error: 'Nivel de actividad inválido' });
    }

    if (goal && !['lose', 'maintain', 'gain'].includes(goal)) {
      console.log('❌ Validación fallida: goal');
      return res.status(400).json({ error: 'Objetivo inválido' });
    }

    console.log('✅ Validaciones pasadas');

    console.log('🔵 Llamando a User.updateProfile...');
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

    console.log('🔵 Resultado de updateProfile:', updated);

    if (!updated) {
      console.log('❌ updateProfile retornó false');
      return res.status(500).json({ 
        success: false,
        message: 'Error al actualizar el perfil' 
      });
    }

    console.log('🔵 Obteniendo perfil actualizado...');
    // Obtener el perfil actualizado
    const user = await User.findById(req.userId);
    console.log('🔵 Perfil actualizado obtenido:', user);

    console.log('✅ Enviando respuesta exitosa');
    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: user
    });
    console.log('🔵 === FIN updateProfile (SUCCESS) ===');
  } catch (error) {
    console.error('❌ === ERROR EN updateProfile ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error completo:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al actualizar perfil' 
    });
    console.log('🔵 === FIN updateProfile (ERROR) ===');
  }
};
