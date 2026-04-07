import React from "react";
import "./Contacto.css";
import { Phone } from "lucide-react";

const MUNICIPIOS = [
  "Monterrey",
  "San Nicolás de los Garza",
  "Guadalupe",
  "Apodaca",
  "San Pedro Garza García",
  "General Escobedo",
  "Santa Catarina",
  "Juárez",
  "García",
  "Linares",
  "Otro",
];

const ESTADOS = [
  "Nuevo León",
  "Aguascalientes",
  "Baja California",
  "Baja California Sur",
  "Campeche",
  "Chiapas",
  "Chihuahua",
  "Ciudad de México",
  "Coahuila",
  "Colima",
  "Durango",
  "Guanajuato",
  "Guerrero",
  "Hidalgo",
  "Jalisco",
  "Estado de México",
  "Michoacán",
  "Morelos",
  "Nayarit",
  "Oaxaca",
  "Puebla",
  "Querétaro",
  "Quintana Roo",
  "San Luis Potosí",
  "Sinaloa",
  "Sonora",
  "Tabasco",
  "Tamaulipas",
  "Tlaxcala",
  "Veracruz",
  "Yucatán",
  "Zacatecas",
];

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
            <label>Municipio</label>
            <select name="municipio" value={datos.municipio} onChange={handleInput}>
              <option value="">Seleccionar municipio...</option>
              {MUNICIPIOS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div className="ct-campo">
            <label>Colonia</label>
            <input
              type="text"
              name="colonia"
              value={datos.colonia}
              onChange={handleInput}
              placeholder="Ej. Centro, Del Valle..."
            />
          </div>
        </div>

        <div className="ct-fila">
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
          <div className="ct-campo">
            <label>Estado</label>
            <select name="estado" value={datos.estado} onChange={handleInput}>
              <option value="">Seleccionar estado...</option>
              {ESTADOS.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="ct-fila">
          <div className="ct-campo">
            <label>Teléfono</label>
            <input
              type="tel"
              name="telefono"
              value={datos.telefono}
              onChange={handleInput}
              placeholder="10 dígitos"
              maxLength={10}
            />
          </div>
          <div className="ct-campo">
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
      </div>
    </div>
  );
}

export default Contacto;
