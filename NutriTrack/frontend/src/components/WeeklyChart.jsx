import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';

const WeeklyChart = ({ weeklyData = [] }) => {
  // Si no hay datos, generar datos de ejemplo para mostrar el diseño
  const hasRealData = weeklyData && weeklyData.length > 0;
  
  // Datos de demostración si no hay datos reales
  const demoData = [
    { date: 'Lun', calories: 0, goal: 2000, dayLabel: 'Lunes' },
    { date: 'Mar', calories: 0, goal: 2000, dayLabel: 'Martes' },
    { date: 'Mié', calories: 0, goal: 2000, dayLabel: 'Miércoles' },
    { date: 'Jue', calories: 0, goal: 2000, dayLabel: 'Jueves' },
    { date: 'Vie', calories: 0, goal: 2000, dayLabel: 'Viernes' },
    { date: 'Sáb', calories: 0, goal: 2000, dayLabel: 'Sábado' },
    { date: 'Dom', calories: 0, goal: 2000, dayLabel: 'Domingo' }
  ];

  const data = hasRealData ? weeklyData : demoData;
  const isEmpty = !hasRealData || data.every(d => d.calories === 0);

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
            {data.dayLabel || data.date}
          </p>
          <div style={{ fontSize: '13px' }}>
            <p style={{ margin: '4px 0', color: '#3b82f6' }}>
              <strong>Consumidas:</strong> {Math.round(data.calories)} kcal
            </p>
            <p style={{ margin: '4px 0', color: '#6b7280' }}>
              <strong>Objetivo:</strong> {data.goal} kcal
            </p>
            {data.calories > 0 && (
              <p style={{ 
                margin: '6px 0 0 0', 
                color: data.calories > data.goal ? '#ef4444' : '#10b981',
                fontWeight: '600'
              }}>
                {data.calories > data.goal 
                  ? `+${Math.round(data.calories - data.goal)} kcal` 
                  : `${Math.round(data.goal - data.calories)} kcal restantes`}
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  if (isEmpty) {
    return (
      <div style={{ 
        height: '300px',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px',
        border: '2px dashed #bae6fd'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
        <p style={{ 
          color: '#0369a1', 
          textAlign: 'center',
          fontSize: '16px',
          fontWeight: '600',
          marginBottom: '8px'
        }}>
          Evolución Semanal
        </p>
        <p style={{ 
          color: '#0284c7', 
          textAlign: 'center',
          fontSize: '14px',
          maxWidth: '300px'
        }}>
          Comienza a registrar tus comidas para ver la evolución de tus calorías durante la semana
        </p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '300px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorGoal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6b7280" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#6b7280" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            stroke="#6b7280"
            tick={{ fill: '#6b7280', fontSize: 12 }}
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
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="top" 
            height={36}
            iconType="line"
            formatter={(value) => (
              <span style={{ color: '#374151', fontSize: '13px', fontWeight: '500' }}>
                {value}
              </span>
            )}
          />
          
          {/* Línea del objetivo (gris punteada) */}
          <Area
            type="monotone"
            dataKey="goal"
            stroke="#9ca3af"
            strokeWidth={2}
            strokeDasharray="5 5"
            fill="url(#colorGoal)"
            name="Objetivo"
            animationBegin={0}
            animationDuration={1000}
          />
          
          {/* Línea de calorías consumidas (azul sólida) */}
          <Area
            type="monotone"
            dataKey="calories"
            stroke="#3b82f6"
            strokeWidth={3}
            fill="url(#colorCalories)"
            name="Consumidas"
            animationBegin={200}
            animationDuration={1000}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyChart;
