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

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulación de login (sin API)
    setTimeout(() => {
      if (formData.email && formData.password) {
        const fakeToken = 'fake-token-' + Date.now();
        localStorage.setItem('token', fakeToken);
        localStorage.setItem('userId', '1');
        onLoginSuccess(fakeToken);
      } else {
        setError('Por favor completa todos los campos');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">
            🍎 NutriTrack
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
                  required
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