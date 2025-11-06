import { useState, useEffect } from 'react';
import FoodSearch from './FoodSearch';

function Dashboard({ onLogout }) {
  const [calorieLimit, setCalorieLimit] = useState(2000); // Límite de calorías diario
  const [editingLimit, setEditingLimit] = useState(false);
  const [meals, setMeals] = useState({
    desayuno: [],
    almuerzo: [],
    comida: [],
    merienda: [],
    cena: []
  });
  const [expandedMeals, setExpandedMeals] = useState({
    desayuno: false,
    almuerzo: false,
    comida: false,
    merienda: false,
    cena: false
  });
  const [showModal, setShowModal] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('');
  const [stats, setStats] = useState({
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0
  });

  const mealInfo = {
    desayuno: { icon: '🌅', name: 'Desayuno', time: '07:00 - 10:00' },
    almuerzo: { icon: '🥪', name: 'Almuerzo', time: '10:00 - 12:00' },
    comida: { icon: '🍽️', name: 'Comida', time: '13:00 - 16:00' },
    merienda: { icon: '🎃', name: 'Merienda', time: '17:00 - 19:00' },
    cena: { icon: '🌙', name: 'Cena', time: '20:00 - 23:00' }
  };

  useEffect(() => {
    calculateStats();
  }, [meals]);

  const calculateStats = () => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    Object.values(meals).forEach(mealFoods => {
      mealFoods.forEach(food => {
        totalCalories += food.calories || 0;
        totalProtein += food.protein || 0;
        totalCarbs += food.carbohydrates || 0;
        totalFat += food.fat || 0;
      });
    });

    setStats({
      totalCalories: totalCalories.toFixed(0),
      totalProtein: totalProtein.toFixed(1),
      totalCarbs: totalCarbs.toFixed(1),
      totalFat: totalFat.toFixed(1)
    });
  };

  const calculateMealTotals = (mealType) => {
    const mealFoods = meals[mealType];
    return mealFoods.reduce((acc, food) => ({
      calories: acc.calories + (food.calories || 0),
      protein: acc.protein + (food.protein || 0),
      carbs: acc.carbs + (food.carbohydrates || 0),
      fat: acc.fat + (food.fat || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const handleAddFood = (newFood) => {
    if (!selectedMealType) return;

    const foodWithId = {
      ...newFood,
      id: Date.now()
    };

    setMeals(prev => ({
      ...prev,
      [selectedMealType]: [...prev[selectedMealType], foodWithId]
    }));

    setShowModal(false);
    setSelectedMealType('');
  };

  const handleDeleteFood = (mealType, foodId) => {
    if (window.confirm('¿Estás seguro de eliminar esta comida?')) {
      setMeals(prev => ({
        ...prev,
        [mealType]: prev[mealType].filter(food => food.id !== foodId)
      }));
    }
  };

  const toggleMeal = (mealType) => {
    setExpandedMeals(prev => ({
      ...prev,
      [mealType]: !prev[mealType]
    }));
  };

  const openAddFoodModal = (mealType) => {
    setSelectedMealType(mealType);
    setShowModal(true);
  };

  const handleUpdateLimit = () => {
    const newLimit = prompt('Ingresa tu límite diario de calorías:', calorieLimit);
    if (newLimit && !isNaN(newLimit)) {
      setCalorieLimit(parseInt(newLimit));
    }
  };

  const getProgressBarClass = () => {
    const percentage = (stats.totalCalories / calorieLimit) * 100;
    if (percentage >= 100) return 'danger';  // Rojo si te pasas
    if (percentage >= 80) return 'success';  // Verde cuando te acercas al objetivo
    return '';  // Naranja por defecto (0-80%)
  };

  const progressPercentage = Math.min((stats.totalCalories / calorieLimit) * 100, 100);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="welcome-text">
              🎯 Tu Panel Nutricional
            </h1>
            <p style={{ color: '#6b7280', marginTop: '0.5rem', fontSize: '1rem' }}>
              Gestiona tus comidas y controla tu nutrición diaria
            </p>
          </div>
          <button
            onClick={onLogout}
            className="btn-delete"
            style={{ padding: '0.75rem 1.5rem' }}
          >
            🚪 Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Barra de progreso de calorías */}
      <div className="calories-progress-section">
        <div className="progress-header">
          <div>
            <h2 className="progress-title">🔥 Calorías del Día</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="progress-stats">
              {stats.totalCalories} / {calorieLimit} kcal
            </div>
            <button onClick={handleUpdateLimit} className="btn-edit-limit">
              ✏️ Editar límite
            </button>
          </div>
        </div>

        <div className="progress-bar-container">
          <div 
            className={`progress-bar-fill ${getProgressBarClass()}`}
            style={{ width: `${progressPercentage}%` }}
          ></div>
          <div className="progress-percentage">
            {progressPercentage.toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="stats-grid">
        <div className="stat-card" style={{ animationDelay: '0.1s' }}>
          <div className="stat-label">🔥 Calorías</div>
          <div className="stat-value">
            {stats.totalCalories}
            <span className="stat-unit">kcal</span>
          </div>
        </div>

        <div className="stat-card" style={{ animationDelay: '0.2s' }}>
          <div className="stat-label">💪 Proteínas</div>
          <div className="stat-value">
            {stats.totalProtein}
            <span className="stat-unit">g</span>
          </div>
        </div>

        <div className="stat-card" style={{ animationDelay: '0.3s' }}>
          <div className="stat-label">🍞 Carbohidratos</div>
          <div className="stat-value">
            {stats.totalCarbs}
            <span className="stat-unit">g</span>
          </div>
        </div>

        <div className="stat-card" style={{ animationDelay: '0.4s' }}>
          <div className="stat-label">🥑 Grasas</div>
          <div className="stat-value">
            {stats.totalFat}
            <span className="stat-unit">g</span>
          </div>
        </div>
      </div>

      {/* Secciones de comidas */}
      <div className="foods-section">
        <div className="section-header" style={{ marginBottom: '2rem' }}>
          <h2 className="section-title">
            🍽️ Mis Comidas del Día
          </h2>
        </div>

        {Object.keys(meals).map(mealType => {
          const mealData = meals[mealType];
          const totals = calculateMealTotals(mealType);
          const info = mealInfo[mealType];
          const isExpanded = expandedMeals[mealType];

          return (
            <div key={mealType} className="meal-section">
              <div 
                className={`meal-header ${isExpanded ? 'expanded' : ''}`}
                onClick={() => toggleMeal(mealType)}
              >
                <div className="meal-header-left">
                  <span className="meal-icon">{info.icon}</span>
                  <div className="meal-info">
                    <h3>{info.name}</h3>
                    <p className="meal-summary">
                      {mealData.length} alimento{mealData.length !== 1 ? 's' : ''} • {info.time}
                    </p>
                  </div>
                </div>
                <div className="meal-toggle">
                  <span className="meal-total-calories">
                    {totals.calories.toFixed(0)} kcal
                  </span>
                  <span className={`toggle-icon ${isExpanded ? 'rotated' : ''}`}>
                    ▼
                  </span>
                </div>
              </div>

              <div className={`meal-content ${isExpanded ? 'expanded' : ''}`}>
                <div className="meal-foods-list">
                  {mealData.length === 0 ? (
                    <div className="empty-meal">
                      <div className="empty-meal-icon">🍽️</div>
                      <p>No hay alimentos en {info.name.toLowerCase()}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openAddFoodModal(mealType);
                        }}
                        className="btn-add-to-meal"
                        style={{ margin: '1rem auto', display: 'inline-flex' }}
                      >
                        <span>🔍</span>
                        Buscar alimento
                      </button>
                    </div>
                  ) : (
                    <>
                      {mealData.map(food => (
                        <div key={food.id} className="meal-food-item">
                          <div className="meal-food-name">{food.name}</div>
                          <div className="meal-food-macro">
                            <span className="macro-label">Calorías</span>
                            <span className="macro-value">{food.calories}</span>
                          </div>
                          <div className="meal-food-macro">
                            <span className="macro-label">Proteínas</span>
                            <span className="macro-value">{food.protein}g</span>
                          </div>
                          <div className="meal-food-macro">
                            <span className="macro-label">Carbos</span>
                            <span className="macro-value">{food.carbohydrates}g</span>
                          </div>
                          <div className="meal-food-macro">
                            <span className="macro-label">Grasas</span>
                            <span className="macro-value">{food.fat}g</span>
                          </div>
                          <button
                            onClick={() => handleDeleteFood(mealType, food.id)}
                            className="btn-delete"
                            style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem' }}
                          >
                            🗑️
                          </button>
                        </div>
                      ))}

                      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openAddFoodModal(mealType);
                          }}
                          className="btn-add-to-meal"
                        >
                          <span>🔍</span>
                          Buscar más alimentos
                        </button>
                      </div>

                      <div className="meal-totals">
                        <div className="meal-total-item">
                          <div className="meal-total-label">🔥 Calorías</div>
                          <div className="meal-total-value">{totals.calories.toFixed(0)}</div>
                        </div>
                        <div className="meal-total-item">
                          <div className="meal-total-label">💪 Proteínas</div>
                          <div className="meal-total-value">{totals.protein.toFixed(1)}g</div>
                        </div>
                        <div className="meal-total-item">
                          <div className="meal-total-label">🍞 Carbos</div>
                          <div className="meal-total-value">{totals.carbs.toFixed(1)}g</div>
                        </div>
                        <div className="meal-total-item">
                          <div className="meal-total-label">🥑 Grasas</div>
                          <div className="meal-total-value">{totals.fat.toFixed(1)}g</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <FoodSearch
          mealType={selectedMealType}
          mealName={mealInfo[selectedMealType]?.name}
          onClose={() => {
            setShowModal(false);
            setSelectedMealType('');
          }}
          onAddFood={handleAddFood}
        />
      )}
    </div>
  );
}

export default Dashboard;
