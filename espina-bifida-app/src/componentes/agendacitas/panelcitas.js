// components/AppointmentsPanel/AppointmentsPanel.jsx

import React from "react";
import "./panelcitas.css";
import {
  CircleCheck,
  CircleDashed,
  CircleX,
  CalendarCheck2,
  Trash2,
  Plus,
} from "lucide-react";

function PanelCitas({
  selectedDate,
  citas,
  onAddPatient,
  onDeleteAppointment,
  onStatusChange,
}) {
  // FORMATEAR FECHA
  const formattedDate = selectedDate.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // CONTADORES
  const atendidas = citas.filter(
    (c) => c.estatus_cita === "ATENDIDA"
  ).length;

  const confirmadas = citas.filter(
    (c) => c.estatus_cita === "CONFIRMADA"
  ).length;

  const pendientes = citas.filter(
    (c) => c.estatus_cita === "PENDIENTE"
  ).length;

  const canceladas = citas.filter(
    (c) => c.estatus_cita === "CANCELADA"
  ).length;

  return (
    <div className="appointments-panel">
      {/* HEADER */}
      <div className="appointments-header">
        <div>
          <h1>{formattedDate}</h1>
        </div>

        <span className="total-citas">
          {citas.length} citas en total
        </span>
      </div>

      {/* STATS */}
      <div className="stats-row">
        <div className="stat-item green">
          <CircleCheck size={20} />
          <span>{atendidas} Atendidas</span>
        </div>

        <div className="stat-item blue">
          <CalendarCheck2 size={20} />
          <span>{confirmadas} Confirmadas</span>
        </div>

        <div className="stat-item gray">
          <CircleDashed size={20} />
          <span>{pendientes} Pendientes</span>
        </div>

        <div className="stat-item red">
          <CircleX size={20} />
          <span>{canceladas} Canceladas</span>
        </div>
      </div>

      {/* BOTÓN */}
      <button className="add-btn" onClick={onAddPatient}>
        <Plus size={22} />
        Agregar Paciente
      </button>

      {/* LISTADO */}
      <div className="appointments-list">
        {citas.length === 0 ? (
          <div className="empty-state">
            No hay citas para este día
          </div>
        ) : (
          citas.map((cita) => {
            const initials = cita.nombre
              .split(" ")
              .map((n) => n[0])
              .join("");

            return (
              <div
                key={cita.id_cita}
                className={`appointment-card ${
                  cita.estatus_cita === "ATENDIDA"
                    ? "attended-card"
                    : ""
                }`}
              >
                {/* IZQUIERDA */}
                <div className="patient-info">
                  <div className="avatar">
                    {initials}
                  </div>

                  <div>
                    <h3>{cita.nombre}</h3>

                    <div className="patient-meta">
                      <span>{cita.telefono}</span>
                      <span>{cita.hora_cita}</span>
                    </div>
                  </div>
                </div>

                {/* DERECHA */}
                <div className="appointment-actions">
                  <select
                    value={cita.estatus_cita}
                    onChange={(e) =>
                      onStatusChange(
                        cita.id_cita,
                        e.target.value
                      )
                    }
                  >
                    <option value="PENDIENTE">
                      Pendiente
                    </option>

                    <option value="CONFIRMADA">
                      Confirmada
                    </option>

                    <option value="ATENDIDA">
                      Atendida
                    </option>

                    <option value="CANCELADA">
                      Cancelada
                    </option>
                  </select>

                  <button
                    className="delete-btn"
                    onClick={() =>
                      onDeleteAppointment(cita.id_cita)
                    }
                  >
                    <Trash2 size={24} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default PanelCitas;