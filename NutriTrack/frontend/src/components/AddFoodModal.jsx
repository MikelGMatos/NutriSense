import { useState } from 'react';

function AddFoodModal({ onClose, onAdd, mealType, mealName }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Frutas',
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0,
    fiber: 0,
    sodium: 0
  });

  const categories = [
    'Frutas',
    'Verduras',
    'Proteínas',
    'Lácteos',
    'Cereales',
    'Legumbres',
    'Snacks',
    'Bebidas',
    'Otros'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'category' || name === 'name' ? value : parseFloat(value) || 0
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      onAdd(formData);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            ✨ Añadir a {mealName || 'Comida'}
          </h2>
          <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
            Completa la información nutricional del alimento
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                🍽️ Nombre del alimento
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Ej: Manzana verde"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                📁 Categoría
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-select"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div style={{ 
              background: 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)',
              padding: '1.5rem',
              borderRadius: '16px',
              marginTop: '1rem'
            }}>
              <h3 style={{ 
                fontSize: '0.875rem',
                fontWeight: '700',
                color: '#374151',
                marginBottom: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                📊 Información Nutricional (por 100g)
              </h3>

              <div className="nutrients-grid">
                <div className="nutrient-item">
                  <label className="nutrient-label">
                    🔥 Calorías (kcal)
                  </label>
                  <input
                    type="number"
                    name="calories"
                    value={formData.calories}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="0"
                    step="0.01"
                  />
                </div>

                <div className="nutrient-item">
                  <label className="nutrient-label">
                    💪 Proteínas (g)
                  </label>
                  <input
                    type="number"
                    name="protein"
                    value={formData.protein}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="0"
                    step="0.01"
                  />
                </div>

                <div className="nutrient-item">
                  <label className="nutrient-label">
                    🍞 Carbohidratos (g)
                  </label>
                  <input
                    type="number"
                    name="carbohydrates"
                    value={formData.carbohydrates}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="0"
                    step="0.01"
                  />
                </div>

                <div className="nutrient-item">
                  <label className="nutrient-label">
                    🥑 Grasas (g)
                  </label>
                  <input
                    type="number"
                    name="fat"
                    value={formData.fat}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="0"
                    step="0.01"
                  />
                </div>

                <div className="nutrient-item">
                  <label className="nutrient-label">
                    🌾 Fibra (g)
                  </label>
                  <input
                    type="number"
                    name="fiber"
                    value={formData.fiber}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="0"
                    step="0.01"
                  />
                </div>

                <div className="nutrient-item">
                  <label className="nutrient-label">
                    🧂 Sodio (mg)
                  </label>
                  <input
                    type="number"
                    name="sodium"
                    value={formData.sodium}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                ❌ Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-submit"
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <span className="loading-spinner"></span>
                    Añadiendo...
                  </span>
                ) : (
                  '✨ Añadir Comida'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddFoodModal;