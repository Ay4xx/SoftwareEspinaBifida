import React from "react";
import "./HistorialMedico.css";
import { ClipboardList } from "lucide-react";

const TIPOS_SANGRE = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const TIPOS_ESPINA_BIFIDA = [
  {
    valor: "oculta",
    titulo: "Oculta",
    descripcion: "Forma más leve, sin síntomas visibles",
  },
  {
    valor: "meningocele",
    titulo: "Meningocele",
    descripcion: "Saco de líquido visible en la espalda",
  },
  {
    valor: "mielomeningocele",
    titulo: "Mielomeningocele",
    descripcion: "Forma más severa con afectación neurológica",
  },
  {
    valor: "lipomeningocele",
    titulo: "Lipomeningocele",
    descripcion: "Contiene tejido graso en el saco espinal",
  },
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
        <div className="hm-campo-full">
          <label>Lugar de Nacimiento</label>
          <input
            type="text"
            name="lugarNacimiento"
            value={datos.lugarNacimiento}
            onChange={handleInput}
            placeholder="Ciudad y estado donde nació el paciente"
          />
        </div>

        <div className="hm-campo-full">
          <label>Tipo de Sangre</label>
          <div className="hm-sangre-grid">
            {TIPOS_SANGRE.map((tipo) => (
              <button
                key={tipo}
                type="button"
                className={`hm-sangre-btn ${datos.tipoSangre === tipo ? "activo" : ""}`}
                onClick={() => onChange({ tipoSangre: tipo })}
              >
                {tipo}
              </button>
            ))}
          </div>
        </div>

        <div className="hm-campo-full">
          <label>Tipo de Espina Bífida</label>
          <div className="hm-espina-grid">
            {TIPOS_ESPINA_BIFIDA.map((opcion) => (
              <button
                key={opcion.valor}
                type="button"
                className={`hm-espina-btn ${datos.tipoEspinaBifida === opcion.valor ? "activo" : ""}`}
                onClick={() => onChange({ tipoEspinaBifida: opcion.valor })}
              >
                <span className="hm-espina-radio">
                  <span className={`hm-espina-radio-inner ${datos.tipoEspinaBifida === opcion.valor ? "activo" : ""}`} />
                </span>
                <div className="hm-espina-texto">
                  <span className="hm-espina-nombre">{opcion.titulo}</span>
                  <span className="hm-espina-desc">{opcion.descripcion}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HistorialMedico;
