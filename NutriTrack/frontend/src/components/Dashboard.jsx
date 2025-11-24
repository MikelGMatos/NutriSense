import { useState, useEffect } from 'react';
import FoodSearch from './FoodSearch';

function Dashboard({ onLogout }) {
  const [calorieLimit, setCalorieLimit] = useState(2000);
  const [showCalorieModal, setShowCalorieModal] = useState(false);
  const [newCalorieLimit, setNewCalorieLimit] = useState('');
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
    loadTodayMeals();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [meals]);

  const loadTodayMeals = async () => {
    try {
      const token = localStorage.getItem('token');
      const today = new Date().toISOString().split('T')[0];

      const response = await fetch(`http://localhost:3001/api/diary/entries/${today}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.data) {
          setMeals(result.data.meals);
          
          if (result.data.totals) {
            setStats({
              totalCalories: result.data.totals.calories,
              totalProtein: result.data.totals.protein,
              totalCarbs: result.data.totals.carbohydrates,
              totalFat: result.data.totals.fat
            });
          }
        }
      }
    } catch (error) {
      console.error('Error de conexión:', error);
    }
  };

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

  const handleAddFood = async (foodData) => {
    if (!selectedMealType) return;

    try {
      const token = localStorage.getItem('token');
      const today = new Date().toISOString().split('T')[0];

      const dataToSend = {
        date: today,
        meal_type: selectedMealType,
        food_name: foodData.name,
        portion: foodData.portion || `${foodData.amount}g`,
        amount: foodData.amount || 100,
        calories: foodData.calories,
        protein: foodData.protein,
        carbohydrates: foodData.carbohydrates,
        fat: foodData.fat,
        food_id: foodData.id || null
      };

      const response = await fetch('http://localhost:3001/api/diary/entries', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        const result = await response.json();

        const foodWithId = {
          id: result.data.id,
          name: foodData.name,
          category: foodData.category,
          brand: foodData.brand,
          calories: foodData.calories,
          protein: foodData.protein,
          carbohydrates: foodData.carbohydrates,
          fat: foodData.fat,
          portion: foodData.portion,
          amount: foodData.amount
        };

        setMeals(prev => ({
          ...prev,
          [selectedMealType]: [...prev[selectedMealType], foodWithId]
        }));

        setShowModal(false);
        setSelectedMealType('');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDeleteFood = async (mealType, foodId) => {
    if (!window.confirm('¿Eliminar esta comida?')) return;

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`http://localhost:3001/api/diary/entries/${foodId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setMeals(prev => ({
          ...prev,
          [mealType]: prev[mealType].filter(food => food.id !== foodId)
        }));
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleUpdateLimit = () => {
    setNewCalorieLimit(calorieLimit.toString());
    setShowCalorieModal(true);
  };

  const handleSaveCalorieLimit = () => {
    const limit = parseInt(newCalorieLimit);
    
    if (!limit || limit < 500 || limit > 10000) {
      alert('Introduce un límite entre 500 y 10,000 calorías');
      return;
    }

    setCalorieLimit(limit);
    setShowCalorieModal(false);
    setNewCalorieLimit('');
  };

  const openAddFoodModal = (mealType) => {
    setSelectedMealType(mealType);
    setShowModal(true);
  };

  const toggleMeal = (mealType) => {
    setExpandedMeals(prev => ({
      ...prev,
      [mealType]: !prev[mealType]
    }));
  };

  const progressPercentage = Math.min((stats.totalCalories / calorieLimit) * 100, 100);

  const getProgressBarClass = () => {
    if (progressPercentage < 50) return 'low';
    if (progressPercentage < 80) return 'medium';
    if (progressPercentage < 100) return 'high';
    return 'exceeded';
  };

  return (
    <div className="dashboard-wrapper">
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .dashboard-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg, #FFF5F5 0%, #FFE4E6 25%, #FFF1F3 50%, #FFEBEE 75%, #FFF5F7 100%);
          background-attachment: fixed;
          position: relative;
        }

        .dashboard-wrapper::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: 
            radial-gradient(circle at 15% 20%, rgba(255, 107, 107, 0.08) 0%, transparent 40%),
            radial-gradient(circle at 85% 80%, rgba(255, 135, 135, 0.06) 0%, transparent 40%),
            radial-gradient(circle at 50% 50%, rgba(255, 107, 107, 0.04) 0%, transparent 60%);
          pointer-events: none;
          z-index: 0;
          animation: subtleShift 30s ease-in-out infinite;
        }

        @keyframes subtleShift {
          0%, 100% {
            opacity: 0.6;
          }
          50% {
            opacity: 0.8;
          }
        }

        .dashboard-header {
          background: #FFFFFF;
          border-bottom: 2px solid #E9ECEF;
          padding: 1.5rem 2rem;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          position: relative;
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .header-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .header-logo {
          font-size: 2rem;
        }

        .header-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #212529;
          letter-spacing: -0.5px;
        }

        .header-subtitle {
          font-size: 0.85rem;
          color: #6C757D;
        }

        .btn-logout {
          padding: 0.75rem 1.5rem;
          background: #F1F3F5;
          color: #495057;
          border: 2px solid #DEE2E6;
          border-radius: 10px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-logout:hover {
          background: #FF6B6B;
          border-color: #FF6B6B;
          color: #FFFFFF;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255, 107, 107, 0.25);
        }

        .dashboard-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          position: relative;
          z-index: 1;
        }

        .calories-section {
          background: #FFFFFF;
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          border: 2px solid #E9ECEF;
        }

        .calories-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .calories-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #212529;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .calories-stats {
          font-size: 1.1rem;
          font-weight: 600;
          color: #495057;
        }

        .btn-edit-limit {
          padding: 0.625rem 1.25rem;
          background: #FF6B6B;
          color: #FFFFFF;
          border: none;
          border-radius: 10px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-edit-limit:hover {
          background: #FA5252;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
        }

        .progress-bar-container {
          position: relative;
          height: 2.5rem;
          background: #F1F3F5;
          border-radius: 12px;
          overflow: hidden;
          border: 2px solid #E9ECEF;
        }

        .progress-bar-fill {
          height: 100%;
          border-radius: 10px;
          transition: width 0.5s ease, background 0.3s;
        }

        .progress-bar-fill.low {
          background: linear-gradient(90deg, #F97316, #FB923C);
        }

        .progress-bar-fill.medium {
          background: linear-gradient(90deg, #FBBF24, #FCD34D);
        }

        .progress-bar-fill.high {
          background: linear-gradient(90deg, #10B981, #34D399);
        }

        .progress-bar-fill.exceeded {
          background: linear-gradient(90deg, #EF4444, #F87171);
        }

        .progress-percentage {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-weight: 700;
          color: #212529;
          font-size: 1.1rem;
          z-index: 1;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.25rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: #FFFFFF;
          border-radius: 14px;
          padding: 1.75rem;
          border: 2px solid #E9ECEF;
          transition: all 0.2s ease;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
          border-color: #FF6B6B;
        }

        .stat-label {
          font-size: 0.9rem;
          color: #6C757D;
          margin-bottom: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: 700;
          color: #212529;
        }

        .stat-unit {
          font-size: 1.1rem;
          margin-left: 0.25rem;
          color: #6C757D;
        }

        .meals-section {
          margin-top: 2rem;
        }

        .section-header {
          background: #FFFFFF;
          border-radius: 14px;
          padding: 1.5rem 2rem;
          margin-bottom: 1.5rem;
          border: 2px solid #E9ECEF;
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #212529;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .meal-card {
          background: #FFFFFF;
          border-radius: 14px;
          margin-bottom: 1.25rem;
          border: 2px solid #E9ECEF;
          overflow: hidden;
          transition: all 0.2s ease;
        }

        .meal-card:hover {
          border-color: #FF6B6B;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
        }

        .meal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .meal-header:hover {
          background: #F8F9FA;
        }

        .meal-header.expanded {
          background: #F1F3F5;
          border-bottom: 2px solid #E9ECEF;
        }

        .meal-header-left {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .meal-icon {
          font-size: 2.5rem;
        }

        .meal-info h3 {
          font-size: 1.25rem;
          color: #212529;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .meal-summary {
          font-size: 0.9rem;
          color: #6C757D;
        }

        .meal-header-right {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .meal-calories {
          font-weight: 700;
          font-size: 1.2rem;
          color: #FF6B6B;
        }

        .toggle-icon {
          transition: transform 0.3s ease;
          color: #ADB5BD;
          font-size: 1.25rem;
        }

        .toggle-icon.rotated {
          transform: rotate(180deg);
        }

        .meal-content {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.4s ease;
        }

        .meal-content.expanded {
          max-height: 3000px;
        }

        .meal-body {
          padding: 0 1.5rem 1.5rem;
        }

        .empty-meal {
          text-align: center;
          padding: 3rem 2rem;
          color: #ADB5BD;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .empty-text {
          font-size: 1rem;
          color: #6C757D;
          margin-bottom: 1.5rem;
        }

        .btn-add-food {
          padding: 0.875rem 1.75rem;
          background: #FF6B6B;
          color: #FFFFFF;
          border: none;
          border-radius: 10px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-add-food:hover {
          background: #FA5252;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
        }

        .food-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
          background: #F8F9FA;
          border-radius: 10px;
          margin-bottom: 1rem;
          transition: all 0.2s ease;
          border: 2px solid transparent;
        }

        .food-item:hover {
          background: #FFFFFF;
          border-color: #E9ECEF;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .food-name {
          flex: 1;
          font-weight: 600;
          color: #212529;
        }

        .food-macro {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 70px;
        }

        .macro-label {
          font-size: 0.7rem;
          color: #ADB5BD;
          text-transform: uppercase;
          font-weight: 600;
        }

        .macro-value {
          font-weight: 700;
          color: #495057;
        }

        .btn-delete-food {
          padding: 0.625rem 0.875rem;
          background: #F1F3F5;
          color: #6C757D;
          border: 2px solid #DEE2E6;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 1.1rem;
        }

        .btn-delete-food:hover {
          background: #FF6B6B;
          border-color: #FF6B6B;
          color: #FFFFFF;
        }

        .meal-totals {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 1rem;
          padding: 1.5rem;
          background: #F8F9FA;
          border-radius: 10px;
          margin-top: 1.5rem;
          border: 2px solid #E9ECEF;
        }

        .meal-total-item {
          text-align: center;
        }

        .meal-total-label {
          font-size: 0.85rem;
          color: #6C757D;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }

        .meal-total-value {
          font-size: 1.3rem;
          font-weight: 700;
          color: #212529;
        }

        .calorie-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(33, 37, 41, 0.6);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .calorie-modal {
          background: #FFFFFF;
          border-radius: 20px;
          max-width: 520px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          overflow: hidden;
        }

        .calorie-modal-header {
          background: linear-gradient(135deg, #FF6B6B 0%, #FF8787 100%);
          padding: 2.5rem 2rem;
          text-align: center;
          color: #FFFFFF;
        }

        .calorie-modal-icon {
          font-size: 4rem;
          margin-bottom: 0.75rem;
        }

        .calorie-modal-header h2 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
          font-weight: 700;
        }

        .calorie-modal-body {
          padding: 2rem;
        }

        .calorie-input-group {
          margin-bottom: 1.5rem;
        }

        .calorie-input-label {
          display: block;
          font-weight: 600;
          color: #343A40;
          margin-bottom: 0.875rem;
        }

        .calorie-input-wrapper {
          position: relative;
        }

        .calorie-input {
          width: 100%;
          padding: 1.25rem 4rem 1.25rem 1.25rem;
          border: 2px solid #DEE2E6;
          border-radius: 12px;
          font-size: 2rem;
          font-weight: 700;
          color: #212529;
          text-align: center;
          transition: all 0.2s ease;
          background: #F8F9FA;
        }

        .calorie-input:focus {
          outline: none;
          border-color: #FF6B6B;
          box-shadow: 0 0 0 4px rgba(255, 107, 107, 0.15);
          background: #FFFFFF;
        }

        .calorie-input-unit {
          position: absolute;
          right: 1.25rem;
          top: 50%;
          transform: translateY(-50%);
          font-size: 1.1rem;
          font-weight: 700;
          color: #ADB5BD;
        }

        .calorie-suggestions {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
          margin-top: 1.25rem;
        }

        .calorie-suggestion-btn {
          padding: 1rem;
          background: #F8F9FA;
          border: 2px solid #DEE2E6;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 600;
          color: #495057;
        }

        .calorie-suggestion-btn:hover {
          background: rgba(255, 107, 107, 0.1);
          border-color: #FF6B6B;
          color: #FF6B6B;
        }

        .calorie-info-box {
          background: linear-gradient(135deg, #FFF5F5 0%, #FFE3E3 100%);
          border-left: 4px solid #FF6B6B;
          padding: 1.25rem;
          border-radius: 10px;
          margin-bottom: 1.5rem;
        }

        .calorie-info-box p {
          color: #C92A2A;
          font-size: 0.9rem;
          margin: 0;
        }

        .calorie-modal-actions {
          display: flex;
          gap: 1rem;
        }

        .calorie-modal-btn {
          flex: 1;
          padding: 1.125rem;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .calorie-modal-btn-cancel {
          background: #F1F3F5;
          color: #6C757D;
          border: 2px solid #DEE2E6;
        }

        .calorie-modal-btn-cancel:hover {
          background: #E9ECEF;
        }

        .calorie-modal-btn-save {
          background: #FF6B6B;
          color: #FFFFFF;
        }

        .calorie-modal-btn-save:hover {
          background: #FA5252;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255, 107, 107, 0.35);
        }

        @media (max-width: 768px) {
          .dashboard-container {
            padding: 1rem;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .food-item {
            flex-wrap: wrap;
          }

          .calorie-suggestions {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>

      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-brand">
            <span className="header-logo">🎯</span>
            <div>
              <h1 className="header-title">NutriTrack</h1>
              <p className="header-subtitle">Tu panel nutricional</p>
            </div>
          </div>
          <button onClick={onLogout} className="btn-logout">
            <span>🚪</span>
            Cerrar Sesión
          </button>
        </div>
      </div>

      <div className="dashboard-container">
        <div className="calories-section">
          <div className="calories-header">
            <h2 className="calories-title">
              <span>🔥</span>
              Calorías del Día
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div className="calories-stats">
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

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">🔥 Calorías</div>
            <div className="stat-value">
              {stats.totalCalories}
              <span className="stat-unit">kcal</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">💪 Proteínas</div>
            <div className="stat-value">
              {stats.totalProtein}
              <span className="stat-unit">g</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">🍞 Carbohidratos</div>
            <div className="stat-value">
              {stats.totalCarbs}
              <span className="stat-unit">g</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">🥑 Grasas</div>
            <div className="stat-value">
              {stats.totalFat}
              <span className="stat-unit">g</span>
            </div>
          </div>
        </div>

        <div className="meals-section">
          <div className="section-header">
            <h2 className="section-title">
              <span>🍽️</span>
              Mis Comidas del Día
            </h2>
          </div>

          {Object.keys(meals).map(mealType => {
            const mealData = meals[mealType];
            const totals = calculateMealTotals(mealType);
            const info = mealInfo[mealType];
            const isExpanded = expandedMeals[mealType];

            return (
              <div key={mealType} className="meal-card">
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
                  <div className="meal-header-right">
                    <span className="meal-calories">
                      {totals.calories.toFixed(0)} kcal
                    </span>
                    <span className={`toggle-icon ${isExpanded ? 'rotated' : ''}`}>
                      ▼
                    </span>
                  </div>
                </div>

                <div className={`meal-content ${isExpanded ? 'expanded' : ''}`}>
                  <div className="meal-body">
                    {mealData.length === 0 ? (
                      <div className="empty-meal">
                        <div className="empty-icon">🍽️</div>
                        <p className="empty-text">No hay alimentos en {info.name.toLowerCase()}</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openAddFoodModal(mealType);
                          }}
                          className="btn-add-food"
                        >
                          <span>🔍</span>
                          Buscar alimento
                        </button>
                      </div>
                    ) : (
                      <>
                        {mealData.map(food => (
                          <div key={food.id} className="food-item">
                            <div className="food-name">{food.name || food.food_name}</div>
                            <div className="food-macro">
                              <span className="macro-label">Calorías</span>
                              <span className="macro-value">{food.calories}</span>
                            </div>
                            <div className="food-macro">
                              <span className="macro-label">Proteínas</span>
                              <span className="macro-value">{food.protein}g</span>
                            </div>
                            <div className="food-macro">
                              <span className="macro-label">Carbos</span>
                              <span className="macro-value">{food.carbohydrates}g</span>
                            </div>
                            <div className="food-macro">
                              <span className="macro-label">Grasas</span>
                              <span className="macro-value">{food.fat}g</span>
                            </div>
                            <button
                              onClick={() => handleDeleteFood(mealType, food.id)}
                              className="btn-delete-food"
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
                            className="btn-add-food"
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

      {showCalorieModal && (
        <div className="calorie-modal-overlay" onClick={() => setShowCalorieModal(false)}>
          <div className="calorie-modal" onClick={(e) => e.stopPropagation()}>
            <div className="calorie-modal-header">
              <div className="calorie-modal-icon">🎯</div>
              <h2>Establece tu objetivo diario</h2>
              <p>Define cuántas calorías quieres consumir al día</p>
            </div>
            
            <div className="calorie-modal-body">
              <div className="calorie-info-box">
                <p>
                  💡 <strong>Consejo:</strong> La cantidad recomendada varía según tu edad, 
                  peso, altura y nivel de actividad. Un adulto promedio necesita entre 
                  1,800 y 2,500 kcal/día.
                </p>
              </div>

              <div className="calorie-input-group">
                <label className="calorie-input-label">
                  Tu límite diario de calorías
                </label>
                <div className="calorie-input-wrapper">
                  <input
                    type="number"
                    className="calorie-input"
                    value={newCalorieLimit}
                    onChange={(e) => setNewCalorieLimit(e.target.value)}
                    placeholder="2000"
                    min="500"
                    max="10000"
                  />
                  <span className="calorie-input-unit">kcal</span>
                </div>

                <div className="calorie-suggestions">
                  <button className="calorie-suggestion-btn" onClick={() => setNewCalorieLimit('1500')}>1,500</button>
                  <button className="calorie-suggestion-btn" onClick={() => setNewCalorieLimit('2000')}>2,000</button>
                  <button className="calorie-suggestion-btn" onClick={() => setNewCalorieLimit('2500')}>2,500</button>
                  <button className="calorie-suggestion-btn" onClick={() => setNewCalorieLimit('1800')}>1,800</button>
                  <button className="calorie-suggestion-btn" onClick={() => setNewCalorieLimit('2200')}>2,200</button>
                  <button className="calorie-suggestion-btn" onClick={() => setNewCalorieLimit('3000')}>3,000</button>
                </div>
              </div>

              <div className="calorie-modal-actions">
                <button
                  className="calorie-modal-btn calorie-modal-btn-cancel"
                  onClick={() => setShowCalorieModal(false)}
                >
                  Cancelar
                </button>
                <button
                  className="calorie-modal-btn calorie-modal-btn-save"
                  onClick={handleSaveCalorieLimit}
                >
                  💾 Guardar objetivo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
