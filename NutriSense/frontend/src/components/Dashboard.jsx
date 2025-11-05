import { useState, useEffect } from 'react';
import { authService } from '../services/api';

function Dashboard({ user, onLogout }) {
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
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Dashboard
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Calorías */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Calorías de hoy
              </h3>
              <p className="text-3xl font-bold text-blue-600">0 / 2000</p>
              <p className="text-sm text-gray-600 mt-2">kcal restantes</p>
            </div>

            {/* Proteínas */}
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Proteínas
              </h3>
              <p className="text-3xl font-bold text-green-600">0g</p>
              <p className="text-sm text-gray-600 mt-2">de 150g</p>
            </div>

            {/* Agua */}
            <div className="bg-cyan-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-cyan-900 mb-2">
                Hidratación
              </h3>
              <p className="text-3xl font-bold text-cyan-600">0L</p>
              <p className="text-sm text-gray-600 mt-2">de 2L</p>
            </div>
          </div>

          {/* Comidas del día */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Comidas de hoy
            </h3>
            <div className="space-y-3">
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-gray-800">Desayuno</h4>
                    <p className="text-sm text-gray-500">Sin registros</p>
                  </div>
                  <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                    + Añadir
                  </button>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-gray-800">Almuerzo</h4>
                    <p className="text-sm text-gray-500">Sin registros</p>
                  </div>
                  <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                    + Añadir
                  </button>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-gray-800">Cena</h4>
                    <p className="text-sm text-gray-500">Sin registros</p>
                  </div>
                  <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                    + Añadir
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;