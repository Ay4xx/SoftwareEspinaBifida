import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock
} from "lucide-react";
import "./detallepaciente.css";

function VisualizarInfo({ paciente }) {
  return (
    <div className="card-paciente">
      
      <div className="paciente-header">
        <div className="avatar">{paciente.iniciales}</div>
        <div>
          <h2>{paciente.nombre}</h2>
          <p>{paciente.curp}</p>
        </div>
      </div>

      <div className="paciente-info">
        <p><Mail size={16}/> {paciente.email}</p>
        <p><Phone size={16}/> {paciente.telefono}</p>
        <p><MapPin size={16}/> {paciente.ubicacion}</p>
        <p><Calendar size={16}/> Registro: {paciente.registro}</p>
      </div>

      <div className="paciente-estado">
        <span>Estado</span>
        <span className={`badge ${paciente.estado.toLowerCase()}`}>
          {paciente.estado}
        </span>
      </div>

      <div className="paciente-vencimiento">
        <span>Fecha Vencimiento</span>
        <span className="fecha">
          <Clock size={16}/> {paciente.vencimiento}
        </span>
      </div>

      <button className="btn-credencial">
        Ver Credencial
      </button>

    </div>
  );
}

export default VisualizarInfo;