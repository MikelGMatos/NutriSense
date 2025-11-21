import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Toast from './components/Toast';
import { authService } from './services/api';
import { sessionManager } from './services/sessionManager';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // Verificar si hay usuario logueado
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      // Verificar que la sesión siga siendo válida
      if (sessionManager.isSessionValid()) {
        setUser(currentUser);
        
        // Re-iniciar el monitoreo de sesión
        sessionManager.scheduleWarning();
      } else {
        // Sesión expirada, limpiar todo
        sessionManager.clearSession();
        authService.logout();
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // MEJORA #3: Configurar callback para advertencias de sesión
    sessionManager.setWarningCallback((message, type = 'warning') => {
      setToast({ message, type });
    });

    // MEJORA #3: Iniciar verificación periódica de sesión
    sessionManager.startPeriodicCheck(5); // Verificar cada 5 minutos

    // Limpiar al desmontar
    return () => {
      sessionManager.setWarningCallback(null);
    };
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleRegisterSuccess = (email) => {
    setToast({
      message: `¡Registro exitoso! Ahora puedes iniciar sesión con ${email}`,
      type: 'success'
    });
  };

  const handleLogout = () => {
    // MEJORA #3: Limpiar sesión con sessionManager
    sessionManager.clearSession();
    authService.logout();
    setUser(null);
    
    setToast({
      message: 'Sesión cerrada correctamente',
      type: 'info'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Cargando...</div>
      </div>
    );
  }

  return (
    <>
      {/* Toast global para notificaciones */}
      {toast && (
        <Toast 
          message={toast.message}
          type={toast.type}
          duration={toast.type === 'warning' ? 10000 : 3000}
          onClose={() => setToast(null)}
        />
      )}

      <BrowserRouter>
        <Routes>
          {/* Si el usuario está logueado, redirigir a dashboard */}
          {user ? (
            <>
              <Route path="/" element={<Dashboard user={user} onLogout={handleLogout} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : (
            <>
              <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
              <Route path="/register" element={<Register onRegisterSuccess={handleRegisterSuccess} />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          )}
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
