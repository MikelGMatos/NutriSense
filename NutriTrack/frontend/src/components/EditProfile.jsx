import { useState, useEffect } from 'react';

function EditProfile({ isOpen, onClose, userProfile, onProfileUpdated }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    height: '',
    weight: '',
    gender: 'male',
    activity_level: 'sedentary',
    goal: 'maintain'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        email: userProfile.email || '',
        age: userProfile.age || '',
        height: userProfile.height || '',
        weight: userProfile.weight || '',
        gender: userProfile.gender || 'male',
        activity_level: userProfile.activity_level || 'sedentary',
        goal: userProfile.goal || 'maintain'
      });
    }
  }, [userProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateCalories = () => {
    const age = parseFloat(formData.age);
    const height = parseFloat(formData.height);
    const weight = parseFloat(formData.weight);
    
    if (!age || !height || !weight) return null;

    // Fórmula Harris-Benedict
    let bmr;
    if (formData.gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // Factor de actividad
    const activityFactors = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };

    const tdee = bmr * activityFactors[formData.activity_level];

    // Ajuste por objetivo
    const goalAdjustments = {
      lose: -500,
      maintain: 0,
      gain: 300
    };

    return Math.round(tdee + goalAdjustments[formData.goal]);
  };

  const calculateMacros = (calories) => {
    // Distribución de macros basada en el objetivo
    let proteinPercent, carbsPercent, fatPercent;

    if (formData.goal === 'lose') {
      proteinPercent = 0.35;
      carbsPercent = 0.35;
      fatPercent = 0.30;
    } else if (formData.goal === 'gain') {
      proteinPercent = 0.30;
      carbsPercent = 0.45;
      fatPercent = 0.25;
    } else {
      proteinPercent = 0.30;
      carbsPercent = 0.40;
      fatPercent = 0.30;
    }

    return {
      protein: Math.round((calories * proteinPercent) / 4),
      carbs: Math.round((calories * carbsPercent) / 4),
      fat: Math.round((calories * fatPercent) / 9)
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      
      // Calcular calorías y macros automáticamente
      const calculatedCalories = calculateCalories();
      const macros = calculatedCalories ? calculateMacros(calculatedCalories) : null;

      const updateData = {
        name: formData.name,
        age: formData.age ? parseInt(formData.age) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        gender: formData.gender,
        activity_level: formData.activity_level,
        goal: formData.goal,
        ...(macros && {
          daily_calories: calculatedCalories,
          daily_protein: macros.protein,
          daily_carbs: macros.carbs,
          daily_fat: macros.fat
        })
      };

      const response = await fetch('http://localhost:3001/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess('Perfil actualizado correctamente');
        setTimeout(() => {
          onProfileUpdated && onProfileUpdated(result.data);
          onClose();
        }, 1500);
      } else {
        setError(result.message || 'Error al actualizar el perfil');
      }
    } catch (err) {
      setError('Error de conexión al servidor');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const estimatedCalories = calculateCalories();

  return (
    <>
      <style>{`
        .edit-profile-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .edit-profile-modal {
          background: white;
          border-radius: 16px;
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .edit-profile-header {
          padding: 1.5rem;
          border-bottom: 1px solid #E9ECEF;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, #FF6B6B 0%, #FF8787 100%);
          color: white;
          border-radius: 16px 16px 0 0;
        }

        .edit-profile-title {
          font-size: 1.5rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .edit-profile-close {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          transition: all 0.2s;
        }

        .edit-profile-close:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.05);
        }

        .edit-profile-body {
          padding: 1.5rem;
        }

        .profile-form-group {
          margin-bottom: 1.25rem;
        }

        .profile-form-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #495057;
          font-size: 0.9rem;
        }

        .profile-form-input,
        .profile-form-select {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #E9ECEF;
          border-radius: 8px;
          font-size: 0.95rem;
          transition: all 0.2s;
          background: #F8F9FA;
        }

        .profile-form-input:focus,
        .profile-form-select:focus {
          outline: none;
          border-color: #FF6B6B;
          background: white;
          box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
        }

        .profile-form-input:disabled {
          background: #E9ECEF;
          cursor: not-allowed;
          opacity: 0.7;
        }

        .profile-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .profile-calories-preview {
          background: linear-gradient(135deg, #FFE4E6 0%, #FFF5F7 100%);
          padding: 1rem;
          border-radius: 12px;
          margin: 1.5rem 0;
          border: 2px solid #FFB3BA;
        }

        .profile-calories-preview h4 {
          color: #FF6B6B;
          margin-bottom: 0.5rem;
          font-size: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .profile-calories-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: #212529;
          margin: 0.5rem 0;
        }

        .profile-macros-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
          margin-top: 1rem;
        }

        .profile-macro-item {
          text-align: center;
          padding: 0.75rem;
          background: white;
          border-radius: 8px;
        }

        .profile-macro-label {
          font-size: 0.8rem;
          color: #6C757D;
          margin-bottom: 0.25rem;
        }

        .profile-macro-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #FF6B6B;
        }

        .profile-form-footer {
          padding: 1.5rem;
          border-top: 1px solid #E9ECEF;
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
        }

        .profile-btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.95rem;
        }

        .profile-btn-cancel {
          background: #F1F3F5;
          color: #495057;
        }

        .profile-btn-cancel:hover {
          background: #E9ECEF;
        }

        .profile-btn-save {
          background: linear-gradient(135deg, #FF6B6B 0%, #FF8787 100%);
          color: white;
        }

        .profile-btn-save:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
        }

        .profile-btn-save:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .profile-alert {
          padding: 0.75rem 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }

        .profile-alert-error {
          background: #FFF5F5;
          color: #DC3545;
          border: 1px solid #FFCCD5;
        }

        .profile-alert-success {
          background: #D4EDDA;
          color: #155724;
          border: 1px solid #C3E6CB;
        }

        .profile-form-hint {
          font-size: 0.8rem;
          color: #6C757D;
          margin-top: 0.25rem;
        }

        @media (max-width: 640px) {
          .profile-form-row {
            grid-template-columns: 1fr;
          }

          .edit-profile-modal {
            max-height: 95vh;
          }
        }
      `}</style>

      <div className="edit-profile-overlay" onClick={onClose}>
        <div className="edit-profile-modal" onClick={(e) => e.stopPropagation()}>
          <div className="edit-profile-header">
            <h2 className="edit-profile-title">
              <span>👤</span>
              Editar Perfil
            </h2>
            <button className="edit-profile-close" onClick={onClose}>
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="edit-profile-body">
              {error && (
                <div className="profile-alert profile-alert-error">
                  {error}
                </div>
              )}

              {success && (
                <div className="profile-alert profile-alert-success">
                  {success}
                </div>
              )}

              <div className="profile-form-group">
                <label className="profile-form-label">Nombre</label>
                <input
                  type="text"
                  name="name"
                  className="profile-form-input"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="profile-form-group">
                <label className="profile-form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="profile-form-input"
                  value={formData.email}
                  disabled
                />
                <div className="profile-form-hint">El email no se puede modificar</div>
              </div>

              <div className="profile-form-row">
                <div className="profile-form-group">
                  <label className="profile-form-label">Edad (años)</label>
                  <input
                    type="number"
                    name="age"
                    className="profile-form-input"
                    value={formData.age}
                    onChange={handleChange}
                    min="1"
                    max="120"
                  />
                </div>

                <div className="profile-form-group">
                  <label className="profile-form-label">Altura (cm)</label>
                  <input
                    type="number"
                    name="height"
                    className="profile-form-input"
                    value={formData.height}
                    onChange={handleChange}
                    min="1"
                    max="300"
                  />
                </div>
              </div>

              <div className="profile-form-row">
                <div className="profile-form-group">
                  <label className="profile-form-label">Peso (kg)</label>
                  <input
                    type="number"
                    name="weight"
                    className="profile-form-input"
                    value={formData.weight}
                    onChange={handleChange}
                    min="1"
                    max="500"
                    step="0.1"
                  />
                </div>

                <div className="profile-form-group">
                  <label className="profile-form-label">Género</label>
                  <select
                    name="gender"
                    className="profile-form-select"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="male">Masculino</option>
                    <option value="female">Femenino</option>
                  </select>
                </div>
              </div>

              <div className="profile-form-group">
                <label className="profile-form-label">Nivel de Actividad</label>
                <select
                  name="activity_level"
                  className="profile-form-select"
                  value={formData.activity_level}
                  onChange={handleChange}
                >
                  <option value="sedentary">Sedentario (poco o ningún ejercicio)</option>
                  <option value="light">Ligero (ejercicio 1-3 días/semana)</option>
                  <option value="moderate">Moderado (ejercicio 3-5 días/semana)</option>
                  <option value="active">Activo (ejercicio 6-7 días/semana)</option>
                  <option value="very_active">Muy Activo (ejercicio muy intenso)</option>
                </select>
              </div>

              <div className="profile-form-group">
                <label className="profile-form-label">Objetivo</label>
                <select
                  name="goal"
                  className="profile-form-select"
                  value={formData.goal}
                  onChange={handleChange}
                >
                  <option value="lose">Perder peso (déficit calórico)</option>
                  <option value="maintain">Mantener peso</option>
                  <option value="gain">Ganar peso (superávit calórico)</option>
                </select>
              </div>

              {estimatedCalories && (
                <div className="profile-calories-preview">
                  <h4>
                    <span>🔥</span>
                    Calorías estimadas diarias
                  </h4>
                  <div className="profile-calories-value">
                    {estimatedCalories} kcal
                  </div>
                  <div className="profile-macros-grid">
                    <div className="profile-macro-item">
                      <div className="profile-macro-label">Proteínas</div>
                      <div className="profile-macro-value">
                        {calculateMacros(estimatedCalories).protein}g
                      </div>
                    </div>
                    <div className="profile-macro-item">
                      <div className="profile-macro-label">Carbohidratos</div>
                      <div className="profile-macro-value">
                        {calculateMacros(estimatedCalories).carbs}g
                      </div>
                    </div>
                    <div className="profile-macro-item">
                      <div className="profile-macro-label">Grasas</div>
                      <div className="profile-macro-value">
                        {calculateMacros(estimatedCalories).fat}g
                      </div>
                    </div>
                  </div>
                  <div className="profile-form-hint" style={{ marginTop: '0.75rem', textAlign: 'center' }}>
                    Estas calorías y macros se actualizarán automáticamente
                  </div>
                </div>
              )}
            </div>

            <div className="profile-form-footer">
              <button
                type="button"
                className="profile-btn profile-btn-cancel"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="profile-btn profile-btn-save"
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default EditProfile;
