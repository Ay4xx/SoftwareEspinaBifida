import React from "react";
import "./HistorialMedico.css";
import { ClipboardList } from "lucide-react";

const TIPOS_SANGRE = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const PADECIMIENTOS = [
  "ENCEFALOCELE",
  "ESPINA BÍFIDA OCULTA",
  "HIDROCEFALIA CONGÉNITA",
  "LIPO-MIELOMENINGOCELE",
  "LIPOCELE",
  "MÉDULA ANCLADA",
  "MENINGOCELE",
  "MIELOMENINGOCELE",
  "OTROS",
];

function HistorialMedico({ datos, onChange }) {
  const handleInput = (e) => {
    onChange({ [e.target.name]: e.target.value });
  };

  return (
    <div className="hm-seccion">
      <div className="hm-seccion-header">
        <div className="hm-icono">
          <ClipboardList size={18} color="white" />
        </div>
        <span className="hm-seccion-titulo">Historial Médico</span>
      </div>
      <hr className="hm-divisor" />

      <div className="hm-formulario">

        {/* Nacimiento */}
        <div className="hm-fila">
          <div className="hm-campo">
            <label>Lugar de Nacimiento</label>
            <input
              type="text"
              name="lugarNacimiento"
              value={datos.lugarNacimiento}
              onChange={handleInput}
              placeholder="Ciudad y estado donde nació el paciente"
            />
          </div>
          <div className="hm-campo">
            <label>Hospital de Nacimiento</label>
            <input
              type="text"
              name="hospitalNacimiento"
              value={datos.hospitalNacimiento}
              onChange={handleInput}
              placeholder="Nombre del hospital"
            />
          </div>
        </div>

        {/* Tipo de Sangre */}
        <div className="hm-campo-full">
          <label>Tipo de Sangre</label>
          <div className="hm-sangre-grid">
            {TIPOS_SANGRE.map((tipo) => (
              <button
                key={tipo}
                type="button"
                className={`hm-sangre-btn ${datos.tipoSangre === tipo ? "activo" : ""}`}
                onClick={() => onChange({ tipoSangre: datos.tipoSangre === tipo ? "" : tipo })}
              >
                {tipo}
              </button>
            ))}
          </div>
        </div>

        {/* ¿Usa Válvula? */}
        <div className="hm-campo-full">
          <label>¿Usa Válvula?</label>
          <div className="hm-valvula-opciones">
            {["Sí", "No"].map((opcion) => (
              <button
                key={opcion}
                type="button"
                className={`hm-valvula-btn ${datos.usaValvula === opcion ? "activo" : ""}`}
                onClick={() => onChange({ usaValvula: datos.usaValvula === opcion ? "" : opcion })}
              >
                {opcion}
              </button>
            ))}
          </div>
        </div>

        {/* Padecimiento */}
        <div className="hm-campo-full">
          <label>Padecimiento (Tipo de Espina Bífida)</label>
          <div className="hm-padecimiento-grid">
            {PADECIMIENTOS.map((p) => (
              <button
                key={p}
                type="button"
                className={`hm-padecimiento-btn ${datos.tipoEspinaBifida === p ? "activo" : ""}`}
                onClick={() => onChange({ tipoEspinaBifida: datos.tipoEspinaBifida === p ? "" : p })}
              >
                <span className="hm-espina-radio">
                  <span className={`hm-espina-radio-inner ${datos.tipoEspinaBifida === p ? "activo" : ""}`} />
                </span>
                <span className="hm-padecimiento-nombre">{p}</span>
              </button>
            ))}
          </div>
          {datos.tipoEspinaBifida === "OTROS" && (
            <input
              type="text"
              name="otrosPadecimiento"
              value={datos.otrosPadecimiento}
              onChange={handleInput}
              placeholder="Especificar padecimiento..."
              className="hm-otros-input"
            />
          )}
        </div>

        {/* Notas */}
        <div className="hm-campo-full">
          <label>Notas o Comentarios</label>
          <textarea
            name="notas"
            value={datos.notas}
            onChange={handleInput}
            placeholder="Información adicional relevante..."
            rows={3}
            className="hm-textarea"
          />
        </div>

      </div>
    </div>
  );
}

export default HistorialMedico;
