const jwt = require('jsonwebtoken');

/**
 * Middleware de autenticación JWT
 * Verifica que el token JWT sea válido y añade el userId al request
 * 
 * NOTA: dotenv se carga en server.js, no aquí
 */
const authMiddleware = (req, res, next) => {
  try {
    console.log('\n🔐 === VERIFICANDO AUTENTICACIÓN ===');
    
    // Obtener el token del header Authorization
    const authHeader = req.headers.authorization;
    console.log('📨 Authorization Header:', authHeader ? 'Presente' : '❌ FALTA');
    
    if (!authHeader) {
      return res.status(401).json({ 
        error: 'Token no proporcionado',
        message: 'No se encontró el header Authorization' 
      });
    }

    // El token viene en formato: "Bearer TOKEN_AQUI"
    const token = authHeader.split(' ')[1];
    console.log('🎫 Token extraído:', token ? 'OK (primeros 20 chars: ' + token.substring(0, 20) + '...)' : '❌ ERROR');
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Token inválido',
        message: 'Formato de token incorrecto' 
      });
    }

    // Verificar que JWT_SECRET esté configurado
    const JWT_SECRET = process.env.JWT_SECRET;
    console.log('🔑 JWT_SECRET desde process.env:', JWT_SECRET || '❌ UNDEFINED');
    console.log('🔑 JWT_SECRET (primeros 15 chars):', JWT_SECRET ? JWT_SECRET.substring(0, 15) + '...' : 'NO DISPONIBLE');
    
    if (!JWT_SECRET) {
      console.error('❌ CRÍTICO: JWT_SECRET no está en process.env');
      console.error('   Verifica que .env existe y tiene JWT_SECRET=...');
      console.error('   Verifica que server.js tiene require("dotenv").config() al inicio');
      return res.status(500).json({ 
        error: 'Error de configuración',
        message: 'JWT_SECRET no configurado en el servidor' 
      });
    }
    
    // Verificar el token
    console.log('🔍 Verificando token con JWT_SECRET...');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token verificado exitosamente');
    console.log('📦 Payload:', JSON.stringify(decoded, null, 2));
    
    // Añadir el userId al request para que esté disponible en las rutas
    req.userId = decoded.userId || decoded.id;
    console.log('👤 Usuario autenticado. ID:', req.userId);
    console.log('='.repeat(50) + '\n');
    
    // Continuar con la siguiente función
    next();
    
  } catch (error) {
    console.error('\n❌ ERROR AL VERIFICAR TOKEN:');
    console.error('   Tipo:', error.name);
    console.error('   Mensaje:', error.message);
    
    if (error.message === 'jwt malformed') {
      console.error('   CAUSA: El token está mal formado o corrupto');
      console.error('   SOLUCIÓN: Borra localStorage y vuelve a hacer login');
    } else if (error.name === 'JsonWebTokenError') {
      console.error('   CAUSA: El token no es válido o JWT_SECRET es diferente');
      console.error('   JWT_SECRET usado para verificar:', process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 15) + '...' : 'UNDEFINED');
    }
    
    console.log('='.repeat(50) + '\n');
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Token inválido',
        message: 'El token no es válido. Intenta cerrar sesión y volver a iniciar sesión.' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expirado',
        message: 'El token ha expirado, vuelve a iniciar sesión' 
      });
    }
    
    return res.status(401).json({ 
      error: 'Error de autenticación',
      message: error.message 
    });
  }
};

module.exports = authMiddleware;