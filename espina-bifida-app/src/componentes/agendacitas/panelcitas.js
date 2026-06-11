import React, { useState } from "react";
import "./panelcitas.css";
import placeholederPic from "../../assets/placeholder.png";
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
  const [filterStatus, setFilterStatus] = useState("");

  const toggleFilter = (status) => {
    setFilterStatus((current) =>
      current === status ? "" : status
    );
  };

  const filteredCitas = filterStatus
    ? citas.filter((c) => c.estatus_cita === filterStatus)
    : citas;

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

  // FORMATEAR TELÉFONO (protege contra null/undefined/vacío)
  // El número se guarda sin lada (10 dígitos), se agrega +52 de México
  const formatTelefono = (tel) => {
    if (!tel) return "Sin teléfono";
    const t = String(tel);
    return "+52 " + t.slice(0, 3) + " " + t.slice(3, 6) + " " + t.slice(6, 10);
  };

  return (
    <div className="appointments-panel">
      <div className="overlay">
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
          <div
            className={`stat-item green ${filterStatus === "ATENDIDA" ? "active" : ""}`}
            onClick={() => toggleFilter("ATENDIDA")}
            role="button"
          >
            <CircleCheck size={20} />
            <span>{atendidas} Atendidas</span>
          </div>

          <div
            className={`stat-item blue ${filterStatus === "CONFIRMADA" ? "active" : ""}`}
            onClick={() => toggleFilter("CONFIRMADA")}
            role="button"
          >
            <CalendarCheck2 size={20} />
            <span>{confirmadas} Confirmadas</span>
          </div>

          <div
            className={`stat-item gray ${filterStatus === "PENDIENTE" ? "active" : ""}`}
            onClick={() => toggleFilter("PENDIENTE")}
            role="button"
          >
            <CircleDashed size={20} />
            <span>{pendientes} Pendientes</span>
          </div>

          <div
            className={`stat-item red ${filterStatus === "CANCELADA" ? "active" : ""}`}
            onClick={() => toggleFilter("CANCELADA")}
            role="button"
          >
            <CircleX size={20} />
            <span>{canceladas} Canceladas</span>
          </div>
        </div>

        {/* BOTÓN */}
        <button className="add-btn" onClick={onAddPatient}>
          <Plus size={22} />
          Agregar Cita
        </button>
      </div>

      {/* LISTADO */}
      <div className="appointments-list">
        {filteredCitas.length === 0 ? (
          <div className="empty-state">
            No hay citas para este día
          </div>
        ) : (
          filteredCitas.map((cita) => {
            const initials = (cita.nombre ?? "")
              .split(" ")
              .map((n) => n[0])
              .join("");

            return (
              <div
                key={cita.id_cita}
                className={`appointment-card ${
                  cita.estatus_cita === "ATENDIDA"
                    ? "attended-card"
                    : cita.estatus_cita === "CANCELADA"
                    ? "cancelada-card"
                    : cita.estatus_cita === "CONFIRMADA"
                    ? "confirmada-card"
                    : "pendiente-card"
                }`}
              >
                {/* IZQUIERDA */}
                <div className="patient-info">
                          <div className="avatar">
                    <img
                      src={
                        cita.foto
                          ? cita.foto.startsWith("http")
                            ? cita.foto
                            : `http://localhost:3001${cita.foto}`
                          : cita.id_paciente
                          ? `http://localhost:3001/api/pacientes/${cita.id_paciente}/foto`
                          : placeholederPic
                      }
                      alt={`${cita.nombre} ${cita.apellido}`}
                      onError={(e) => {
                        e.currentTarget.src = placeholederPic;
                      }}
                    />
                  </div>

                  <div className="patient-details">
                    <h3>{(cita.nombre ?? "") + " " + (cita.apellido ?? "")}</h3>

                    <div className="patient-meta">
                      <span>{cita.motivo}</span>
                      <span>{cita.hora_cita}</span>
                      <span>{formatTelefono(cita.telefono)}</span>
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