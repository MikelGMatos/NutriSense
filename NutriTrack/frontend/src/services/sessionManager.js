class SessionManager {
  constructor() {
    this.timeout = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
    this.warningTime = 5 * 60 * 1000; // Advertir 5 minutos antes
    this.warningShown = false;
    this.warningCallback = null;
  }

  /**
   * Iniciar sesión y configurar expiración
   */
  startSession(token) {
    const expiryTime = Date.now() + this.timeout;
    localStorage.setItem('sessionExpiry', expiryTime.toString());
    localStorage.setItem('token', token);
    
    console.log('🕐 Sesión iniciada. Expira en 24 horas');
    
    this.scheduleWarning();
  }

  /**
   * Programar advertencia de expiración
   */
  scheduleWarning() {
    const expiry = localStorage.getItem('sessionExpiry');
    if (!expiry) return;

    const expiryTime = parseInt(expiry);
    const timeLeft = expiryTime - Date.now();

    // Si queda más tiempo que el warning, programar advertencia
    if (timeLeft > this.warningTime) {
      const warningDelay = timeLeft - this.warningTime;
      
      setTimeout(() => {
        if (!this.warningShown && this.warningCallback) {
          this.warningShown = true;
          this.warningCallback('Tu sesión expirará en 5 minutos. Guarda tu trabajo.');
          console.log('⚠️ Advertencia: Sesión expira en 5 minutos');
        }
      }, warningDelay);

      // Programar expiración automática
      setTimeout(() => {
        this.expireSession();
      }, timeLeft);
    } else if (timeLeft > 0) {
      // Si queda menos de 5 minutos, mostrar advertencia inmediatamente
      if (!this.warningShown && this.warningCallback) {
        this.warningShown = true;
        const minutesLeft = Math.ceil(timeLeft / 60000);
        this.warningCallback(`Tu sesión expirará en ${minutesLeft} minuto(s)`);
      }
      
      // Programar expiración
      setTimeout(() => {
        this.expireSession();
      }, timeLeft);
    } else {
      // Ya expiró
      this.expireSession();
    }
  }

  /**
   * Configurar callback para mostrar advertencias
   */
  setWarningCallback(callback) {
    this.warningCallback = callback;
  }

  /**
   * Verificar si la sesión es válida
   */
  isSessionValid() {
    const expiry = localStorage.getItem('sessionExpiry');
    if (!expiry) return false;

    const expiryTime = parseInt(expiry);
    const isValid = Date.now() < expiryTime;

    if (!isValid) {
      console.log('❌ Sesión expirada');
    }

    return isValid;
  }

  /**
   * Expirar sesión automáticamente
   */
  expireSession() {
    console.log('⏱️ Sesión expirada automáticamente');
    this.clearSession();
    
    // Notificar al usuario
    if (this.warningCallback) {
      this.warningCallback('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', 'error');
    }
    
    // Recargar la página para forzar logout
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }

  /**
   * Extender la sesión (renovar token)
   */
  extendSession(newToken) {
    if (newToken) {
      localStorage.setItem('token', newToken);
    }
    
    const newExpiryTime = Date.now() + this.timeout;
    localStorage.setItem('sessionExpiry', newExpiryTime.toString());
    
    this.warningShown = false;
    this.scheduleWarning();
    
    console.log('🔄 Sesión extendida por 24 horas más');
  }

  /**
   * Limpiar sesión completamente
   */
  clearSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('sessionExpiry');
    console.log('🗑️ Sesión limpiada');
  }

  /**
   * Obtener tiempo restante en minutos
   */
  getTimeRemaining() {
    const expiry = localStorage.getItem('sessionExpiry');
    if (!expiry) return 0;

    const expiryTime = parseInt(expiry);
    const timeLeft = expiryTime - Date.now();
    
    return Math.max(0, Math.floor(timeLeft / 60000)); // Convertir a minutos
  }

  /**
   * Verificar sesión periódicamente
   */
  startPeriodicCheck(intervalMinutes = 5) {
    setInterval(() => {
      if (!this.isSessionValid()) {
        this.expireSession();
      }
    }, intervalMinutes * 60 * 1000);
  }
}

// Exportar instancia única
export const sessionManager = new SessionManager();

// Uso en React:
// import { sessionManager } from './services/sessionManager';
// 
// En Login después de login exitoso:
// sessionManager.startSession(token);
//
// En App.jsx:
// useEffect(() => {
//   sessionManager.setWarningCallback((message, type) => {
//     setToast({ message, type: type || 'warning' });
//   });
//   sessionManager.startPeriodicCheck();
// }, []);
