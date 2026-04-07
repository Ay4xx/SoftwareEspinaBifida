import React, { useState } from "react";
import "./registro.css";
import { ArrowRight, Check } from "lucide-react";
import DatosPersonales from "../componentes/registro/DatosPersonales/DatosPersonales";
import Contacto from "../componentes/registro/Contacto/Contacto";
import HistorialMedico from "../componentes/registro/HistorialMedico/HistorialMedico";
import Fotografia from "../componentes/registro/Fotografia/Fotografia";

const TOTAL_PASOS = 4;

function RegistroPage() {
  const [paso, setPaso] = useState(1);
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    genero: "",
    fechaNacimiento: "",
    curp: "",
    municipio: "",
    colonia: "",
    codigoPostal: "",
    estado: "",
    telefono: "",
    correo: "",
    lugarNacimiento: "",
    tipoSangre: "",
    tipoEspinaBifida: "",
    foto: null,
  });

  const handleChange = (nuevosDatos) => {
    setFormData((prev) => ({ ...prev, ...nuevosDatos }));
  };

  const siguientePaso = () => {
    if (paso < TOTAL_PASOS) setPaso(paso + 1);
  };

  const handleSubmit = () => {
    console.log("Registro completado:", formData);
    // TODO: enviar al backend
  };

  const porcentaje = paso * 25;

  const renderPaso = () => {
    switch (paso) {
      case 1:
        return <DatosPersonales datos={formData} onChange={handleChange} />;
      case 2:
        return <Contacto datos={formData} onChange={handleChange} />;
      case 3:
        return <HistorialMedico datos={formData} onChange={handleChange} />;
      case 4:
        return <Fotografia datos={formData} onChange={handleChange} />;
      default:
        return null;
    }
  };

  return (
    <div className="registro-wrapper">
      <div className="registro-card">
        {/* Barra de progreso */}
        <div className="registro-progreso-barra">
          <div
            className="registro-progreso-relleno"
            style={{ width: `${porcentaje}%` }}
          />
        </div>

        {/* Info de paso */}
        <div className="registro-progreso-info">
          <span className="registro-paso-badge">
            Paso {paso} de {TOTAL_PASOS}
          </span>
          <span className="registro-porcentaje">{porcentaje} % completado</span>
        </div>

        {/* Encabezado */}
        <div className="registro-encabezado">
          <h1>Datos del Paciente</h1>
          <p>
            Complete la información del nuevo miembro en las secciones a
            continuación.
          </p>
        </div>

        {/* Contenido del paso actual */}
        {renderPaso()}

        {/* Botón de navegación */}
        <button
          className={`registro-btn-nav ${
            paso === TOTAL_PASOS ? "btn-finalizar" : "btn-siguiente"
          }`}
          onClick={paso === TOTAL_PASOS ? handleSubmit : siguientePaso}
        >
          {paso === TOTAL_PASOS ? <Check size={22} /> : <ArrowRight size={22} />}
        </button>
      </div>
    </div>
  );
}

export default RegistroPage;
