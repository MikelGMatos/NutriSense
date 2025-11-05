import { useState, useEffect } from 'react';
import { authService, diaryService } from '../services/api';
import AddFoodModal from './AddFoodModal';

function Dashboard({ user, onLogout }) {
  const [diary, setDiary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('');
  
  // Obtener fecha de hoy en formato YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  // Cargar diario al montar el componente
  useEffect(() => {
    loadDiary();
  }, []);

  const loadDiary = async () => {
    try {
      setLoading(true);
      const data = await diaryService.getDiary(today);
      setDiary(data);
    } catch (error) {
      console.error('Error cargando diario:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFood = async (foodData) => {
    try {
      await diaryService.addEntry(today, foodData);
      await loadDiary(); // Recargar diario
    } catch (error) {
      console.error('Error añadiendo comida:', error);
      throw error;
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (!confirm('¿Eliminar esta comida?')) return;

    try {
      await diaryService.deleteEntry(entryId);
      await loadDiary(); // Recargar diario
    } catch (error) {
      console.error('Error eliminando entrada:', error);
      alert('Error al eliminar');
    }
  };

  const openModal = (mealType) => {
    setSelectedMealType(mealType);
    setModalOpen(true);
  };

  // Agrupar entradas por tipo de comida
  const groupedEntries = {
    desayuno: diary?.entries?.filter(e => e.meal_type === 'desayuno') || [],
    almuerzo: diary?.entries?.filter(e => e.meal_type === 'almuerzo') || [],
    cena: diary?.entries?.filter(e => e.meal_type === 'cena') || [],
    snack: diary?.entries?.filter(e => e.meal_type === 'snack') || [],
  };

  const totals = diary?.totals || { calories: 0, protein: 0, carbs: 0, fat: 0 };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">NutriSense</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Hola, {user?.name || user?.email}</span>
              <button
                onClick={onLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-xl text-gray-600">Cargando...</div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Resumen de hoy - {new Date().toLocaleDateString('es-ES')}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Calorías */}
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Calorías
                  </h3>
                  <p className="text-3xl font-bold text-blue-600">
                    {Math.round(totals.calories)}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">kcal</p>
                </div>

                {/* Proteínas */}
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">
                    Proteínas
                  </h3>
                  <p className="text-3xl font-bold text-green-600">
                    {Math.round(totals.protein)}g
                  </p>
                  <p className="text-sm text-gray-600 mt-2">gramos</p>
                </div>

                {/* Carbohidratos */}
                <div className="bg-yellow-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                    Carbohidratos
                  </h3>
                  <p className="text-3xl font-bold text-yellow-600">
                    {Math.round(totals.carbs)}g
                  </p>
                  <p className="text-sm text-gray-600 mt-2">gramos</p>
                </div>

                {/* Grasas */}
                <div className="bg-orange-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-orange-900 mb-2">
                    Grasas
                  </h3>
                  <p className="text-3xl font-bold text-orange-600">
                    {Math.round(totals.fat)}g
                  </p>
                  <p className="text-sm text-gray-600 mt-2">gramos</p>
                </div>
              </div>
            </div>

            {/* Comidas del día */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Comidas de hoy
              </h3>
              
              <div className="space-y-4">
                {/* Desayuno */}
                <MealSection
                  title="Desayuno"
                  entries={groupedEntries.desayuno}
                  onAdd={() => openModal('desayuno')}
                  onDelete={handleDeleteEntry}
                />

                {/* Almuerzo */}
                <MealSection
                  title="Almuerzo"
                  entries={groupedEntries.almuerzo}
                  onAdd={() => openModal('almuerzo')}
                  onDelete={handleDeleteEntry}
                />

                {/* Cena */}
                <MealSection
                  title="Cena"
                  entries={groupedEntries.cena}
                  onAdd={() => openModal('cena')}
                  onDelete={handleDeleteEntry}
                />

                {/* Snacks */}
                <MealSection
                  title="Snacks"
                  entries={groupedEntries.snack}
                  onAdd={() => openModal('snack')}
                  onDelete={handleDeleteEntry}
                />
              </div>
            </div>
          </>
        )}
      </main>

      {/* Modal para añadir comida */}
      <AddFoodModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAddFood}
        mealType={selectedMealType}
      />
    </div>
  );
}

// Componente para cada sección de comida
function MealSection({ title, entries, onAdd, onDelete }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-semibold text-gray-800 text-lg">{title}</h4>
        <button
          onClick={onAdd}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
        >
          + Añadir
        </button>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-gray-500">Sin registros</p>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
            >
              <div>
                <p className="font-medium text-gray-800">{entry.food_name}</p>
                <p className="text-sm text-gray-600">
                  {Math.round(entry.calories)} kcal | P: {Math.round(entry.protein)}g | 
                  C: {Math.round(entry.carbs)}g | G: {Math.round(entry.fat)}g
                </p>
              </div>
              <button
                onClick={() => onDelete(entry.id)}
                className="text-red-500 hover:text-red-700 font-bold text-xl"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;