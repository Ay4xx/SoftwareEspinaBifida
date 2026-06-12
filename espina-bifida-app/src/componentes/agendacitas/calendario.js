import React, { useEffect, useState } from "react";
import "./calendario.css";
import API_BASE from "../../config";

function Calendar({ selectedDate, setSelectedDate }) {
  const today = selectedDate || new Date();

  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  const [diasOcupados, setDiasOcupados] = useState({});

  useEffect(() => {
    if (selectedDate) {
      setMonth(selectedDate.getMonth());
      setYear(selectedDate.getFullYear());
    }
  }, [selectedDate]);

  // Obtener carga del mes
  useEffect(() => {
    async function cargarMes() {
      try {
        const response = await fetch(
          `${API_BASE}/api/citas/carga-mes?anio=${year}&mes=${month + 1}`
        );

        const data = await response.json();

        console.log("Carga mes:", data);

        const mapa = {};

        if (data.ok) {
          data.dias.forEach((d) => {
            mapa[d.dia] = d.total;
          });
        }

        setDiasOcupados(mapa);
      } catch (error) {
        console.error(
          "Error obteniendo carga del mes:",
          error
        );
      }
    }

    cargarMes();
  }, [month, year]);

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

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = [];

  // Espacios vacíos
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }

  // Días del mes
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const handleSelectDate = (day) => {
    const fechaSeleccionada = new Date(year, month, day);
    setSelectedDate(fechaSeleccionada);
  };

  return (
    <div className="calendar-card">
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

      <div className="weekdays">
        {weekDays.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="days-grid">
        {calendarDays.map((day, index) => {
          const isSelected =
            day &&
            selectedDate.getDate() === day &&
            selectedDate.getMonth() === month &&
            selectedDate.getFullYear() === year;

          const totalCitas = day
            ? diasOcupados[day] || 0
            : 0;

          let claseCarga = "";

          if (totalCitas >= 8) {
            claseCarga = "busy-high";
          } else if (totalCitas >= 4) {
            claseCarga = "busy-medium";
          } else if (totalCitas > 0) {
            claseCarga = "busy-low";
          }

          return (
            <button
              key={index}
              className={`day-btn ${claseCarga} ${
                isSelected ? "active-day" : ""
              } ${!day ? "empty-day" : ""}`}
              disabled={!day}
              onClick={() => handleSelectDate(day)}
              title={`${totalCitas} cita(s)`}
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