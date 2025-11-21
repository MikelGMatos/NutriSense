import { useState, useEffect } from 'react';

function Toast({ message, type = 'success', duration = 3000, onClose }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        setIsVisible(false);
        onClose();
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const configs = {
    success: { 
      bg: '#22c55e', 
      text: '#fff',
      icon: '✅',
      border: '#16a34a'
    },
    error: { 
      bg: '#ef4444', 
      text: '#fff',
      icon: '❌',
      border: '#dc2626'
    },
    warning: { 
      bg: '#f59e0b', 
      text: '#fff',
      icon: '⚠️',
      border: '#d97706'
    },
    info: { 
      bg: '#3b82f6', 
      text: '#fff',
      icon: 'ℹ️',
      border: '#2563eb'
    }
  };

  const config = configs[type];

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: config.bg,
      color: config.text,
      padding: '1rem 1.5rem',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 9999,
      opacity: isExiting ? 0 : 1,
      transform: isExiting ? 'translateX(100%)' : 'translateX(0)',
      transition: 'all 0.3s ease-out',
      minWidth: '250px',
      maxWidth: '400px',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      border: `2px solid ${config.border}`
    }}>
      <span style={{ fontSize: '1.2rem' }}>{config.icon}</span>
      <span style={{ flex: 1, fontSize: '0.9rem', fontWeight: '500' }}>
        {message}
      </span>
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => {
            setIsVisible(false);
            onClose();
          }, 300);
        }}
        style={{
          background: 'rgba(255,255,255,0.2)',
          border: 'none',
          borderRadius: '4px',
          color: config.text,
          cursor: 'pointer',
          padding: '0.25rem 0.5rem',
          fontSize: '0.8rem',
          fontWeight: '600'
        }}
      >
        ✕
      </button>
    </div>
  );
}

export default Toast;
