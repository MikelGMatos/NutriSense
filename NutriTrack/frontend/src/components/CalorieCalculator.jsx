import { useState } from 'react';
import { authService } from '../services/api';

const CalorieCalculator = ({ user, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    age: '',
    height: '',
    weight: '',
    gender: 'male',
    activity_level: 'sedentary',
    goal: 'maintain'
  });
  
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const activityLevels = {
    sedentary: { label: 'Sedentario (poco o ningún ejercicio)', factor: 1.2 },
    light: { label: 'Ligero (ejercicio 1-3 días/semana)', factor: 1.375 },
    moderate: { label: 'Moderado (ejercicio 3-5 días/semana)', factor: 1.55 },
    active: { label: 'Activo (ejercicio 6-7 días/semana)', factor: 1.725 },
    very_active: { label: 'Muy activo (ejercicio intenso diario)', factor: 1.9 }
  };

  const goals = {
    lose: { label: 'Perder peso', adjustment: -300 },
    maintain: { label: 'Mantener peso', adjustment: 0 },
    gain: { label: 'Ganar peso', adjustment: 300 }
  };

  // Fórmula Harris-Benedict revisada
  const calculateTMB = (weight, height, age, gender) => {
    if (gender === 'male') {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      return 10 * weight + 6.25 * height - 5 * age - 161;
    }
  };

  const calculateCalories = () => {
    const { weight, height, age, gender, activity_level, goal } = formData;

    // Validaciones
    if (!weight || !height || !age) {
      setError('Por favor completa todos los campos');
      return;
    }

    // Calcular TMB (Tasa Metabólica Basal)
    const tmb = calculateTMB(
      parseFloat(weight),
      parseFloat(height),
      parseInt(age),
      gender
    );

    // Calcular TDEE (Total Daily Energy Expenditure)
    const tdee = tmb * activityLevels[activity_level].factor;

    // Ajustar según objetivo
    const dailyCalories = Math.round(tdee + goals[goal].adjustment);

    // Calcular macros (proteínas 30%, carbohidratos 45%, grasas 25%)
    const protein = Math.round((dailyCalories * 0.30) / 4); // 4 kcal por gramo
    const carbs = Math.round((dailyCalories * 0.45) / 4);
    const fat = Math.round((dailyCalories * 0.25) / 9); // 9 kcal por gramo

    setResults({
      tmb: Math.round(tmb),
      tdee: Math.round(tdee),
      dailyCalories,
      protein,
      carbs,
      fat
    });

    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!results) {
      calculateCalories();
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('📤 Enviando datos al servidor...');
      
      // Guardar los datos en el backend
      const response = await authService.updateProfile({
        age: parseInt(formData.age),
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        gender: formData.gender,
        activity_level: formData.activity_level,
        goal: formData.goal,
        daily_calories: results.dailyCalories,
        daily_protein: results.protein,
        daily_carbs: results.carbs,
        daily_fat: results.fat
      });

      console.log('✅ Respuesta del servidor:', response);
      onSuccess('¡Perfil actualizado! Tus objetivos nutricionales han sido guardados.');
      onClose();
    } catch (err) {
      console.error('❌ Error al guardar:', err);
      console.error('Error response:', err.response?.data);
      
      const errorMessage = err.response?.data?.message 
        || err.response?.data?.error 
        || err.message 
        || 'Error al guardar el perfil';
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Resetear resultados si cambian los datos
    if (results) {
      setResults(null);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">🔢 Calculadora de Calorías</h2>
          <p style={{ color: 'var(--color-gray-500)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Calcula tus necesidades calóricas diarias según tu perfil y objetivos
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
          {error && (
            <div className="message message-error" style={{ marginBottom: '1.5rem' }}>
              ⚠️ {error}
            </div>
          )}

          <div className="form-grid">
            {/* Edad */}
            <div className="form-group">
              <label className="form-label">Edad (años)</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="form-input"
                placeholder="Ej: 25"
                min="15"
                max="100"
                required
                disabled={loading}
              />
            </div>

            {/* Altura */}
            <div className="form-group">
              <label className="form-label">Altura (cm)</label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                className="form-input"
                placeholder="Ej: 175"
                min="100"
                max="250"
                step="0.1"
                required
                disabled={loading}
              />
            </div>

            {/* Peso */}
            <div className="form-group">
              <label className="form-label">Peso (kg)</label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className="form-input"
                placeholder="Ej: 70"
                min="30"
                max="300"
                step="0.1"
                required
                disabled={loading}
              />
            </div>

            {/* Género */}
            <div className="form-group">
              <label className="form-label">Género</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="form-select"
                required
                disabled={loading}
              >
                <option value="male">Masculino</option>
                <option value="female">Femenino</option>
              </select>
            </div>

            {/* Nivel de actividad */}
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Nivel de actividad física</label>
              <select
                name="activity_level"
                value={formData.activity_level}
                onChange={handleChange}
                className="form-select"
                required
                disabled={loading}
              >
                {Object.entries(activityLevels).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            {/* Objetivo */}
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Objetivo</label>
              <select
                name="goal"
                value={formData.goal}
                onChange={handleChange}
                className="form-select"
                required
                disabled={loading}
              >
                {Object.entries(goals).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-gray-500)', marginTop: '0.5rem' }}>
                {goals[formData.goal].adjustment > 0 && '📈 Se añadirán 300 kcal para ganar peso'}
                {goals[formData.goal].adjustment < 0 && '📉 Se restarán 300 kcal para perder peso'}
                {goals[formData.goal].adjustment === 0 && '⚖️ Se mantendrán las calorías de mantenimiento'}
              </p>
            </div>
          </div>

          {/* Resultados */}
          {results && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.05) 0%, rgba(255, 135, 135, 0.08) 100%)',
              padding: '1.5rem',
              borderRadius: 'var(--radius-lg)',
              marginTop: '2rem',
              border: '2px solid rgba(255, 107, 107, 0.2)'
            }}>
              <h3 style={{ 
                fontSize: '1.1rem', 
                fontWeight: '700', 
                marginBottom: '1rem',
                color: 'var(--color-gray-800)'
              }}>
                📊 Tus resultados
              </h3>

              <div style={{ display: 'grid', gap: '1rem' }}>
                {/* Calorías diarias */}
                <div style={{
                  background: 'white',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '2px solid var(--color-primary)',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-gray-600)', fontWeight: '600' }}>
                    CALORÍAS DIARIAS RECOMENDADAS
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-primary)', marginTop: '0.25rem' }}>
                    {results.dailyCalories} <span style={{ fontSize: '1rem' }}>kcal/día</span>
                  </div>
                </div>

                {/* Desglose */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div style={{ background: 'white', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)' }}>TMB (Basal)</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--color-gray-700)' }}>
                      {results.tmb} kcal
                    </div>
                  </div>
                  <div style={{ background: 'white', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)' }}>TDEE (Total)</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--color-gray-700)' }}>
                      {results.tdee} kcal
                    </div>
                  </div>
                </div>

                {/* Macros */}
                <div style={{
                  background: 'white',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)'
                }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-gray-700)', marginBottom: '0.75rem' }}>
                    Distribución de macronutrientes
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)' }}>Proteínas</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#FF6B6B' }}>
                        {results.protein}g
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-gray-400)' }}>30%</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)' }}>Carbohidratos</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#51CF66' }}>
                        {results.carbs}g
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-gray-400)' }}>45%</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)' }}>Grasas</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#FCC419' }}>
                        {results.fat}g
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-gray-400)' }}>25%</div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{
                marginTop: '1rem',
                padding: '0.75rem',
                background: 'rgba(51, 154, 240, 0.1)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                color: 'var(--color-info)'
              }}>
                💡 <strong>Nota:</strong> Estos valores son estimaciones. Consulta con un profesional de la salud para un plan personalizado.
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
              style={{ flex: 1 }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={calculateCalories}
              className="btn-secondary"
              disabled={loading || !formData.age || !formData.height || !formData.weight}
              style={{ 
                flex: 1,
                borderColor: 'var(--color-info)',
                color: 'var(--color-info)'
              }}
            >
              {results ? 'Recalcular' : '🔢 Calcular'}
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading || !results}
              style={{ flex: 1 }}
            >
              {loading ? (
                <>
                  <div className="loading-spinner" />
                  Guardando...
                </>
              ) : (
                '💾 Guardar perfil'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CalorieCalculator;
