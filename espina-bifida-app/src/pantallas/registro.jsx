import React, { useState, useEffect } from "react";
import "./registro.css";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import DatosPersonales from "../componentes/registro/DatosPersonales/DatosPersonales";
import Contacto from "../componentes/registro/Contacto/Contacto";
import HistorialMedico from "../componentes/registro/HistorialMedico/HistorialMedico";
import HistorialTutor from "../componentes/registro/HistorialTutor/HistorialTutor";
import Fotografia from "../componentes/registro/Fotografia/Fotografia";
import {
  crearPacientePaso1,
  actualizarPaso2,
  actualizarPaso3,
  actualizarPaso4,
  actualizarPaso5,
} from "../services/registroService";
import { useLocation, useNavigate } from "react-router-dom";

const TOTAL_PASOS = 5;
const API_URL = "http://localhost:3001/api/notificaciones";
const PACIENTES_URL = "http://localhost:3001/api/pacientes";

const formInicial = {
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
};

function RegistroPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const modoRevision = location.state?.modoRevision || false;
  const notificacionId = location.state?.notificacionId || null;

  const [paso, setPaso] = useState(1);
  const [guardado, setGuardado] = useState(false);
  const [errorPaso, setErrorPaso] = useState(null);
  const [notificacionEstado, setNotificacionEstado] = useState(null);
  const [accionRealizada, setAccionRealizada] = useState(null);
  const [pacienteId, setPacienteId] = useState(null);
  const [cambiosGuardados, setCambiosGuardados] = useState(false);
  const [formData, setFormData] = useState(formInicial);

  useEffect(() => {
    if (!modoRevision || !notificacionId) return;

    fetch(`${API_URL}/${notificacionId}`)
      .then((r) => r.json())
      .then((result) => {
        if (!result.ok) return;

        const p = result.data;
        setNotificacionEstado(p.ESTADO_PROCESO);
        setPacienteId(p.PACIENTE_ID);

        setFormData((prev) => ({
          ...prev,
          nombres: p.NOMBRE || "",
          apellidoPaterno: p.APELLIDO || "",
          curp: p.CURP || "",
          genero: p.GENERO || "",
          fechaNacimiento: p.FECHA_NACIMIENTO || "",
          direccion: p.DIRECCION || "",
          ciudad: p.CIUDAD_RESIDENCIA || "",
          estado: p.ESTADO_RESIDENCIA || "",
          codigoPostal: p.CODIGO_POSTAL || "",
          telefonoCasa: p.TELEFONO_CASA || "",
          telefonoCelular: p.TELEFONO_CELULAR || "",
          correo: p.EMAIL || "",
          emergenciaContacto: p.EMERGENCIA_CONTACTO || "",
          emergenciaTelefono: p.EMERGENCIA_TELEFONO || "",
          lugarNacimiento: p.LUGAR_NACIMIENTO || "",
          hospitalNacimiento: p.HOSPITAL_NACIMIENTO || "",
          tipoSangre: p.SANGRE_TIPO || "",
          usaValvula: p.VALVULA === "SI" ? "Sí" : p.VALVULA === "NO" ? "No" : "",
          notas: p.NOTAS_ADICIONALES || "",
          foto: p.FOTO_URL || p.FOTO || null,
        }));
      })
      .catch((err) => console.error("Error cargando notificación:", err));
  }, [notificacionId, modoRevision]);

  const handleChange = (nuevosDatos) => {
    setFormData((prev) => ({ ...prev, ...nuevosDatos }));
    if (nuevosDatos.curp !== undefined) setErrorPaso(null);
  };

  const handleGuardarCambios = async () => {
  try {
    const form = new FormData();

    form.append("nombre", formData.nombres || "");
    form.append("apellido", formData.apellidoPaterno || "");
    form.append("genero", formData.genero || "");
    form.append("fechaNacimiento", formData.fechaNacimiento || "");
    form.append("curp", formData.curp || "");
    form.append("direccion", formData.direccion || "");
    form.append("ciudad", formData.ciudad || "");
    form.append("estado", formData.estado || "");
    form.append("codigoPostal", formData.codigoPostal || "");
    form.append("telefonoCasa", formData.telefonoCasa || "");
    form.append("telefonoCelular", formData.telefonoCelular || "");
    form.append("correo", formData.correo || "");
    form.append("emergenciaContacto", formData.emergenciaContacto || "");
    form.append("emergenciaTelefono", formData.emergenciaTelefono || "");
    form.append("lugarNacimiento", formData.lugarNacimiento || "");
    form.append("hospitalNacimiento", formData.hospitalNacimiento || "");
    form.append("tipoSangre", formData.tipoSangre || "");
    form.append("usaValvula", formData.usaValvula || "");
    form.append("notas", formData.notas || "");

    if (formData.foto instanceof File) {
      form.append("foto", formData.foto);
    }

    const response = await fetch(`${PACIENTES_URL}/${pacienteId}`, {
      method: "PUT",
      body: form,
    });

    const result = await response.json();
    if (!result.ok) throw new Error(result.message);

    if (result.data?.fotoUrl) {
      setFormData((prev) => ({
        ...prev,
        foto: result.data.fotoUrl,
      }));
    }

    setCambiosGuardados(true);
    setTimeout(() => setCambiosGuardados(false), 3000);
  } catch (err) {
    alert(err.message || "Error al guardar cambios");
  }
};

  const validarPaso = () => {
    if (paso === 1) {
      const curp = formData.curp;
      if (!curp) return "La CURP es obligatoria para continuar.";

      const ESTADOS = [
        "AS", "BC", "BS", "CC", "CL", "CM", "CS", "CH",
        "DF", "DG", "GT", "GR", "HG", "JC", "MC", "MN",
        "MS", "NT", "NL", "OC", "PL", "QT", "QR", "SP",
        "SL", "SR", "TC", "TS", "TL", "VZ", "YN", "ZS", "NE"
      ];

      const regex = new RegExp(
        `^[A-Z][AEIOU][A-Z]{2}\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])[HMX](${ESTADOS.join("|")})[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z]\\d$`
      );

      if (!regex.test(curp)) {
        return "La CURP ingresada no tiene un formato válido. Verifica e intenta de nuevo.";
      }
    }

    return null;
  };

  const siguientePaso = () => {
    if (!modoRevision) {
      const error = validarPaso();
      if (error) {
        setErrorPaso(error);
        return;
      }
      setErrorPaso(null);
    }

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
        setFormData(formInicial);
      }, 2000);
    } catch (error) {
      setErrorPaso("Error al guardar el registro. Intenta de nuevo.");
    }
  };

  const handleAprobar = async () => {
    try {
      const response = await fetch(`${API_URL}/${notificacionId}/aprobar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const result = await response.json();
      if (!result.ok) throw new Error(result.message);

      setAccionRealizada("aprobado");
      setTimeout(() => navigate("/notificaciones"), 2000);
    } catch (err) {
      alert(err.message || "Error al aprobar");
    }
  };

  const handleRechazar = async () => {
    try {
      const response = await fetch(`${API_URL}/${notificacionId}/rechazar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const result = await response.json();
      if (!result.ok) throw new Error(result.message);

      setAccionRealizada("rechazado");
      setTimeout(() => navigate("/notificaciones"), 2000);
    } catch (err) {
      alert(err.message || "Error al rechazar");
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
        return (
          <Fotografia
            datos={formData}
            onChange={handleChange}
            onGuardar={
              modoRevision && notificacionEstado === "pendiente"
                ? handleGuardarCambios
                : null
            }
            cambiosGuardados={cambiosGuardados}
          />
        );
      default:
        return null;
    }
  };

  if (accionRealizada) {
    return (
      <div className="registro-wrapper">
        <div className="registro-exito">
          <div className="registro-exito-icono">
            <Check size={40} color="white" />
          </div>
          <h2>
            {accionRealizada === "aprobado"
              ? "¡Paciente aprobado exitosamente!"
              : "Registro rechazado correctamente"}
          </h2>
          <p>Regresando a notificaciones...</p>
        </div>
      </div>
    );
  }

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
        {modoRevision && (
          <button
            className="registro-btn-regresar-notificaciones"
            onClick={() => navigate("/notificaciones")}
          >
            <ArrowLeft size={16} /> Volver a notificaciones
          </button>
        )}

        <div className="registro-progreso-barra">
          <div
            className="registro-progreso-relleno"
            style={{ width: `${porcentaje}%` }}
          />
        </div>

        <div className="registro-progreso-info">
          <span className="registro-paso-badge">
            Paso {paso} de {TOTAL_PASOS}
          </span>
          <span className="registro-porcentaje">{porcentaje} % completado</span>
        </div>

        <div className="registro-encabezado">
          <h1>Datos del Paciente</h1>
          <p>
            {modoRevision
              ? "Revisa y edita la información del paciente antes de aprobar o rechazar."
              : "Complete la información del nuevo miembro en las secciones a continuación."}
          </p>
        </div>

        {renderPaso()}

        {errorPaso && <p className="registro-error-paso">{errorPaso}</p>}

        <div className="registro-nav-contenedor">
          {paso > 1 && (
            <button className="registro-btn-nav btn-regresar" onClick={pasoAnterior}>
              <ArrowLeft size={22} />
            </button>
          )}

          {modoRevision ? (
            <div className="revision-nav-derecha">
              {paso === TOTAL_PASOS && notificacionEstado === "pendiente" && (
                <div className="revision-acciones">
                  <button className="btn-rechazar-revision" onClick={handleRechazar}>
                    <X size={16} /> Rechazar
                  </button>
                  <button className="btn-aprobar-revision" onClick={handleAprobar}>
                    <Check size={16} /> Aprobar
                  </button>
                </div>
              )}

              {paso < TOTAL_PASOS && (
                <button className="registro-btn-nav btn-siguiente" onClick={siguientePaso}>
                  <ArrowRight size={22} />
                </button>
              )}
            </div>
          ) : (
            <button
              className={`registro-btn-nav ${
                paso === TOTAL_PASOS ? "btn-finalizar" : "btn-siguiente"
              }`}
              onClick={paso === TOTAL_PASOS ? handleSubmit : siguientePaso}
            >
              {paso === TOTAL_PASOS ? <Check size={22} /> : <ArrowRight size={22} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default RegistroPage;