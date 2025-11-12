import { useState } from 'react';

function Login({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // ========================================
        // LOGIN - Llamar a la API real
        // ========================================
        console.log('🔐 Intentando login con:', formData.email);
        
        const response = await fetch('http://localhost:3001/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        });

        const data = await response.json();
        console.log('📥 Respuesta del servidor:', data);

        if (response.ok) {
          // Login exitoso
          console.log('✅ Login exitoso');
          console.log('🎫 Token recibido:', data.token.substring(0, 30) + '...');
          
          localStorage.setItem('token', data.token);
          localStorage.setItem('userId', data.user.id);
          localStorage.setItem('userEmail', data.user.email);
          
          onLoginSuccess(data.token);
        } else {
          // Error del servidor
          console.error('❌ Error del servidor:', data.error);
          setError(data.error || 'Credenciales inválidas');
        }
      } else {
        // ========================================
        // REGISTRO - Llamar a la API real
        // ========================================
        console.log('📝 Intentando registro con:', formData.email);
        
        const response = await fetch('http://localhost:3001/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: formData.username,
            email: formData.email,
            password: formData.password
          })
        });

        const data = await response.json();
        console.log('📥 Respuesta del servidor:', data);

        if (response.ok) {
          // Registro exitoso - cambiar a modo login
          console.log('✅ Registro exitoso');
          alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
          setIsLogin(true);
          setFormData({ username: '', email: formData.email, password: '' });
        } else {
          // Error del servidor
          console.error('❌ Error del servidor:', data.error);
          setError(data.error || 'Error al registrarse');
        }
      }
    } catch (error) {
      console.error('❌ Error de conexión:', error);
      setError('Error de conexión. Verifica que el backend esté corriendo en puerto 3001.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">
            🎯 NutriTrack
          </h1>
          <p className="login-subtitle">
            {isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
          </p>
        </div>

        {error && (
          <div className="message message-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {!isLogin && (
              <div className="form-group">
                <label className="form-label">
                  Nombre de usuario
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required={!isLogin}
                  className="form-input"
                  placeholder="Tu nombre de usuario"
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">
                Correo electrónico
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="tu@email.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-submit"
              style={{ width: '100%', marginTop: '1rem' }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <span className="loading-spinner"></span>
                  {isLogin ? 'Iniciando sesión...' : 'Registrando...'}
                </span>
              ) : (
                isLogin ? '🚀 Iniciar Sesión' : '✨ Registrarse'
              )}
            </button>
          </div>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setFormData({ username: '', email: '', password: '' });
            }}
            className="btn-secondary"
            style={{ background: 'transparent', border: 'none', color: '#667eea', fontWeight: '600', cursor: 'pointer' }}
          >
            {isLogin 
              ? '¿No tienes cuenta? Regístrate aquí' 
              : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
