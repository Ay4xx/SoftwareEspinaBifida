import React, { useRef, useState, useEffect } from "react";
import "./Fotografia.css";
import { Camera, Check, FileText, Upload, X } from "lucide-react";

const DOCUMENTOS_CONFIG = [
  { key: "actaNacimiento",       label: "Acta de nacimiento" },
  { key: "curp",                 label: "CURP" },
  { key: "comprobanteDomicilio", label: "Comprobante de domicilio" },
  { key: "ineFamilia",           label: "INE de familia (menores)" },
];

function DocumentoItem({ label, archivo, onChange }) {
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
            className="doc-item-quitar"
            onClick={() => onChange(null)}
            title="Quitar archivo"
          >
            <X size={14} />
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

function Fotografia({ datos, onChange, onGuardar, cambiosGuardados }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [arrastrandoEncima, setArrastrandoEncima] = useState(false);

  useEffect(() => {
    if (!datos?.foto) { setPreview(null); return; }
    if (typeof datos.foto === "string") { setPreview(datos.foto); return; }
    if (datos.foto instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(datos.foto);
    }
  }, [datos?.foto]);

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
            label={label}
            archivo={documentos[key] || null}
            onChange={(file) => handleDocumento(key, file)}
          />
        ))}
      </div>
    </div>
  );
}

export default Fotografia;
