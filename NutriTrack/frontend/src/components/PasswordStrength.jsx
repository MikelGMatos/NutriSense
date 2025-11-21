import { useMemo } from 'react';

function PasswordStrength({ password }) {
  const strength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: '', width: 0 };
    
    let score = 0;
    
    // Criterios de evaluación
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    
    const levels = [
      { score: 0, label: '', color: '#e5e7eb', width: 0 },
      { score: 1, label: 'Muy débil', color: '#ef4444', width: 20 },
      { score: 2, label: 'Débil', color: '#f59e0b', width: 40 },
      { score: 3, label: 'Media', color: '#eab308', width: 60 },
      { score: 4, label: 'Fuerte', color: '#84cc16', width: 80 },
      { score: 5, label: 'Muy fuerte', color: '#22c55e', width: 100 }
    ];
    
    return levels[score];
  }, [password]);

  if (!password) return null;

  return (
    <div style={{ marginTop: '0.5rem' }}>
      {/* Barra de progreso */}
      <div style={{ 
        height: '4px', 
        background: '#e5e7eb', 
        borderRadius: '2px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${strength.width}%`,
          height: '100%',
          background: strength.color,
          transition: 'all 0.3s ease-out'
        }} />
      </div>
      
      {/* Etiqueta de fuerza */}
      <div style={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '0.25rem'
      }}>
        <span style={{ 
          fontSize: '0.75rem', 
          color: strength.color,
          fontWeight: '600'
        }}>
          {strength.label}
        </span>
        
        {/* Consejos cuando la contraseña es débil */}
        {strength.score > 0 && strength.score < 4 && (
          <span style={{ 
            fontSize: '0.7rem', 
            color: '#6b7280'
          }}>
            {getPasswordTip(password)}
          </span>
        )}
      </div>
    </div>
  );
}

// Función auxiliar para dar consejos
function getPasswordTip(password) {
  if (password.length < 8) return 'Usa 8+ caracteres';
  if (!/[A-Z]/.test(password)) return 'Añade mayúsculas';
  if (!/[a-z]/.test(password)) return 'Añade minúsculas';
  if (!/\d/.test(password)) return 'Añade números';
  if (!/[^a-zA-Z0-9]/.test(password)) return 'Añade símbolos';
  return '';
}

export default PasswordStrength;
