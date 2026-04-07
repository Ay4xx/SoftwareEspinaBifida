import React, { useState } from "react";
import "./equipomedico.css";
import { Paperclip } from "lucide-react";

function EquipoMedico() {
  const [equipos, setEquipos] = useState([
    { id: 1, nombre: "Silla de ruedas infantil", cantidad: "1 pieza" },
    { id: 2, nombre: "Oxímetro de pulso", cantidad: "1 pieza" },
  ]);

  const agregar = () => {
    const nuevo = { id: Date.now(), nombre: "Nuevo equipo", cantidad: "1 caja" };
    setEquipos([...equipos, nuevo]);
  };

  const eliminar = (id) => {
    setEquipos(equipos.filter((e) => e.id !== id));
  };

  return (
    <div className="equipo-wrapper">
    <div className="equipo-card">
      <div className="equipo-header">
        <h3 className="equipo-title">
          <Paperclip size={18} /> Prestamo de Equipo Médico
        </h3>
        <button className="equipo-agregar" onClick={agregar}>+ Agregar</button>
      </div>

      <div className="equipo-table-header">
        <span>Equipo Médico</span>
        <span>Cant.</span>
      </div>

      {equipos.map((e) => (
        <div key={e.id} className="equipo-row">
          <span className="equipo-nombre">{e.nombre}</span>
          <span className="equipo-cantidad">{e.cantidad}</span>
          <button className="equipo-delete" onClick={() => eliminar(e.id)}>✕</button>
        </div>
      ))}

      <div className="equipo-footer">
        <button className="equipo-cancelar">Cancelar</button>
        <button className="equipo-guardar">
           Guardar Consulta
        </button>
      </div>
    </div>
    </div>
  );
}

export default EquipoMedico;