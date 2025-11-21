import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sessionManager } from '../services/sessionManager';
import Toast from './Toast';

function Login({ onLoginSuccess, onSwitchToRegister }) {
  // Solo usar navigate si está disponible (cuando usamos router)
  let navigate;
  try {
    navigate = useNavigate();
  } catch (e) {
    navigate = null;
  }

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState(null);

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
        
        // Guardar datos básicos
        localStorage.setItem('userId', data.user.id);
        localStorage.setItem('userEmail', data.user.email);
        
        // MEJORA #3: Iniciar sesión con timeout usando sessionManager
        sessionManager.startSession(data.token);
        
        // Mostrar toast de éxito
        setToast({
          message: '¡Bienvenido de nuevo! 🎉',
          type: 'success'
        });
        
        // Esperar un poco antes de redirigir
        setTimeout(() => {
          onLoginSuccess(data.token);
        }, 800);
        
      } else {
        // Error del servidor
        console.error('❌ Error del servidor:', data.error);
        setError(data.error || 'Credenciales inválidas');
        setToast({
          message: data.error || 'Credenciales inválidas',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('❌ Error de conexión:', error);
      const errorMsg = 'Error de conexión. Verifica que el backend esté corriendo en puerto 3001.';
      setError(errorMsg);
      setToast({
        message: errorMsg,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = (e) => {
    e.preventDefault();
    if (navigate) {
      navigate('/register');
    } else if (onSwitchToRegister) {
      onSwitchToRegister();
    }
  };

  return (
    <>
      {/* Toast de notificaciones */}
      {toast && (
        <Toast 
          message={toast.message}
          type={toast.type}
          duration={3000}
          onClose={() => setToast(null)}
        />
      )}

      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-title">
              🎯 NutriTrack
            </h1>
            <p className="login-subtitle">
              Bienvenido de nuevo
            </p>
          </div>

          {error && (
            <div className="message message-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
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
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Contraseña
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="form-input"
                    placeholder="••••••••"
                    disabled={loading}
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontSize: '1.2rem',
                      opacity: loading ? 0.5 : 1
                    }}
                    title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
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
                    Iniciando sesión...
                  </span>
                ) : (
                  '🚀 Iniciar Sesión'
                )}
              </button>
            </div>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            {navigate ? (
              <Link
                to="/register"
                className="btn-secondary"
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  color: '#667eea', 
                  fontWeight: '600', 
                  cursor: 'pointer',
                  textDecoration: 'none'
                }}
              >
                ¿No tienes cuenta? Regístrate aquí
              </Link>
            ) : (
              <button
                onClick={handleRegisterClick}
                className="btn-secondary"
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  color: '#667eea', 
                  fontWeight: '600', 
                  cursor: 'pointer'
                }}
              >
                ¿No tienes cuenta? Regístrate aquí
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
