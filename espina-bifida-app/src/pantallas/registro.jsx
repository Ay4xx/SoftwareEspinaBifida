import React, { useState } from "react";
import "./registro.css";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import DatosPersonales from "../componentes/registro/DatosPersonales/DatosPersonales";
import Contacto from "../componentes/registro/Contacto/Contacto";
import HistorialMedico from "../componentes/registro/HistorialMedico/HistorialMedico";
import HistorialTutor from "../componentes/registro/HistorialTutor/HistorialTutor";
import Fotografia from "../componentes/registro/Fotografia/Fotografia";
import { crearPacientePaso1, actualizarPaso2, actualizarPaso3, actualizarPaso4, actualizarPaso5 } from "../services/registroService";

const TOTAL_PASOS = 5;

function RegistroPage() {
  const [paso, setPaso] = useState(1);
  const [guardado, setGuardado] = useState(false);
  const [errorPaso, setErrorPaso] = useState(null);
  const [formData, setFormData] = useState({
    nombres: "",
    apellidoPaterno: "",

    genero: "",
    fechaNacimiento: "",
    curp: "",
    direccion: "",
    ciudad: "",
    codigoPostal: "",
    estado: "",
    telefonoCasa: "",
    telefonoCelular: "",
    correo: "",
    emergenciaContacto: "",
    emergenciaTelefono: "",
    lugarNacimiento: "",
    hospitalNacimiento: "",
    tipoSangre: "",
    usaValvula: "",
    tipoEspinaBifida: "",
    otrosPadecimiento: "",
    notas: "",
    tutorNombre: "",
    tutorEdad: "",
    tutorLugarNacimiento: "",
    tutorOcupacion: "",
    tutorEscolaridad: "",
    tutorSeguroMedico: "",
    tutorParentesco: "",
    cdEmbarazo: "",
    citasControl: "",
    madreSeguroMedico: "",
    acidoFolico: "",
    foto: null,
  });

  const handleChange = (nuevosDatos) => {
    setFormData((prev) => ({ ...prev, ...nuevosDatos }));
    if (nuevosDatos.curp !== undefined) setErrorPaso(null);
  };

  const validarPaso = () => {
    if (paso === 1) {
      const curp = formData.curp;
      if (!curp) return "La CURP es obligatoria para continuar.";
      const ESTADOS = ["AS","BC","BS","CC","CL","CM","CS","CH","DF","DG","GT","GR","HG","JC","MC","MN","MS","NT","NL","OC","PL","QT","QR","SP","SL","SR","TC","TS","TL","VZ","YN","ZS","NE"];
      const regex = new RegExp(`^[A-Z][AEIOU][A-Z]{2}\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])[HMX](${ESTADOS.join("|")})[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z]\\d$`);
      if (!regex.test(curp)) return "La CURP ingresada no tiene un formato válido. Verifica e intenta de nuevo.";
    }
    return null;
  };

  const siguientePaso = () => {
    const error = validarPaso();
    if (error) { setErrorPaso(error); return; }
    setErrorPaso(null);
    if (paso < TOTAL_PASOS) setPaso(paso + 1);
  };

  const pasoAnterior = () => {
    if (paso > 1) setPaso(paso - 1);
  };

  const handleSubmit = async () => {
    try {
      const resultado = await crearPacientePaso1(formData);
      const id = resultado.data.pacienteId;

      await actualizarPaso2(id, formData);
      await actualizarPaso3(id, formData);
      await actualizarPaso4(id, formData);

      if (formData.foto) {
        await actualizarPaso5(id, formData.foto);
      }

      setGuardado(true);
      setTimeout(() => {
        setGuardado(false);
        setPaso(1);
        setFormData({
          nombres: "",
          apellidoPaterno: "",
          apellidoMaterno: "",
          nombrePadreMadre: "",
          genero: "",
          fechaNacimiento: "",
          curp: "",
          direccion: "",
          ciudad: "",
          codigoPostal: "",
          estado: "",
          telefonoCasa: "",
          telefonoCelular: "",
          correo: "",
          emergenciaContacto: "",
          emergenciaTelefono: "",
          ciudadNacimiento: "",
          estadoNacimiento: "",
          hospitalNacimiento: "",
          tipoSangre: "",
          usaValvula: "",
          tipoEspinaBifida: "",
          otrosPadecimiento: "",
          notas: "",
          tutorNombre: "",
          tutorEdad: "",
          tutorLugarNacimiento: "",
          tutorOcupacion: "",
          tutorEscolaridad: "",
          tutorSeguroMedico: "",
          tutorParentesco: "",
          cdEmbarazo: "",
          citasControl: "",
          madreSeguroMedico: "",
          acidoFolico: "",
          foto: null,
        });
      }, 2000);
    } catch (error) {
      setErrorPaso("Error al guardar el registro. Intenta de nuevo.");
    }
  };

  const porcentaje = paso * 20;

  const renderPaso = () => {
    switch (paso) {
      case 1:
        return <DatosPersonales datos={formData} onChange={handleChange} />;
      case 2:
        return <Contacto datos={formData} onChange={handleChange} />;
      case 3:
        return <HistorialMedico datos={formData} onChange={handleChange} />;
      case 4:
        return <HistorialTutor datos={formData} onChange={handleChange} />;
      case 5:
        return <Fotografia datos={formData} onChange={handleChange} />;
      default:
        return null;
    }
  };

  if (guardado) {
    return (
      <div className="registro-wrapper">
        <div className="registro-exito">
          <div className="registro-exito-icono">
            <Check size={40} color="white" />
          </div>
          <h2>¡Registro guardado exitosamente!</h2>
          <p>Redirigiendo al registro de usuarios</p>
        </div>
      </div>
    );
  }

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

        {/* Error de validación del paso */}
        {errorPaso && (
          <p className="registro-error-paso">{errorPaso}</p>
        )}

        {/* Botones de navegación */}
        <div className="registro-nav-contenedor">
          {paso > 1 && (
            <button className="registro-btn-nav btn-regresar" onClick={pasoAnterior}>
              <ArrowLeft size={22} />
            </button>
          )}
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
    </div>
  );
}

export default RegistroPage;
