import React from "react";
import "./Contacto.css";
import { Phone } from "lucide-react";
import { ESTADOS_MEXICO } from "../../../constantes/mexico";

function Contacto({ datos, onChange }) {
  const handleInput = (e) => {
    onChange({ [e.target.name]: e.target.value });
  };

  return (
    <div className="ct-seccion">
      <div className="ct-seccion-header">
        <div className="ct-icono">
          <Phone size={18} color="white" />
        </div>
        <span className="ct-seccion-titulo">Contacto</span>
      </div>
      <hr className="ct-divisor" />

      <div className="ct-formulario">
        <div className="ct-fila">
          <div className="ct-campo">
            <label>Dirección</label>
            <input
              type="text"
              name="direccion"
              value={datos.direccion}
              onChange={handleInput}
              placeholder="Calle y número"
            />
          </div>
          <div className="ct-campo">
            <label>Código Postal</label>
            <input
              type="text"
              name="codigoPostal"
              value={datos.codigoPostal}
              onChange={handleInput}
              placeholder="Ej. 64000"
              maxLength={5}
            />
          </div>
        </div>

        <div className="ct-fila">
          <div className="ct-campo">
            <label>Estado de Residencia</label>
            <select name="estado" value={datos.estado} onChange={handleInput}>
              <option value="">Seleccionar estado...</option>
              {ESTADOS_MEXICO.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>
          <div className="ct-campo">
            <label>Ciudad de Residencia</label>
            <input
              type="text"
              name="ciudad"
              value={datos.ciudad}
              onChange={handleInput}
              placeholder="Ej. Monterrey"
            />
          </div>
        </div>

        <div className="ct-fila">
          <div className="ct-campo">
            <label>Teléfono Casa</label>
            <input
              type="tel"
              name="telefonoCasa"
              value={datos.telefonoCasa}
              onChange={handleInput}
              placeholder="10 dígitos"
              maxLength={10}
            />
          </div>
          <div className="ct-campo">
            <label>Teléfono Celular</label>
            <input
              type="tel"
              name="telefonoCelular"
              value={datos.telefonoCelular}
              onChange={handleInput}
              placeholder="10 dígitos"
              maxLength={10}
            />
          </div>
        </div>

        <div className="ct-fila">
          <div className="ct-campo" style={{ gridColumn: "1 / -1" }}>
            <label>Correo Electrónico</label>
            <input
              type="email"
              name="correo"
              value={datos.correo}
              onChange={handleInput}
              placeholder="ejemplo@correo.com"
            />
          </div>
        </div>

        <div className="ct-subtitulo">En caso de emergencia</div>

        <div className="ct-fila">
          <div className="ct-campo">
            <label>Nombre del Contacto</label>
            <input
              type="text"
              name="emergenciaContacto"
              value={datos.emergenciaContacto}
              onChange={handleInput}
              placeholder="Nombre completo"
            />
          </div>
          <div className="ct-campo">
            <label>Teléfono de Emergencia</label>
            <input
              type="tel"
              name="emergenciaTelefono"
              value={datos.emergenciaTelefono}
              onChange={handleInput}
              placeholder="10 dígitos"
              maxLength={10}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contacto;
