import React from "react";
import "./DatosPersonales.css";
import { UserRound } from "lucide-react";

function DatosPersonales({ datos, onChange }) {
  const handleInput = (e) => {
    onChange({ [e.target.name]: e.target.value });
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
            <label>Apellidos</label>
            <input
              type="text"
              name="apellidos"
              value={datos.apellidos}
              onChange={handleInput}
              placeholder="Ej. González Martínez"
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
              style={{ textTransform: "uppercase" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DatosPersonales;
