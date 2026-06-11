import React, { useRef, useState, useEffect } from "react";
import "./Fotografia.css";
import { Camera, Check, FileText, Upload, X, Eye, Download } from "lucide-react";

const PACIENTES_URL = "http://localhost:3001/api/pacientes";

const DOCUMENTOS_CONFIG = [
  { key: "actaNacimiento",       label: "Acta de nacimiento" },
  { key: "curp",                 label: "CURP" },
  { key: "comprobanteDomicilio", label: "Comprobante de domicilio" },
  { key: "ineFamilia",           label: "INE de familia (menores)" },
];

function DocumentoItem({
  docKey, label, archivo, onChange,
  modoRevision, pacienteId, disponibleEnBD,
}) {
  const inputRef = useRef(null);

  const handleArchivo = (e) => {
    const file = e.target.files[0];
    if (file) onChange(file);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) onChange(file);
  };

  // Abre el archivo recién seleccionado (aún no subido) en una pestaña nueva
  const verArchivoLocal = () => {
    if (!(archivo instanceof File)) return;
    const url = URL.createObjectURL(archivo);
    window.open(url, "_blank", "noopener,noreferrer");
    // liberar después de un momento (ya se abrió en la pestaña)
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  // URL del documento guardado en la BD
  const urlDocBD = (descargar) =>
    `${PACIENTES_URL}/${pacienteId}/documento/${docKey}${descargar ? "?descargar=1" : ""}`;

  return (
    <div className="doc-item">
      <div className="doc-item-icono">
        <FileText size={18} color="#083a99" />
      </div>
      <span className="doc-item-label">{label}</span>

      {archivo ? (
        <div className="doc-item-archivo">
          <span className="doc-item-nombre">{archivo.name}</span>
          <button
            type="button"
            className="doc-item-ver"
            onClick={verArchivoLocal}
            title="Ver archivo seleccionado"
          >
            <Eye size={14} />
          </button>
          <button
            type="button"
            className="doc-item-quitar"
            onClick={() => onChange(null)}
            title="Quitar archivo"
          >
            <X size={14} />
          </button>
        </div>
      ) : modoRevision && disponibleEnBD ? (
        // En revisión, si el documento ya existe en la BD: abrir / descargar
        <div className="doc-item-acciones-bd">
          <a
            href={urlDocBD(false)}
            target="_blank"
            rel="noopener noreferrer"
            className="doc-item-btn doc-item-btn-ver"
            title="Abrir documento"
          >
            <Eye size={14} />
            Abrir
          </a>
          <a
            href={urlDocBD(true)}
            className="doc-item-btn doc-item-btn-descargar"
            title="Descargar documento"
          >
            <Download size={14} />
            Descargar
          </a>
          <button
            type="button"
            className="doc-item-btn"
            onClick={() => inputRef.current?.click()}
            title="Reemplazar documento"
          >
            <Upload size={14} />
            Reemplazar
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="doc-item-btn"
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <Upload size={14} />
          Seleccionar
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,application/pdf"
        onChange={handleArchivo}
        style={{ display: "none" }}
      />
    </div>
  );
}

function Fotografia({ datos, onChange, onGuardar, cambiosGuardados, modoRevision, pacienteId }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [arrastrandoEncima, setArrastrandoEncima] = useState(false);
  const [docsDisponibles, setDocsDisponibles] = useState({});

  useEffect(() => {
    if (!datos?.foto) { setPreview(null); return; }
    if (typeof datos.foto === "string") { setPreview(datos.foto); return; }
    if (datos.foto instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(datos.foto);
    }
  }, [datos?.foto]);

  // En modo revisión, consultar qué documentos tiene el paciente en la BD
  useEffect(() => {
    if (!modoRevision || !pacienteId) return;
    fetch(`${PACIENTES_URL}/${pacienteId}/documentos`)
      .then((r) => r.json())
      .then((result) => { if (result.ok) setDocsDisponibles(result.data || {}); })
      .catch(() => {});
  }, [modoRevision, pacienteId, cambiosGuardados]);

  const procesarFoto = (archivo) => {
    if (!archivo) return;
    if (!["image/png", "image/jpeg"].includes(archivo.type)) return;
    if (archivo.size > 5 * 1024 * 1024) return;
    onChange({ foto: archivo });
  };

  const handleArchivoFoto = (e) => procesarFoto(e.target.files[0]);
  const handleDrop = (e) => { e.preventDefault(); setArrastrandoEncima(false); procesarFoto(e.dataTransfer.files[0]); };
  const handleDragOver = (e) => { e.preventDefault(); setArrastrandoEncima(true); };
  const handleDragLeave = () => setArrastrandoEncima(false);

  const handleDocumento = (key, file) => {
    onChange({ documentos: { ...(datos.documentos || {}), [key]: file } });
  };

  const documentos = datos?.documentos || {};

  return (
    <div className="foto-seccion">
      {/* Header */}
      <div className="foto-seccion-header">
        <div className="foto-header-izquierda">
          <div className="foto-icono">
            <Camera size={18} color="white" />
          </div>
          <span className="foto-seccion-titulo">Fotografía y Documentos</span>
        </div>

        {onGuardar && (
          <button className="btn-guardar-cambios-header" onClick={onGuardar}>
            {cambiosGuardados ? <><Check size={16} />Guardado</> : "Guardar cambios"}
          </button>
        )}
      </div>

      <hr className="foto-divisor" />

      {/* Sección foto */}
      <p className="foto-subtitulo">Fotografía del paciente <span className="foto-opcional">(opcional)</span></p>

      {preview ? (
        <div className="foto-dos-columnas">
          <div className="foto-columna-actual">
            <p className="foto-columna-label">Foto actual</p>
            <div className="foto-actual-wrapper">
              <img src={preview} alt="Foto actual del paciente" className="foto-actual-img" />
            </div>
          </div>
          <div className="foto-divisor-vertical" />
          <div className="foto-columna-nueva">
            <p className="foto-columna-label">Subir nueva foto</p>
            <div
              className={`foto-zona foto-zona-compacta ${arrastrandoEncima ? "encima" : ""}`}
              onClick={() => inputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="foto-camara-icono"><Camera size={28} color="#374151" /></div>
              <p className="foto-texto-principal">Arrastra tu foto aquí</p>
              <p className="foto-texto-secundario">o haz clic para seleccionar</p>
              <p className="foto-texto-limite">PNG, JPG hasta 5 MB</p>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`foto-zona ${arrastrandoEncima ? "encima" : ""}`}
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="foto-camara-icono"><Camera size={32} color="#374151" /></div>
          <p className="foto-texto-principal">Arrastra tu foto aquí</p>
          <p className="foto-texto-secundario">o haz clic para seleccionar</p>
          <p className="foto-texto-limite">PNG, JPG hasta 5 MB</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        onChange={handleArchivoFoto}
        style={{ display: "none" }}
      />

      {/* Sección documentos */}
      <div className="doc-seccion-header">
        <div className="foto-header-izquierda">
          <div className="foto-icono">
            <FileText size={18} color="white" />
          </div>
          <span className="foto-seccion-titulo">Documentos</span>
        </div>
        <span className="foto-opcional">Todos opcionales · PDF, PNG, JPG hasta 10 MB</span>
      </div>

      <hr className="foto-divisor" />

      <div className="doc-lista">
        {DOCUMENTOS_CONFIG.map(({ key, label }) => (
          <DocumentoItem
            key={key}
            docKey={key}
            label={label}
            archivo={documentos[key] || null}
            onChange={(file) => handleDocumento(key, file)}
            modoRevision={modoRevision}
            pacienteId={pacienteId}
            disponibleEnBD={!!docsDisponibles[key]}
          />
        ))}
      </div>
    </div>
  );
}

export default Fotografia;