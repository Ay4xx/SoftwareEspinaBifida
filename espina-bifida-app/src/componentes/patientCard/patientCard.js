import React from "react";
import { MapPin, Calendar, Plus, IdCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./patientCard.css";

function PatientCard({ patient }) {
  const navigate = useNavigate();
  const formatDate = (dateString) => {
    if (!dateString) return "Sin registro";

    const date = new Date(dateString);
    return date.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="user-info">
          <div className="avatar-circle">{patient.initials}</div>

          <div>
            <h3>{patient.name}</h3>
            <p>{patient.subtitle}</p>
          </div>
        </div>

        <span
          className={`status ${
            patient.status === "Activo" ? "active" : "inactive"
          }`}
        >
          {patient.status}
        </span>
      </div>

      <div className="card-body">
        <div className="info">
          <MapPin size={16} />
          <span>{patient.location}</span>
        </div>

        <div className="info">
          <Calendar size={16} />
          <span>{formatDate(patient.ultimaVisita)}</span>
        </div>
      </div>

      <div className="card-extra">
        <span className="etapa-vida">{patient.etapaVida}</span>
      </div>

      <div className="card-footer">
        <button className="btn-secondary" onClick={() => navigate(`/historial/${patient.id}`)}>
          Historial</button>
        <button className="btn-secondary" onClick={() => navigate(`/credencial/${patient.id}`)}>
          <IdCard size={14} />
          Ver Credencial
        </button>
        <button className="btn-primary" onClick={() => navigate(`/inventario/${patient.id}`)}>
          <Plus size={14} />
          Agregar
        </button>
      </div>
    </div>
  );
}

export default PatientCard;