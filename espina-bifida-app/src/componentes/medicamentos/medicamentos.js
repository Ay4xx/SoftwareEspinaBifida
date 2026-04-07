import React, { useState } from "react";
import "./medicamentos.css";
import { Paperclip } from "lucide-react";

function Medicamentos() {
  const [medicamentos, setMedicamentos] = useState([
    { id: 1, nombre: "Ácido fólico 5mg" },
    { id: 2, nombre: "Vitamina B12" },
  ]);

  const agregar = () => {
    const nuevo = { id: Date.now(), nombre: "Nuevo medicamento" };
    setMedicamentos([...medicamentos, nuevo]);
  };

  const eliminar = (id) => {
    setMedicamentos(medicamentos.filter((m) => m.id !== id));
  };

  return (
    <div className="med-card">
      <div className="med-header">
        <h3 className="med-title">
          <Paperclip size={18} /> Medicamentos Recetados
        </h3>
        <button className="med-agregar" onClick={agregar}>+ Agregar</button>
      </div>

      <div className="med-table-header">
        <span>Medicamento</span>
      </div>

      {medicamentos.map((m) => (
        <div key={m.id} className="med-row">
          <span className="med-nombre">{m.nombre}</span>
          <button className="med-delete" onClick={() => eliminar(m.id)}>✕</button>
        </div>
      ))}

      <div className="med-footer">
        <button className="med-cancelar">Cancelar</button>
        <button className="med-guardar">
          💾 Guardar Consulta
        </button>
      </div>
    </div>
  );
}

export default Medicamentos;