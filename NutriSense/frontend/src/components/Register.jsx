import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PasswordStrength from './PasswordStrength';
import Toast from './Toast';

function Register({ onRegisterSuccess, onSwitchToLogin }) {
  // Solo usar navigate si está disponible (cuando usamos router)
  let navigate;
  try {
    navigate = useNavigate();
  } catch (e) {
    navigate = null;
  }

  // Estados del formulario
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
  // Estados para las mejoras
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [toast, setToast] = useState(null);

  // Animación de entrada (Mejora #5)
  useEffect(() => {
    // Pequeño delay para que la animación se vea
    setTimeout(() => {
      setIsVisible(true);
    }, 50);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Limpiar error de validación específico al escribir
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    // Validar nombre
    if (!formData.name.trim()) {
      errors.name = 'El nombre es requerido';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    // Validar email
    if (!formData.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Ingresa un email válido';
    }

    // Validar contraseña
    if (!formData.password) {
      errors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    // Validar confirmación de contraseña
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Debes confirmar tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validar formulario
    if (!validateForm()) {
      setToast({
        message: 'Por favor corrige los errores del formulario',
        type: 'error'
      });
      return;
    }

    setLoading(true);

    try {
      console.log('📝 Intentando registro con:', formData.email);
      
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password
        })
      });

      const data = await response.json();
      console.log('📥 Respuesta del servidor:', data);

      if (response.ok) {
        // Registro exitoso (Mejora #6 - Toast de éxito)
        console.log('✅ Registro exitoso');
        
        setToast({
          message: '¡Registro exitoso! Redirigiendo al login...',
          type: 'success'
        });
        
        // Limpiar formulario
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
        
        // Esperar a que se vea el toast antes de redirigir
        setTimeout(() => {
          if (onRegisterSuccess) {
            onRegisterSuccess(formData.email);
          }
          
          // Redirigir al login
          if (navigate) {
            navigate('/login');
          } else if (onSwitchToLogin) {
            onSwitchToLogin();
          }
        }, 1500);
        
      } else {
        // Error del servidor (Mejora #6 - Toast de error)
        console.error('❌ Error del servidor:', data.error);
        setError(data.error || 'Error al registrarse. Intenta nuevamente.');
        setToast({
          message: data.error || 'Error al registrarse. Intenta nuevamente.',
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

  return (
    <>
      {/* Toast de notificaciones (Mejora #6) */}
      {toast && (
        <Toast 
          message={toast.message}
          type={toast.type}
          duration={3000}
          onClose={() => setToast(null)}
        />
      )}

      {/* Contenedor con animación de entrada (Mejora #5) */}
      <div 
        className="login-container"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.4s ease-out'
        }}
      >
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-title">
              🎯 NutriTrack
            </h1>
            <p className="login-subtitle">
              Crea tu cuenta
            </p>
          </div>

          {error && (
            <div className="message message-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              {/* Campo Nombre */}
              <div className="form-group">
                <label className="form-label">
                  Nombre completo
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`form-input ${validationErrors.name ? 'input-error' : ''}`}
                  placeholder="Tu nombre completo"
                  disabled={loading}
                />
                {validationErrors.name && (
                  <span className="error-text">{validationErrors.name}</span>
                )}
              </div>

              {/* Campo Email */}
              <div className="form-group">
                <label className="form-label">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-input ${validationErrors.email ? 'input-error' : ''}`}
                  placeholder="tu@email.com"
                  disabled={loading}
                />
                {validationErrors.email && (
                  <span className="error-text">{validationErrors.email}</span>
                )}
              </div>

              {/* Campo Contraseña con Toggle y Medidor (Mejoras #1 y #2) */}
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
                    className={`form-input ${validationErrors.password ? 'input-error' : ''}`}
                    placeholder="Mínimo 6 caracteres"
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
                {validationErrors.password && (
                  <span className="error-text">{validationErrors.password}</span>
                )}
                {/* Medidor de fuerza de contraseña (Mejora #1) */}
                <PasswordStrength password={formData.password} />
              </div>

              {/* Campo Confirmar Contraseña con Toggle (Mejora #2) */}
              <div className="form-group">
                <label className="form-label">
                  Confirmar contraseña
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`form-input ${validationErrors.confirmPassword ? 'input-error' : ''}`}
                    placeholder="Repite tu contraseña"
                    disabled={loading}
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                    title={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showConfirmPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {validationErrors.confirmPassword && (
                  <span className="error-text">{validationErrors.confirmPassword}</span>
                )}
              </div>

              {/* Botón Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-submit"
                style={{ width: '100%', marginTop: '1rem' }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <span className="loading-spinner"></span>
                    Registrando...
                  </span>
                ) : (
                  '✨ Crear cuenta'
                )}
              </button>
            </div>
          </form>

          {/* Link a Login */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            {navigate ? (
              <Link
                to="/login"
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
                ¿Ya tienes cuenta? Inicia sesión
              </Link>
            ) : (
              <button
                onClick={onSwitchToLogin}
                className="btn-secondary"
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  color: '#667eea', 
                  fontWeight: '600', 
                  cursor: 'pointer'
                }}
              >
                ¿Ya tienes cuenta? Inicia sesión
              </button>
            )}
          </div>

          {/* Términos y Condiciones */}
          <div style={{ 
            textAlign: 'center', 
            marginTop: '1rem', 
            fontSize: '0.75rem', 
            color: '#9ca3af' 
          }}>
            Al registrarte, aceptas nuestros{' '}
            <a href="#" style={{ color: '#667eea', textDecoration: 'none' }}>
              Términos y Condiciones
            </a>
          </div>
        </div>

        <style jsx>{`
          .input-error {
            border-color: #ef4444 !important;
          }

          .error-text {
            display: block;
            color: #ef4444;
            font-size: 0.75rem;
            margin-top: 0.25rem;
          }
        `}</style>
      </div>
    </>
  );
}

export default Register;
