import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

const MealBreakdownChart = ({ meals }) => {
  const mealInfo = {
    desayuno: { name: 'Desayuno', icon: '🌅', color: '#3b82f6' },
    almuerzo: { name: 'Almuerzo', icon: '🥪', color: '#8b5cf6' },
    comida: { name: 'Comida', icon: '🍽️', color: '#f59e0b' },
    merienda: { name: 'Merienda', icon: '🎃', color: '#ec4899' },
    cena: { name: 'Cena', icon: '🌙', color: '#10b981' }
  };

  // Calcular totales por comida
  const data = Object.keys(meals).map(mealType => {
    const mealFoods = meals[mealType] || [];
    const totals = mealFoods.reduce((acc, food) => ({
      calories: acc.calories + (food.calories || 0),
      protein: acc.protein + (food.protein || 0),
      carbs: acc.carbs + (food.carbohydrates || 0),
      fat: acc.fat + (food.fat || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    return {
      name: mealInfo[mealType]?.name || mealType,
      icon: mealInfo[mealType]?.icon || '',
      calories: Math.round(totals.calories),
      protein: parseFloat(totals.protein.toFixed(1)),
      carbs: parseFloat(totals.carbs.toFixed(1)),
      fat: parseFloat(totals.fat.toFixed(1)),
      color: mealInfo[mealType]?.color || '#6b7280'
    };
  });

  // Verificar si hay datos
  const hasData = data.some(meal => meal.calories > 0);

  if (!hasData) {
    return (
      <div style={{ 
        height: '300px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <p style={{ color: '#666', textAlign: 'center' }}>
          Añade alimentos a tus comidas para ver el desglose
        </p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          background: 'rgba(255, 255, 255, 0.98)',
          padding: '12px 16px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <p style={{ 
            fontWeight: '600', 
            marginBottom: '8px',
            fontSize: '14px',
            color: '#111'
          }}>
            {data.icon} {data.name}
          </p>
          <div style={{ fontSize: '13px', color: '#374151' }}>
            <p style={{ margin: '4px 0' }}>
              <strong style={{ color: '#ef4444' }}>Calorías:</strong> {data.calories} kcal
            </p>
            <p style={{ margin: '4px 0' }}>
              <strong style={{ color: '#3b82f6' }}>Proteínas:</strong> {data.protein}g
            </p>
            <p style={{ margin: '4px 0' }}>
              <strong style={{ color: '#f59e0b' }}>Carbohidratos:</strong> {data.carbs}g
            </p>
            <p style={{ margin: '4px 0' }}>
              <strong style={{ color: '#10b981' }}>Grasas:</strong> {data.fat}g
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomXAxisTick = ({ x, y, payload }) => {
    const mealData = data.find(d => d.name === payload.value);
    return (
      <g transform={`translate(${x},${y})`}>
        <text 
          x={0} 
          y={0} 
          dy={16} 
          textAnchor="middle" 
          fill="#374151"
          fontSize="20px"
        >
          {mealData?.icon}
        </text>
        <text 
          x={0} 
          y={0} 
          dy={34} 
          textAnchor="middle" 
          fill="#6b7280"
          fontSize="12px"
        >
          {payload.value}
        </text>
      </g>
    );
  };

  return (
    <div style={{ width: '100%', height: '300px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="name" 
            tick={<CustomXAxisTick />}
            height={60}
          />
          <YAxis 
            stroke="#6b7280"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            label={{ 
              value: 'Calorías (kcal)', 
              angle: -90, 
              position: 'insideLeft',
              style: { fill: '#374151', fontSize: 12 }
            }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
          <Bar 
            dataKey="calories" 
            radius={[8, 8, 0, 0]}
            animationBegin={0}
            animationDuration={800}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MealBreakdownChart;
