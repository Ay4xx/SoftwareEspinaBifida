import React, { useEffect, useState } from "react";
import "./calendario.css";

function Calendar({ selectedDate, setSelectedDate }) {
  const today = selectedDate || new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  useEffect(() => {
    if (selectedDate) {
      setMonth(selectedDate.getMonth());
      setYear(selectedDate.getFullYear());
    }
  }, [selectedDate]);

  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const weekDays = ["D", "L", "M", "X", "J", "V", "S"];

  // Primer día del mes
  const firstDay = new Date(year, month, 1).getDay();

  // Días del mes
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Array para renderizar calendario
  const calendarDays = [];

  // Espacios vacíos antes del inicio del mes
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }

  // Agregar días
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const handleSelectDate = (day) => {
    const fechaSeleccionada = new Date(year, month, day);

    setSelectedDate(fechaSeleccionada);
  };

  return (
    <div className="calendar-card">
      {/* HEADER */}
      <div className="calendar-header">
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
        >
          {months.map((m, index) => (
            <option key={index} value={index}>
              {m}
            </option>
          ))}
        </select>

        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        >
          {[2025, 2026, 2027, 2028].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* DÍAS SEMANA */}
      <div className="weekdays">
        {weekDays.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      {/* GRID */}
      <div className="days-grid">
        {calendarDays.map((day, index) => {
          const isSelected =
            day &&
            selectedDate.getDate() === day &&
            selectedDate.getMonth() === month &&
            selectedDate.getFullYear() === year;

          return (
            <button
              key={index}
              className={`day-btn ${
                isSelected ? "active-day" : ""
              } ${!day ? "empty-day" : ""}`}
              disabled={!day}
              onClick={() => handleSelectDate(day)}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Calendar;