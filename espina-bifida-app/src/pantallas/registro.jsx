import React, { useState, useEffect } from "react";
import "./registro.css";
import { ArrowLeft, ArrowRight, Check, X, Trash2 } from "lucide-react";
import DatosPersonales from "../componentes/registro/DatosPersonales/DatosPersonales";
import Contacto from "../componentes/registro/Contacto/Contacto";
import HistorialMedico from "../componentes/registro/HistorialMedico/HistorialMedico";
import HistorialTutor from "../componentes/registro/HistorialTutor/HistorialTutor";
import Fotografia from "../componentes/registro/Fotografia/Fotografia";
import {
  crearPacientePaso1, actualizarPaso2, actualizarPaso3,
  actualizarPaso4, actualizarPaso5, actualizarPaciente,
} from "../services/registroService";
import { useLocation, useNavigate } from "react-router-dom";
import API_BASE from "../config.js";

const TOTAL_PASOS        = 5;
const NOTIFICACIONES_URL = `${API_BASE}/api/notificaciones`;
const PACIENTES_URL      = `${API_BASE}/api/pacientes`;

const CAMPOS_HISTORIAL = ["adicciones", "hijoDtn", "familiarDtn", "expoToxicos", "descripcionExpoToxicos"];

const tutorVacio = (parentesco) => ({
  tutorParentesco: parentesco,
  tutorNombre: "", tutorEdad: "", tutorLugarNacimiento: "",
  tutorOcupacion: "", tutorEscolaridad: "", tutorSeguroMedico: "",
  cdEmbarazo: "", citasControl: "", madreSeguroMedico: "", acidoFolico: "",
});

const HISTORIAL_FAMILIAR_VACIO = {
  adicciones: "", hijoDtn: "", familiarDtn: "", expoToxicos: "", descripcionExpoToxicos: "",
};

const FORM_INICIAL = {
  nombres: "", apellidoPaterno: "", genero: "", fechaNacimiento: "", curp: "",
  direccion: "", ciudad: "", codigoPostal: "", estado: "",
  telefonoCasa: "", telefonoCelular: "", correo: "",
  emergenciaContacto: "", emergenciaTelefono: "",
  lugarNacimiento: "", hospitalNacimiento: "", tipoSangre: "", usaValvula: "",
  tipoEspinaBifida: "", otrosPadecimiento: "", notas: "",
  foto: null,
  documentos: { preregistro: null, actaNacimiento: null, curp: null, comprobanteDomicilio: null, ineFamilia: null },
};


function mapearPacienteAForm(p, fotoBase = null) {
  return {
    nombres:            p.NOMBRE              || "",
    apellidoPaterno:    p.APELLIDO            || "",
    curp:               p.CURP                || "",
    genero:             p.GENERO              || "",
    fechaNacimiento:    p.FECHA_NACIMIENTO    || "",
    direccion:          p.DIRECCION           || "",
    ciudad:             p.CIUDAD_RESIDENCIA   || "",
    estado:             p.ESTADO_RESIDENCIA   || "",
    codigoPostal:       p.CODIGO_POSTAL       || "",
    telefonoCasa:       p.TELEFONO_CASA       || "",
    telefonoCelular:    p.TELEFONO_CELULAR    || "",
    correo:             p.EMAIL               || "",
    emergenciaContacto: p.EMERGENCIA_CONTACTO || "",
    emergenciaTelefono: p.EMERGENCIA_TELEFONO || "",
    lugarNacimiento:    p.LUGAR_NACIMIENTO    || "",
    hospitalNacimiento: p.HOSPITAL_NACIMIENTO || "",
    tipoSangre:         p.SANGRE_TIPO         || "",
    usaValvula:         p.VALVULA === "SI" ? "Sí" : p.VALVULA === "NO" ? "No" : "",
    notas:              p.NOTAS_ADICIONALES   || "",
    tipoEspinaBifida:   p.TIPO_ESPINA_BIFIDA  || "",
    otrosPadecimiento:  p.OTROS_PADECIMIENTO  || "",
    foto:               fotoBase,
  };
}

function mapearTutores(tutores, setTutorMadre, setTutorPadre, setHistorialFamiliar) {
  tutores.forEach((t) => {
    const base = {
      tutorParentesco:      t.tutorParentesco      || "",
      tutorNombre:          t.tutorNombre          || "",
      tutorEdad:            t.tutorEdad            || "",
      tutorLugarNacimiento: t.tutorLugarNacimiento || "",
      tutorOcupacion:       t.tutorOcupacion       || "",
      tutorEscolaridad:     t.tutorEscolaridad     || "",
      tutorSeguroMedico:    t.tutorSeguroMedico    || "",
    };

    if (t.tutorParentesco === "Madre") {
      setTutorMadre({
        ...base,
        cdEmbarazo:        t.cdEmbarazo        || "",
        citasControl:      t.citasControl      || "",
        madreSeguroMedico: t.madreSeguroMedico || "",
        acidoFolico:       t.acidoFolico       || "",
      });
      setHistorialFamiliar({
        adicciones:             t.adicciones             || "",
        hijoDtn:                t.hijoDtn                || "",
        familiarDtn:            t.familiarDtn            || "",
        expoToxicos:            t.expoToxicos            || "",
        descripcionExpoToxicos: t.descripcionExpoToxicos || "",
      });
    }

    if (t.tutorParentesco === "Padre") {
      setTutorPadre({ ...base, cdEmbarazo: "", citasControl: "", madreSeguroMedico: "", acidoFolico: "" });
      setHistorialFamiliar((prev) => ({
        adicciones:             prev.adicciones             || t.adicciones             || "",
        hijoDtn:                prev.hijoDtn                || t.hijoDtn                || "",
        familiarDtn:            prev.familiarDtn            || t.familiarDtn            || "",
        expoToxicos:            prev.expoToxicos            || t.expoToxicos            || "",
        descripcionExpoToxicos: prev.descripcionExpoToxicos || t.descripcionExpoToxicos || "",
      }));
    }
  });
}


function PantallaExito({ titulo, subtitulo, advertencias }) {
  return (
    <div className="registro-wrapper">
      <div className="registro-exito">
        <div className="registro-exito-icono"><Check size={40} color="white" /></div>
        <h2>{titulo}</h2>
        {advertencias && advertencias.length > 0 ? (
          <div className="registro-advertencias">
            <p className="registro-advertencias-titulo">Algunos datos opcionales no se guardaron:</p>
            <ul className="registro-advertencias-lista">
              {advertencias.map((adv, i) => <li key={i}>• {adv}</li>)}
            </ul>
            <p className="registro-advertencias-nota">Puedes editarlos más tarde desde el perfil del paciente.</p>
          </div>
        ) : (
          <p>{subtitulo}</p>
        )}
      </div>
    </div>
  );
}



function RegistroPage() {
  const location = useLocation();
  const navigate  = useNavigate();

  const modoRevision        = location.state?.modoRevision   || false;
  const notificacionId      = location.state?.notificacionId || null;
  const pacienteIdFromState = location.state?.pacienteId ? String(location.state.pacienteId) : null;

  const [paso, setPaso]                               = useState(1);
  const [guardado, setGuardado]                       = useState(false);
  const [enviando, setEnviando]                       = useState(false);
  const [errorPaso, setErrorPaso]                     = useState(null);
  const [advertencias, setAdvertencias]               = useState([]);
  const [notificacionEstado, setNotificacionEstado]   = useState(null);
  const [accionRealizada, setAccionRealizada]         = useState(null);
  const [pacienteId, setPacienteId]                   = useState(null);
  const [cambiosGuardados, setCambiosGuardados]       = useState(false);
  const [formData, setFormData]                       = useState(FORM_INICIAL);
  const [tutorMadre, setTutorMadre]                   = useState(tutorVacio("Madre"));
  const [tutorPadre, setTutorPadre]                   = useState(tutorVacio("Padre"));
  const [historialFamiliar, setHistorialFamiliar]     = useState({ ...HISTORIAL_FAMILIAR_VACIO });
  const [tabActivo, setTabActivo]                     = useState("Madre");
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [borrando, setBorrando]                       = useState(false);

  const esInvitado = localStorage.getItem("guest") === "true";

  const getTutoresParaGuardar = () => [
    { ...tutorMadre, ...historialFamiliar },
    { ...tutorPadre, ...historialFamiliar },
  ];

  const resetearFormulario = () => {
    setPaso(1);
    setFormData(FORM_INICIAL);
    setTutorMadre(tutorVacio("Madre"));
    setTutorPadre(tutorVacio("Padre"));
    setHistorialFamiliar({ ...HISTORIAL_FAMILIAR_VACIO });
    setTabActivo("Madre");
  };

  
  useEffect(() => {
    if (!modoRevision || !notificacionId) return;
    fetch(`${NOTIFICACIONES_URL}/${notificacionId}`)
      .then((r) => r.json())
      .then((result) => {
        if (!result.ok) return;
        const p = result.data;
        setNotificacionEstado(p.ESTADO_PROCESO);
        setPacienteId(p.PACIENTE_ID);
        setFormData((prev) => ({ ...prev, ...mapearPacienteAForm(p, p.FOTO || null) }));
        if (p.TUTORES?.length > 0) mapearTutores(p.TUTORES, setTutorMadre, setTutorPadre, setHistorialFamiliar);
      })
      .catch(() => {});
  }, [notificacionId, modoRevision]);

  
  useEffect(() => {
    if (!modoRevision || !pacienteIdFromState) return;
    fetch(`${PACIENTES_URL}/${pacienteIdFromState}`)
      .then((r) => r.json())
      .then((result) => {
        if (!result.ok) return;
        const p = result.data;
        setPacienteId(p.PACIENTE_ID);
        setNotificacionEstado("aprobado");
        const fotoUrl = p.FOTO ? `${API_BASE}${p.FOTO}` : null;
        setFormData((prev) => ({ ...prev, ...mapearPacienteAForm(p, fotoUrl) }));
        if (p.TUTORES?.length > 0) mapearTutores(p.TUTORES, setTutorMadre, setTutorPadre, setHistorialFamiliar);
      })
      .catch(() => {});
  }, [pacienteIdFromState, modoRevision]);

  

  const handleChange = (nuevosDatos) => {
    setFormData((prev) => ({ ...prev, ...nuevosDatos }));
    if (nuevosDatos.curp !== undefined) setErrorPaso(null);
  };

  const handleChangeTutor = (nuevosDatos) => {
    const datosHistorial = {};
    const datosTutor     = {};

    Object.entries(nuevosDatos).forEach(([key, val]) => {
      if (CAMPOS_HISTORIAL.includes(key)) datosHistorial[key] = val;
      else datosTutor[key] = val;
    });

    if (Object.keys(datosHistorial).length > 0) setHistorialFamiliar((prev) => ({ ...prev, ...datosHistorial }));
    if (Object.keys(datosTutor).length > 0) {
      if (tabActivo === "Madre") setTutorMadre((prev) => ({ ...prev, ...datosTutor }));
      else setTutorPadre((prev) => ({ ...prev, ...datosTutor }));
    }
  };

  const handleGuardarCambios = async () => {
    try {
      const result = await actualizarPaciente(pacienteId, formData, getTutoresParaGuardar());
      if (result.data?.fotoUrl) setFormData((prev) => ({ ...prev, foto: result.data.fotoUrl }));
      setCambiosGuardados(true);
      setTimeout(() => setCambiosGuardados(false), 3000);
    } catch (err) {
      alert(err.message || "Error al guardar cambios");
    }
  };

  const handleBorrarPaciente = async () => {
    setBorrando(true);
    try {
      const response = await fetch(`${PACIENTES_URL}/${pacienteId}`, { method: "DELETE" });
      const result   = await response.json();
      if (!result.ok) throw new Error(result.message || "No se pudo borrar el paciente");
      setMostrarConfirmacion(false);
      navigate("/usuarios");
    } catch (err) {
      alert(err.message || "Error al borrar el paciente");
      setBorrando(false);
    }
  };

  const validarPaso = () => {
    if (paso !== 1) return null;
    const curp = formData.curp;
    if (!curp) return "La CURP es obligatoria para continuar.";
    const ESTADOS = ["AS","BC","BS","CC","CL","CM","CS","CH","DF","DG","GT","GR",
      "HG","JC","MC","MN","MS","NT","NL","OC","PL","QT","QR","SP","SL","SR","TC","TS","TL","VZ","YN","ZS","NE"];
    const regex = new RegExp(
      `^[A-Z][AEIOU][A-Z]{2}\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])[HMX](${ESTADOS.join("|")})[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z]\\d$`
    );
    if (!regex.test(curp)) return "La CURP ingresada no tiene un formato válido. Verifica e intenta de nuevo.";
    return null;
  };

  const siguientePaso = () => {
    if (!modoRevision) {
      const error = validarPaso();
      if (error) { setErrorPaso(error); return; }
      setErrorPaso(null);
    }
    if (paso < TOTAL_PASOS) setPaso(paso + 1);
  };

  const pasoAnterior = () => { if (paso > 1) setPaso(paso - 1); };

  const handleSubmit = async () => {
    if (enviando) return;
    setEnviando(true);
    setErrorPaso(null);
    const erroresPasos = [];

    try {
      const resultado = await crearPacientePaso1(formData);
      const id        = resultado.data.pacienteId;

      try { await actualizarPaso2(id, formData); }
      catch (e) { erroresPasos.push("Contacto: " + (e.message || "No se pudieron guardar los datos de contacto.")); }

      try { await actualizarPaso3(id, formData); }
      catch (e) { erroresPasos.push("Historial médico: " + (e.message || "No se pudo guardar el historial médico.")); }

      for (const tutor of getTutoresParaGuardar()) {
        try { await actualizarPaso4(id, tutor); }
        catch (e) { erroresPasos.push(`${tutor.tutorParentesco}: ` + (e.message || "No se pudo guardar el historial del tutor.")); }
      }

      const tieneDocumentos = formData.documentos &&
        Object.values(formData.documentos).some((f) => f instanceof File);
      if (formData.foto || tieneDocumentos) {
        try { await actualizarPaso5(id, formData.foto, formData); }
        catch (e) { erroresPasos.push("Fotografía/Documentos: " + (e.message || "No se pudieron guardar.")); }
      }

      if (erroresPasos.length > 0) setAdvertencias(erroresPasos);
      setGuardado(true);

      setTimeout(() => {
        setGuardado(false);
        setAdvertencias([]);
        resetearFormulario();
        if (esInvitado) navigate("/registro");
        else navigate("/usuarios");
      }, erroresPasos.length > 0 ? 5000 : 2000);

    } catch (error) {
      if (error.code === "CURP_DUPLICADO") {
        setPaso(1);
        setErrorPaso("Ya existe un paciente registrado con esa CURP...");
      } else {
        setErrorPaso("Error al guardar el registro. Intenta de nuevo.");
      }
    } finally {
      setEnviando(false);
    }
  };

  const handleAprobar = async () => {
    try {
      const response = await fetch(`${NOTIFICACIONES_URL}/${notificacionId}/aprobar`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}),
      });
      const result = await response.json();
      if (!result.ok) throw new Error(result.message);
      setAccionRealizada("aprobado");
      setTimeout(() => navigate("/notificaciones"), 2000);
    } catch (err) { alert(err.message || "Error al aprobar"); }
  };

  const handleRechazar = async () => {
    try {
      const response = await fetch(`${NOTIFICACIONES_URL}/${notificacionId}/rechazar`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}),
      });
      const result = await response.json();
      if (!result.ok) throw new Error(result.message);
      setAccionRealizada("rechazado");
      setTimeout(() => navigate("/notificaciones"), 2000);
    } catch (err) { alert(err.message || "Error al rechazar"); }
  };


  const botonBorrar =
    modoRevision && (pacienteIdFromState || pacienteId) ? (
      <button
        type="button"
        onClick={() => setMostrarConfirmacion(true)}
        title="Borrar paciente"
        style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca",
          borderRadius: 8, padding: "8px 14px", cursor: "pointer",
          fontSize: 14, fontWeight: 500, whiteSpace: "nowrap",
        }}
      >
        <Trash2 size={16} /> Borrar paciente
      </button>
    ) : null;

  const renderPaso = () => {
    switch (paso) {
      case 1: return <DatosPersonales datos={formData} onChange={handleChange} botonBorrar={botonBorrar} />;
      case 2: return <Contacto datos={formData} onChange={handleChange} />;
      case 3: return <HistorialMedico datos={formData} onChange={handleChange} />;
      case 4:
        return (
          <>
            <div className="tutor-tabs">
              {["Madre", "Padre"].map((opcion) => (
                <button
                  key={opcion}
                  type="button"
                  className={`tutor-tab ${tabActivo === opcion ? "tutor-tab-activo" : ""}`}
                  onClick={() => setTabActivo(opcion)}
                >
                  {opcion}
                </button>
              ))}
            </div>
            <HistorialTutor
              datos={{ ...(tabActivo === "Madre" ? tutorMadre : tutorPadre), ...historialFamiliar }}
              onChange={handleChangeTutor}
              onAgregarTutor={null}
            />
          </>
        );
      case 5:
        return (
          <Fotografia
            datos={formData}
            onChange={handleChange}
            onGuardar={modoRevision ? handleGuardarCambios : null}
            cambiosGuardados={cambiosGuardados}
          />
        );
      default: return null;
    }
  };

  if (accionRealizada) {
    return (
      <PantallaExito
        titulo={accionRealizada === "aprobado" ? "¡Paciente aprobado exitosamente!" : "Registro rechazado correctamente"}
        subtitulo="Regresando a notificaciones..."
      />
    );
  }

  if (guardado) {
    return (
      <PantallaExito
        titulo="¡Registro guardado exitosamente!"
        subtitulo={esInvitado ? "Registro enviado correctamente" : "Redirigiendo al registro de usuarios"}
        advertencias={advertencias}
      />
    );
  }

  const porcentaje = Math.round((paso / TOTAL_PASOS) * 100);

  return (
    <div className="registro-wrapper">
      <div className="registro-card">
        <div className="registro-progreso-barra">
          <div className="registro-progreso-relleno" style={{ width: `${porcentaje}%` }} />
        </div>
        <div className="registro-progreso-info">
          <span className="registro-paso-badge">Paso {paso} de {TOTAL_PASOS}</span>
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
              {paso === TOTAL_PASOS && (
                <div className="revision-acciones">
                  {notificacionEstado === "rechazado" && (
                    <button className="btn-aprobar-revision" onClick={handleAprobar}>
                      <Check size={16} /> Aprobar
                    </button>
                  )}
                  {notificacionEstado === "pendiente" && (
                    <>
                      <button className="btn-rechazar-revision" onClick={handleRechazar}>
                        <X size={16} /> Rechazar
                      </button>
                      <button className="btn-aprobar-revision" onClick={handleAprobar}>
                        <Check size={16} /> Aprobar
                      </button>
                    </>
                  )}
                  {notificacionEstado === "aprobado" && notificacionId && (
                    <button className="btn-aprobar-revision" onClick={handleGuardarCambios}>
                      <Check size={16} /> Guardar cambios
                    </button>
                  )}
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
              className={`registro-btn-nav ${paso === TOTAL_PASOS ? "btn-finalizar" : "btn-siguiente"}`}
              onClick={paso === TOTAL_PASOS ? handleSubmit : siguientePaso}
              disabled={enviando}
            >
              <Check size={22} />
            </button>
          )}
        </div>
      </div>

      {/* Modal confirmación borrar */}
      {mostrarConfirmacion && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
          }}
          onClick={() => !borrando && setMostrarConfirmacion(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff", borderRadius: 12, padding: 28,
              maxWidth: 420, width: "90%", textAlign: "center",
              boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ fontSize: 44, marginBottom: 8 }}>⚠️</div>
            <h2 style={{ margin: "0 0 8px", fontSize: 20 }}>¿Borrar este paciente?</h2>
            <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 22 }}>
              Esta acción eliminará de forma permanente al paciente y todos sus datos
              relacionados (historiales, visitas, citas, membresía). No se puede deshacer.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                type="button"
                onClick={() => setMostrarConfirmacion(false)}
                disabled={borrando}
                style={{
                  padding: "10px 20px", borderRadius: 8, border: "1px solid #d1d5db",
                  background: "#fff", cursor: "pointer", fontSize: 14,
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleBorrarPaciente}
                disabled={borrando}
                style={{
                  padding: "10px 20px", borderRadius: 8, border: "none",
                  background: "#dc2626", color: "#fff", cursor: "pointer",
                  fontSize: 14, fontWeight: 500,
                }}
              >
                {borrando ? "Borrando..." : "Sí, borrar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RegistroPage;