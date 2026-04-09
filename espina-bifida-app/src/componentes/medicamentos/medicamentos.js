import React, { useState } from "react";
import "./medicamentos.css";
import { Paperclip } from "lucide-react";

const PRECIO_UNITARIO = {
  "Ácido fólico 5mg": 85,
  "Vitamina B12": 120,
};

function Medicamentos() {
  const [medicamentos, setMedicamentos] = useState([
    { id: 1, nombre: "Ácido fólico 5mg", cantidad: 1 },
    { id: 2, nombre: "Vitamina B12", cantidad: 1 },
  ]);

  const agregar = () => {
    setMedicamentos([...medicamentos, { id: Date.now(), nombre: "Nuevo medicamento", cantidad: 1 }]);
  };

  const eliminar = (id) => {
    setMedicamentos(medicamentos.filter((m) => m.id !== id));
  };

  const cambiarCantidad = (id, valor) => {
    const cantidad = Math.max(1, parseInt(valor) || 1);
    setMedicamentos(medicamentos.map((m) => m.id === id ? { ...m, cantidad } : m));
  };

  const getPrecio = (nombre, cantidad) => {
    const precio = PRECIO_UNITARIO[nombre] || 0;
    return `$${(precio * cantidad).toFixed(2)}`;
  };

  return (
    <div className="med-wrapper">
      <div className="med-card">
        <div className="med-header">
          <h3 className="med-title">
            <Paperclip size={18} /> Medicamentos Recetados
          </h3>
          <button className="med-agregar" onClick={agregar}>+ Agregar</button>
        </div>

        <div className="med-table-header">
          <span className="col-nombre">Medicamento</span>
          <span className="col-cantidad">Cantidad</span>
          <span className="col-precio">Precio</span>
          <span className="col-delete"></span>
        </div>

        {medicamentos.map((m) => (
          <div key={m.id} className="med-row">
            <span className="col-nombre med-nombre">{m.nombre}</span>
            <input
              type="number"
              className="col-cantidad med-input"
              value={m.cantidad}
              min={1}
              onChange={(e) => cambiarCantidad(m.id, e.target.value)}
            />
            <span className="col-precio med-precio">{getPrecio(m.nombre, m.cantidad)}</span>
            <button className="col-delete med-delete" onClick={() => eliminar(m.id)}>✕</button>
          </div>
        ))}

        <div className="med-total">
          <span>Total</span>
          <span>
            ${medicamentos.reduce((acc, m) => {
              const precio = PRECIO_UNITARIO[m.nombre] || 0;
              return acc + precio * m.cantidad;
            }, 0).toFixed(2)}
          </span>
        </div>

        <div className="med-footer">
          <button className="med-cancelar">Cancelar</button>
          <button className="med-guardar">💾 Guardar Consulta</button>
        </div>
      </div>
    </div>
  );
}

export default Medicamentos;