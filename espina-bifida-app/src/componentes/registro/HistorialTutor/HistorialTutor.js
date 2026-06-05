import React from "react";
import "./HistorialTutor.css";
import { Users, HeartPulse, ClipboardList } from "lucide-react";

const ESCOLARIDAD = [
  "Sin escolaridad",
  "Primaria",
  "Secundaria",
  "Preparatoria / Bachillerato",
  "Técnico / Vocacional",
  "Licenciatura",
  "Posgrado",
];

function ToggleSiNo({ valor, nombre, onChange }) {
  return (
    <div className="ht-toggle-opciones">
      {["Sí", "No"].map((opcion) => (
        <button
          key={opcion}
          type="button"
          className={`ht-toggle-btn ${valor === opcion ? "activo" : ""}`}
          onClick={() => onChange({ [nombre]: valor === opcion ? "" : opcion })}
        >
          {opcion}
        </button>
      ))}
    </div>
  );
}

function HistorialTutor({ datos, onChange, onAgregarTutor }) {
  const handleInput = (e) => {
    onChange({ [e.target.name]: e.target.value });
  };

  const parentesco = datos.tutorParentesco || "";
  const esMadre = parentesco === "Madre";
  const esPadre = parentesco === "Padre";
  const mostrarResto = esMadre || esPadre;

  const handleParentesco = (valor) => {
    onChange({
      tutorParentesco: valor,
      tutorNombre: "",
      tutorEdad: "",
      tutorLugarNacimiento: "",
      tutorOcupacion: "",
      tutorEscolaridad: "",
      tutorSeguroMedico: "",
      cdEmbarazo: "",
      citasControl: "",
      madreSeguroMedico: "",
      acidoFolico: "",
      adicciones: "",
      hijoDtn: "",
      familiarDtn: "",
      expoToxicos: "",
      descripcionExpoToxicos: "",
    });
  };

  return (
    <div className="ht-wrapper">

      {/* ── DATOS DEL TUTOR ── */}
      <div className="ht-seccion">
        <div className="ht-seccion-header">
          <div className="ht-icono">
            <Users size={18} color="white" />
          </div>
          <span className="ht-seccion-titulo">Datos del Tutor</span>
        </div>
        <hr className="ht-divisor" />

        <div className="ht-formulario">
          {mostrarResto && (
            <>
              <div className="ht-fila">
                <div className="ht-campo">
                  <label>Nombre completo</label>
                  <input
                    type="text"
                    name="tutorNombre"
                    value={datos.tutorNombre || ""}
                    onChange={handleInput}
                    placeholder="Nombre completo"
                  />
                </div>
                <div className="ht-campo">
                  <label>Edad</label>
                  <input
                    type="number"
                    name="tutorEdad"
                    value={datos.tutorEdad || ""}
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
                    value={datos.tutorLugarNacimiento || ""}
                    onChange={handleInput}
                    placeholder="Ciudad, Estado"
                  />
                </div>
                <div className="ht-campo">
                  <label>Ocupación</label>
                  <input
                    type="text"
                    name="tutorOcupacion"
                    value={datos.tutorOcupacion || ""}
                    onChange={handleInput}
                    placeholder="Ej. Enfermera, Contador..."
                  />
                </div>
              </div>

              <div className="ht-fila">
                <div className="ht-campo">
                  <label>Escolaridad</label>
                  <select
                    name="tutorEscolaridad"
                    value={datos.tutorEscolaridad || ""}
                    onChange={handleInput}
                  >
                    <option value="">Seleccionar...</option>
                    {ESCOLARIDAD.map((e) => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                </div>
                {esPadre && (
                  <div className="ht-campo">
                    <label>Seguro Médico</label>
                    <input
                      type="text"
                      name="tutorSeguroMedico"
                      value={datos.tutorSeguroMedico || ""}
                      onChange={handleInput}
                      placeholder="Ej. IMSS, ISSSTE, Privado..."
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── HISTORIAL DE LA MADRE (exclusivo) ── */}
      {esMadre && (
        <div className="ht-seccion ht-seccion-madre">
          <div className="ht-seccion-header">
            <div className="ht-icono ht-icono-madre">
              <HeartPulse size={18} color="white" />
            </div>
            <span className="ht-seccion-titulo ht-titulo-madre">Historial de la Madre</span>
          </div>
          <hr className="ht-divisor" />

          <p className="ht-mensaje-info">
            Esta información ayuda a entender el contexto prenatal del paciente.
          </p>

          <div className="ht-formulario">
            <div className="ht-campo-full">
              <label>Condiciones del Embarazo</label>
              <textarea
                name="cdEmbarazo"
                value={datos.cdEmbarazo || ""}
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
                  type="number"
                  name="citasControl"
                  value={datos.citasControl || ""}
                  onChange={handleInput
                  }
                  placeholder="Ej. 8"
                  min={0}
                />
              </div>
              <div className="ht-campo">
                <label>Seguro Médico</label>
                <input
                  type="text"
                  name="madreSeguroMedico"
                  value={datos.madreSeguroMedico || ""}
                  onChange={handleInput}
                  placeholder="Ej. IMSS, ISSSTE, Privado..."
                />
              </div>
            </div>

            <div className="ht-campo-full">
              <label>¿Tomó Ácido Fólico durante el embarazo?</label>
              <ToggleSiNo
                valor={datos.acidoFolico || ""}
                nombre="acidoFolico"
                onChange={onChange}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── HISTORIAL FAMILIAR (Madre y Padre) ── */}
      {mostrarResto && (
        <div className="ht-seccion ht-seccion-ambos">
          <div className="ht-seccion-header">
            <div className="ht-icono ht-icono-ambos">
              <ClipboardList size={18} color="white" />
            </div>
            <span className="ht-seccion-titulo ht-titulo-ambos">Historial Familiar</span>
          </div>
          <hr className="ht-divisor" />

          <p className="ht-mensaje-info ht-mensaje-ambos">
            Información del historial personal y familiar de{" "}
            <strong>{esMadre ? "la madre" : "el padre"}</strong>.
          </p>

          <div className="ht-formulario">

            <div className="ht-campo-full">
              <label>Adicciones</label>
              <textarea
                name="adicciones"
                value={datos.adicciones || ""}
                onChange={handleInput}
                placeholder="Describa si tiene o tuvo alguna adicción (tabaco, alcohol, drogas, etc.)..."
                rows={3}
                className="ht-textarea"
              />
            </div>

            <div className="ht-campo-full">
              <label>¿Tiene otro hijo con Defecto del Tubo Neural (DTN)?</label>
              <ToggleSiNo
                valor={datos.hijoDtn || ""}
                nombre="hijoDtn"
                onChange={onChange}
              />
            </div>

            <div className="ht-campo-full">
              <label>¿Tiene algún familiar con DTN?</label>
              <ToggleSiNo
                valor={datos.familiarDtn || ""}
                nombre="familiarDtn"
                onChange={onChange}
              />
            </div>

            <div className="ht-campo-full">
              <label>¿Hubo exposición a sustancias tóxicas durante el embarazo?</label>
              <ToggleSiNo
                valor={datos.expoToxicos || ""}
                nombre="expoToxicos"
                onChange={onChange}
              />
            </div>

            {datos.expoToxicos === "Sí" && (
              <div className="ht-campo-full ht-fade-in">
                <label>Descripción de la exposición</label>
                <textarea
                  name="descripcionExpoToxicos"
                  value={datos.descripcionExpoToxicos || ""}
                  onChange={handleInput}
                  placeholder="Tipo de sustancia, duración, circunstancias..."
                  rows={3}
                  className="ht-textarea"
                />
              </div>
            )}

          </div>
        </div>
      )}

      {/* ── BOTÓN AGREGAR SEGUNDO TUTOR ── */}
      {mostrarResto && onAgregarTutor && (
        <div className="agregar-tutor-contenedor">
          <button
            type="button"
            className="btn-agregar-tutor"
            onClick={onAgregarTutor}
          >
            + Agregar {esMadre ? "Padre" : "Madre"}
          </button>
        </div>
      )}

    </div>
  );
}

export default HistorialTutor;