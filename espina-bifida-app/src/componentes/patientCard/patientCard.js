import React from "react";
import "./patientCard.css";
import { MapPin, Activity } from "lucide-react";

function PatientCard({ patient }) {
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
          <Activity size={16} />
          <span>{patient.consultations} consultas</span>
        </div>
      </div>

      <div className="card-footer">
        <button className="btn-secondary">Historial</button>
        <button className="btn-primary">+ Agregar</button>
      </div>
    </div>
  );
}

export default PatientCard;