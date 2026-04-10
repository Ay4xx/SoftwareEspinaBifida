import React, { useState } from "react";
import "./equipomedico.css";
import { Paperclip } from "lucide-react";

const PRECIO_UNITARIO = {
  "Silla de ruedas infantil": 4500,
  "Oxímetro de pulso": 850,
};

function EquipoMedico() {
  const [equipos, setEquipos] = useState([
    { id: 1, nombre: "Silla de ruedas infantil", cantidad: 1 },
    { id: 2, nombre: "Oxímetro de pulso", cantidad: 1 },
  ]);

  const agregar = () => {
    setEquipos([...equipos, { id: Date.now(), nombre: "Nuevo equipo", cantidad: 1 }]);
  };

  const eliminar = (id) => {
    setEquipos(equipos.filter((e) => e.id !== id));
  };

  const cambiarCantidad = (id, valor) => {
    const cantidad = Math.max(1, parseInt(valor) || 1);
    setEquipos(equipos.map((e) => e.id === id ? { ...e, cantidad } : e));
  };

  const getPrecio = (nombre, cantidad) => {
    const precio = PRECIO_UNITARIO[nombre] || 0;
    return `$${(precio * cantidad).toFixed(2)}`;
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
          <span>Cantidad</span>
          <span>Precio</span>
          <span></span>
        </div>

        {equipos.map((e) => (
          <div key={e.id} className="equipo-row">
            <span className="equipo-nombre">{e.nombre}</span>
            <input
              type="number"
              className="equipo-input"
              value={e.cantidad}
              min={1}
              onChange={(ev) => cambiarCantidad(e.id, ev.target.value)}
            />
            <span className="equipo-precio">{getPrecio(e.nombre, e.cantidad)}</span>
            <button className="equipo-delete" onClick={() => eliminar(e.id)}>✕</button>
          </div>
        ))}

        <div className="equipo-total">
          <span>Total</span>
          <span>
            ${equipos.reduce((acc, e) => {
              const precio = PRECIO_UNITARIO[e.nombre] || 0;
              return acc + precio * e.cantidad;
            }, 0).toFixed(2)}
          </span>
        </div>

        <div className="equipo-footer">
          <button className="equipo-cancelar">Cancelar</button>
          <button className="equipo-guardar"> Guardar Consulta</button>
        </div>
      </div>
    </div>
  );
}

export default EquipoMedico;