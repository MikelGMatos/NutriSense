import { useState } from 'react';
import './DateNavigator.css';

function DateNavigator({ selectedDate, onDateChange }) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));

  const formatDate = (date) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return { dayName, day, month, year };
  };

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isFutureDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
  };

  const { dayName, day, month, year } = formatDate(selectedDate);

  // Calendar logic
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const generateCalendarDays = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const handleDayClick = (day) => {
    if (day) {
      const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      if (!isFutureDate(newDate)) {
        onDateChange(newDate);
        setShowCalendar(false);
      }
    }
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(newMonth.getMonth() - 1);
      return newMonth;
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(newMonth.getMonth() + 1);
      return newMonth;
    });
  };

  const isSelectedDate = (day) => {
    if (!day) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date.toDateString() === selectedDate.toDateString();
  };

  const isTodayDate = (day) => {
    if (!day) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  return (
    <div className="date-navigator">
      <div className="date-controls">
        <button 
          className="nav-button prev-day" 
          onClick={goToPreviousDay}
          title="Día anterior"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <button 
          className="date-display" 
          onClick={() => setShowCalendar(!showCalendar)}
          title="Abrir calendario"
        >
          <div className="date-info">
            <span className="day-name">{dayName}</span>
            <div className="date-main">
              <span className="day-number">{day}</span>
              <div className="month-year">
                <span className="month-name">{month}</span>
                <span className="year-number">{year}</span>
              </div>
            </div>
          </div>
          <svg className="calendar-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
            <path d="M3 10H21" stroke="currentColor" strokeWidth="2"/>
            <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        <button 
          className="nav-button next-day" 
          onClick={goToNextDay}
          disabled={isFutureDate(new Date(selectedDate.getTime() + 86400000))}
          title="Día siguiente"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {!isToday(selectedDate) && (
          <button 
            className="today-button" 
            onClick={goToToday}
            title="Ir a hoy"
          >
            Hoy
          </button>
        )}
      </div>

      {showCalendar && (
        <>
          <div 
            className="calendar-overlay" 
            onClick={() => setShowCalendar(false)}
          />
          <div className="calendar-popup">
            <div className="calendar-header">
              <button 
                className="calendar-nav-btn" 
                onClick={goToPreviousMonth}
                title="Mes anterior"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <h3 className="calendar-title">
                {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              <button 
                className="calendar-nav-btn" 
                onClick={goToNextMonth}
                title="Mes siguiente"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <div className="calendar-weekdays">
              <div className="calendar-weekday">D</div>
              <div className="calendar-weekday">L</div>
              <div className="calendar-weekday">M</div>
              <div className="calendar-weekday">X</div>
              <div className="calendar-weekday">J</div>
              <div className="calendar-weekday">V</div>
              <div className="calendar-weekday">S</div>
            </div>

            <div className="calendar-days">
              {generateCalendarDays().map((day, index) => {
                const dayDate = day ? new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day) : null;
                const isFuture = dayDate && isFutureDate(dayDate);
                
                return (
                  <button
                    key={index}
                    className={`calendar-day ${!day ? 'empty' : ''} ${isSelectedDate(day) ? 'selected' : ''} ${isTodayDate(day) ? 'today' : ''} ${isFuture ? 'future' : ''}`}
                    onClick={() => handleDayClick(day)}
                    disabled={!day || isFuture}
                  >
                    {day || ''}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default DateNavigator;
