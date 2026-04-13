import React from "react";
import "./HistorialTutor.css";
import { Users, HeartPulse } from "lucide-react";

const ESCOLARIDAD = [
  "Sin escolaridad",
  "Primaria",
  "Secundaria",
  "Preparatoria / Bachillerato",
  "Técnico / Vocacional",
  "Licenciatura",
  "Posgrado",
];

const PARENTESCO = [
  { valor: "MAD", label: "Madre" },
  { valor: "PAD", label: "Padre" },
  { valor: "ABU", label: "Abuelo/a" },
  { valor: "TUT", label: "Tutor Legal" },
  { valor: "OTR", label: "Otro" },
];

function HistorialTutor({ datos, onChange }) {
  const handleInput = (e) => {
    onChange({ [e.target.name]: e.target.value });
  };

  return (
    <div className="ht-wrapper">

      {/* SECCIÓN TUTOR */}
      <div className="ht-seccion">
        <div className="ht-seccion-header">
          <div className="ht-icono">
            <Users size={18} color="white" />
          </div>
          <span className="ht-seccion-titulo">Datos del Tutor</span>
        </div>
        <hr className="ht-divisor" />

        <div className="ht-formulario">
          <div className="ht-fila">
            <div className="ht-campo">
              <label>Nombre del Tutor</label>
              <input
                type="text"
                name="tutorNombre"
                value={datos.tutorNombre}
                onChange={handleInput}
                placeholder="Nombre completo"
              />
            </div>
            <div className="ht-campo">
              <label>Edad</label>
              <input
                type="number"
                name="tutorEdad"
                value={datos.tutorEdad}
                onChange={handleInput}
                placeholder="Ej. 35"
                min={1}
                max={120}
              />
            </div>
          </div>

          <div className="ht-fila">
            <div className="ht-campo">
              <label>Lugar de Nacimiento</label>
              <input
                type="text"
                name="tutorLugarNacimiento"
                value={datos.tutorLugarNacimiento}
                onChange={handleInput}
                placeholder="Ciudad, Estado"
              />
            </div>
            <div className="ht-campo">
              <label>Ocupación</label>
              <input
                type="text"
                name="tutorOcupacion"
                value={datos.tutorOcupacion}
                onChange={handleInput}
                placeholder="Ej. Enfermera, Contador..."
              />
            </div>
          </div>

          <div className="ht-fila">
            <div className="ht-campo">
              <label>Escolaridad</label>
              <select name="tutorEscolaridad" value={datos.tutorEscolaridad} onChange={handleInput}>
                <option value="">Seleccionar...</option>
                {ESCOLARIDAD.map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>
            <div className="ht-campo">
              <label>Seguro Médico</label>
              <input
                type="text"
                name="tutorSeguroMedico"
                value={datos.tutorSeguroMedico}
                onChange={handleInput}
                placeholder="Ej. IMSS, ISSSTE, Privado..."
              />
            </div>
          </div>

          <div className="ht-campo-full">
            <label>Parentesco</label>
            <div className="ht-parentesco-opciones">
              {PARENTESCO.map((p) => (
                <button
                  key={p.valor}
                  type="button"
                  className={`ht-parentesco-btn ${datos.tutorParentesco === p.valor ? "activo" : ""}`}
                  onClick={() => onChange({ tutorParentesco: datos.tutorParentesco === p.valor ? "" : p.valor })}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN MADRE */}
      <div className="ht-seccion ht-seccion-madre">
        <div className="ht-seccion-header">
          <div className="ht-icono">
            <HeartPulse size={18} color="white" />
          </div>
          <span className="ht-seccion-titulo">Historial de la Madre</span>
        </div>
        <hr className="ht-divisor" />

        <p className="ht-mensaje-info">Esta información ayuda a entender el contexto prenatal del paciente.</p>

        <div className="ht-formulario">
          <div className="ht-campo-full">
            <label>Condiciones del Embarazo</label>
            <textarea
              name="cdEmbarazo"
              value={datos.cdEmbarazo}
              onChange={handleInput}
              placeholder="Describa las condiciones del embarazo..."
              rows={3}
              className="ht-textarea"
            />
          </div>

          <div className="ht-fila">
            <div className="ht-campo">
              <label>Citas de Control (durante embarazo)</label>
              <input
                type="text"
                name="citasControl"
                value={datos.citasControl}
                onChange={handleInput}
                placeholder="Ej. 8 citas, irregular..."
              />
            </div>
            <div className="ht-campo">
              <label>Seguro Médico</label>
              <input
                type="text"
                name="madreSeguroMedico"
                value={datos.madreSeguroMedico}
                onChange={handleInput}
                placeholder="Ej. IMSS, ISSSTE, Privado..."
              />
            </div>
          </div>

          <div className="ht-campo-full">
            <label>¿Tomó Ácido Fólico durante el embarazo?</label>
            <div className="ht-toggle-opciones">
              {["Sí", "No"].map((opcion) => (
                <button
                  key={opcion}
                  type="button"
                  className={`ht-toggle-btn ${datos.acidoFolico === opcion ? "activo" : ""}`}
                  onClick={() => onChange({ acidoFolico: datos.acidoFolico === opcion ? "" : opcion })}
                >
                  {opcion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default HistorialTutor;
