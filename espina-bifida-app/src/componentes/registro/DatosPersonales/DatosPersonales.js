import React, { useState } from "react";
import "./DatosPersonales.css";
import { UserRound } from "lucide-react";

const ESTADOS_CURP = [
  "AS","BC","BS","CC","CL","CM","CS","CH","DF","DG",
  "GT","GR","HG","JC","MC","MN","MS","NT","NL","OC",
  "PL","QT","QR","SP","SL","SR","TC","TS","TL","VZ",
  "YN","ZS","NE"
];

const REGEX_CURP = new RegExp(
  `^[A-Z][AEIOU][A-Z]{2}` +
  `\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])` +
  `[HMX]` +
  `(${ESTADOS_CURP.join("|")})` +
  `[B-DF-HJ-NP-TV-Z]{3}` +
  `[0-9A-Z]\\d$`
);

function validarCURP(curp) {
  if (!curp) return null;
  if (curp.length !== 18) return "La CURP debe tener exactamente 18 caracteres.";
  if (!REGEX_CURP.test(curp)) return "El formato de la CURP no es válido.";
  return null;
}

function DatosPersonales({ datos, onChange }) {
  const [errorCURP, setErrorCURP] = useState(null);

  const handleInput = (e) => {
    const { name, value } = e.target;
    if (name === "curp") {
      const upper = value.toUpperCase();
      setErrorCURP(validarCURP(upper));
      onChange({ curp: upper });
      return;
    }
    onChange({ [name]: value });
  };

  const seleccionarGenero = (valor) => {
    onChange({ genero: valor });
  };

  return (
    <div className="dp-seccion">
      <div className="dp-seccion-header">
        <div className="dp-icono">
          <UserRound size={18} color="white" />
        </div>
        <span className="dp-seccion-titulo">Datos Personales</span>
      </div>
      <hr className="dp-divisor" />

      <div className="dp-formulario">
        <div className="dp-fila">
          <div className="dp-campo">
            <label>Nombre(s)</label>
            <input
              type="text"
              name="nombres"
              value={datos.nombres}
              onChange={handleInput}
              placeholder="Ej. María Elena"
            />
          </div>
          <div className="dp-campo">
            <label>Apellido(s)</label>
            <input
              type="text"
              name="apellidoPaterno"
              value={datos.apellidoPaterno}
              onChange={handleInput}
              placeholder="Ej. González"
            />
          </div>
        </div> 


        <div className="dp-campo-full">
          <label>Género</label>
          <div className="dp-genero-opciones">
            {[
              { valor: "masculino", label: "Masculino", simbolo: "♂" },
              { valor: "femenino", label: "Femenino", simbolo: "♀" },
              { valor: "otro", label: "Otro", simbolo: "⚧" },
            ].map((opcion) => (
              <button
                key={opcion.valor}
                type="button"
                className={`dp-genero-btn ${datos.genero === opcion.valor ? "activo" : ""}`}
                onClick={() => seleccionarGenero(opcion.valor)}
              >
                <span className="dp-genero-simbolo">{opcion.simbolo}</span>
                {opcion.label}
              </button>
            ))}
          </div>
        </div>

        <div className="dp-fila">
          <div className="dp-campo">
            <label>Fecha de Nacimiento</label>
            <input
              type="date"
              name="fechaNacimiento"
              value={datos.fechaNacimiento}
              onChange={handleInput}
            />
          </div>
          <div className="dp-campo">
            <label>
              CURP{" "}
              <span className="dp-info-icon" title="Clave Única de Registro de Población">
                ⓘ
              </span>
            </label>
            <input
              type="text"
              name="curp"
              value={datos.curp}
              onChange={handleInput}
              placeholder="Ej. GOML901012MNLLRR09"
              maxLength={18}
              className={errorCURP ? "dp-input-error" : datos.curp && datos.curp.length === 18 ? "dp-input-valido" : ""}
            />
            {errorCURP && <span className="dp-error-msg">{errorCURP}</span>}
            {!errorCURP && datos.curp && datos.curp.length === 18 && (
              <span className="dp-valido-msg">CURP con formato válido.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DatosPersonales;
