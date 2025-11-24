import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const MacrosChart = ({ protein = 0, carbs = 0, fats = 0 }) => {
  // Convertir gramos a calorías para porcentajes reales
  // Proteínas: 4 kcal/g, Carbos: 4 kcal/g, Grasas: 9 kcal/g
  const proteinCals = protein * 4;
  const carbsCals = carbs * 4;
  const fatsCals = fats * 9;
  const totalCals = proteinCals + carbsCals + fatsCals;

  // Si no hay datos, mostrar mensaje
  if (totalCals === 0) {
    return (
      <div className="macros-chart-container">
        <div className="macros-chart-empty">
          <p style={{ color: '#666', textAlign: 'center' }}>
            Añade alimentos para ver la distribución de macros
          </p>
        </div>
      </div>
    );
  }

  const data = [
    { 
      name: 'Proteínas', 
      value: parseFloat(protein.toFixed(1)),
      calories: proteinCals,
      percentage: ((proteinCals / totalCals) * 100).toFixed(1),
      color: '#3b82f6' 
    },
    { 
      name: 'Carbohidratos', 
      value: parseFloat(carbs.toFixed(1)),
      calories: carbsCals,
      percentage: ((carbsCals / totalCals) * 100).toFixed(1),
      color: '#f59e0b' 
    },
    { 
      name: 'Grasas', 
      value: parseFloat(fats.toFixed(1)),
      calories: fatsCals,
      percentage: ((fatsCals / totalCals) * 100).toFixed(1),
      color: '#10b981' 
    }
  ];

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
            color: data.color,
            fontSize: '14px'
          }}>
            {data.name}
          </p>
          <p style={{ fontSize: '13px', color: '#374151', margin: '4px 0' }}>
            <strong>{data.value}g</strong>
          </p>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0' }}>
            {data.calories.toFixed(0)} kcal ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percentage < 5) return null; // No mostrar porcentajes muy pequeños

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        style={{ 
          fontWeight: '600', 
          fontSize: '14px',
          textShadow: '0 1px 3px rgba(0,0,0,0.3)'
        }}
      >
        {`${percentage}%`}
      </text>
    );
  };

  return (
    <div style={{ width: '100%', height: '300px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(props) => <CustomLabel {...props} percentage={props.percentage} />}
            outerRadius={90}
            fill="#8884d8"
            dataKey="value"
            animationBegin={0}
            animationDuration={800}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry) => (
              <span style={{ color: '#374151', fontSize: '13px' }}>
                {value}: <strong>{entry.payload.value}g</strong>
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MacrosChart;
