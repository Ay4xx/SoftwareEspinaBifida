import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Mail, Phone, MapPin, Calendar, Clock } from "lucide-react";
import "./detallepaciente.css";

function VisualizarInfo() {
  const { pacienteId } = useParams();
  const [paciente, setPaciente] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3001/api/pacientes/detalle/${pacienteId}`)
      .then((r) => r.json())
      .then((res) => setPaciente(res.data))
      .catch(console.error);
  }, [pacienteId]);

  if (!paciente) return <p>Cargando...</p>;

  const status = paciente.VIVE?.toUpperCase() === "SI" ? "Activo" : "Inactivo";

  const iniciales = paciente.NOMBRE
    ?.split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");

    const formatearFecha = (fechaISO) => {
      if (!fechaISO) return "Sin fecha";
      const fecha = new Date(fechaISO);
      return fecha.toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    };

  return (
    <div className="card-paciente">

      <div className="paciente-header">
        <div className="avatar">{iniciales}</div>
        <div>
          <h2>{paciente.NOMBRE}</h2>
        </div>
      </div>

      <div className="paciente-info">
        <p><Mail size={16}/> {paciente.EMAIL}</p>
        <p><Phone size={16}/> {paciente.EMERGENCIA_TELEFONO}</p>
        <p><MapPin size={16}/> {paciente.ESTADO_RESIDENCIA}</p>
        <p><Calendar size={16}/> Registro: {formatearFecha(paciente.FECHA_ALTA)}</p>
      </div>

      <div className="paciente-estado">
        <span>Estado</span>
        <span className={`badge ${status.toLowerCase()}`}>
          {status}
        </span>
      </div>

      <div className="paciente-vencimiento">
        <span>Fecha Vencimiento</span>
        <span className="fecha">
          <Clock size={16}/>  {formatearFecha(paciente.FECHA_FIN)}
        </span>
      </div>

      <button className="btn-credencial">Ver Credencial</button>

    </div>
  );
}

export default VisualizarInfo;