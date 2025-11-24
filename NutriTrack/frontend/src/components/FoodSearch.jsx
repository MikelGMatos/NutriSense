import { useState, useEffect } from 'react';
import './FoodSearch.css';

const FoodSearch = ({ mealType, mealName, onAddFood, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedPortion, setSelectedPortion] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [customAmount, setCustomAmount] = useState(100);

  // Buscar alimentos mientras el usuario escribe
  useEffect(() => {
    const searchFoods = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `http://localhost:8000/api/foods/search?q=${encodeURIComponent(searchQuery)}&limit=10`
        );
        
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data);
        } else {
          console.error('Error al buscar alimentos');
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Error de conexión:', error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce: esperar 300ms después de que el usuario deje de escribir
    const timeoutId = setTimeout(searchFoods, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Calcular macros según la porción seleccionada
  const calculateMacros = () => {
    if (!selectedFood || !selectedPortion) return null;

    const multiplier = selectedPortion.multiplier;
    
    return {
      calories: Math.round(selectedFood.calories_per_100g * multiplier),
      protein: Math.round(selectedFood.protein_per_100g * multiplier * 10) / 10,
      carbohydrates: Math.round(selectedFood.carbs_per_100g * multiplier * 10) / 10, 
      fat: Math.round(selectedFood.fat_per_100g * multiplier * 10) / 10,
      portion: selectedPortion.name,
      amount: selectedPortion.weight_grams
    };
  };

  const handleSelectFood = (food) => {
    setSelectedFood(food);
    setSearchResults([]);
    setSearchQuery(food.name);
    
    // Pre-seleccionar la primera porción si existe
    if (food.portions && food.portions.length > 0) {
      setSelectedPortion(food.portions[0]);
    } else {
      // Crear porción por defecto de 100g
      setSelectedPortion({
        name: '100g',
        weight_grams: 100,
        multiplier: 1
      });
    }
  };

  const handleAddFood = () => {
    if (!selectedFood || !selectedPortion) return;

    const macros = calculateMacros();
    
    const foodToAdd = {
      name: selectedFood.name,
      category: selectedFood.category,
      brand: selectedFood.brand,
      ...macros
    };

    onAddFood(foodToAdd);
    handleClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedFood(null);
    setSelectedPortion(null);
    onClose();
  };

  const currentMacros = calculateMacros();

  return (
    <div className="food-search-overlay" onClick={handleClose}>
      <div className="food-search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="food-search-header">
          <h2>🔍 Buscar Alimento para {mealName}</h2>
          <button className="close-btn" onClick={handleClose}>✕</button>
        </div>

        <div className="food-search-content">
          {/* Buscador */}
          <div className="search-input-container">
            <input
              type="text"
              className="search-input"
              placeholder="Ej: pollo, arroz, manzana..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            {isLoading && <div className="search-loader">Buscando...</div>}
          </div>

          {/* Resultados de búsqueda */}
          {searchResults.length > 0 && !selectedFood && (
            <div className="search-results">
              {searchResults.map((food) => (
                <div
                  key={food.id}
                  className="search-result-item"
                  onClick={() => handleSelectFood(food)}
                >
                  <div className="result-main">
                    <div className="result-name">{food.name}</div>
                    {food.brand && <div className="result-brand">{food.brand}</div>}
                    <div className="result-category">{food.category}</div>
                  </div>
                  <div className="result-macros">
                    <span className="result-calories">{food.calories_per_100g} kcal</span>
                    <span className="result-macro">P: {food.protein_per_100g}g</span>
                    <span className="result-macro">C: {food.carbs_per_100g}g</span>
                    <span className="result-macro">G: {food.fat_per_100g}g</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Vista de selección de porción */}
          {selectedFood && (
            <div className="portion-selection">
              <div className="selected-food-info">
                <h3>{selectedFood.name}</h3>
                {selectedFood.brand && <p className="food-brand">{selectedFood.brand}</p>}
                <p className="food-category">{selectedFood.category}</p>
              </div>

              <div className="portion-selector">
                <label>Selecciona la porción:</label>
                <div className="portion-options">
                  {selectedFood.portions && selectedFood.portions.length > 0 ? (
                    selectedFood.portions.map((portion, index) => (
                      <button
                        key={index}
                        className={`portion-btn ${selectedPortion === portion ? 'active' : ''}`}
                        onClick={() => setSelectedPortion(portion)}
                      >
                        {portion.name}
                        <span className="portion-weight">({portion.weight_grams}g)</span>
                      </button>
                    ))
                  ) : (
                    <>
                      <button
                        className={`portion-btn ${selectedPortion?.name === '100g' ? 'active' : ''}`}
                        onClick={() => setSelectedPortion({ name: '100g', weight_grams: 100, multiplier: 1 })}
                      >
                        100g
                      </button>
                      <button
                        className={`portion-btn ${selectedPortion?.name === '150g' ? 'active' : ''}`}
                        onClick={() => setSelectedPortion({ name: '150g', weight_grams: 150, multiplier: 1.5 })}
                      >
                        150g
                      </button>
                      <button
                        className={`portion-btn ${selectedPortion?.name === '200g' ? 'active' : ''}`}
                        onClick={() => setSelectedPortion({ name: '200g', weight_grams: 200, multiplier: 2 })}
                      >
                        200g
                      </button>
                    </>
                  )}
                </div>

                {/* Cantidad personalizada */}
                <div className="custom-amount">
                  <label>O ingresa cantidad personalizada (gramos):</label>
                  <div className="custom-input-group">
                    <input
                      type="number"
                      min="1"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(Number(e.target.value))}
                      className="custom-amount-input"
                    />
                    <button
                      className="custom-apply-btn"
                      onClick={() => setSelectedPortion({
                        name: `${customAmount}g`,
                        weight_grams: customAmount,
                        multiplier: customAmount / 100
                      })}
                    >
                      Aplicar
                    </button>
                  </div>
                </div>
              </div>

              {/* Preview de macros */}
              {currentMacros && (
                <div className="macros-preview">
                  <h4>Información nutricional ({currentMacros.portion}):</h4>
                  <div className="macros-grid">
                    <div className="macro-item calories">
                      <span className="macro-icon">🔥</span>
                      <span className="macro-value">{currentMacros.calories}</span>
                      <span className="macro-label">kcal</span>
                    </div>
                    <div className="macro-item protein">
                      <span className="macro-icon">💪</span>
                      <span className="macro-value">{currentMacros.protein}g</span>
                      <span className="macro-label">Proteínas</span>
                    </div>
                    <div className="macro-item carbs">
                      <span className="macro-icon">🍞</span>
                      <span className="macro-value">{currentMacros.carbohydrates}g</span>
                      <span className="macro-label">Carbohidratos</span>
                    </div>
                    <div className="macro-item fat">
                      <span className="macro-icon">🥑</span>
                      <span className="macro-value">{currentMacros.fat}g</span>
                      <span className="macro-label">Grasas</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mensaje cuando no hay resultados */}
          {searchQuery.length >= 2 && searchResults.length === 0 && !isLoading && !selectedFood && (
            <div className="no-results">
              <p>No se encontraron alimentos que coincidan con "{searchQuery}"</p>
              <p className="no-results-hint">Intenta con otro término de búsqueda</p>
            </div>
          )}
        </div>

        <div className="food-search-footer">
          <button className="btn-cancel-search" onClick={handleClose}>
            Cancelar
          </button>
          <button
            className="btn-add-search"
            onClick={handleAddFood}
            disabled={!selectedFood || !selectedPortion}
          >
            ✨ Añadir a {mealName}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodSearch;
