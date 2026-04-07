import React, { useRef, useState } from "react";
import "./Fotografia.css";
import { Camera } from "lucide-react";

function Fotografia({ datos, onChange }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [arrastrandoEncima, setArrastrandoEncima] = useState(false);

  const procesarArchivo = (archivo) => {
    if (!archivo) return;
    if (!["image/png", "image/jpeg"].includes(archivo.type)) return;
    if (archivo.size > 5 * 1024 * 1024) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
      onChange({ foto: archivo });
    };
    reader.readAsDataURL(archivo);
  };

  const handleArchivo = (e) => {
    procesarArchivo(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setArrastrandoEncima(false);
    procesarArchivo(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setArrastrandoEncima(true);
  };

  const handleDragLeave = () => {
    setArrastrandoEncima(false);
  };

  return (
    <div className="foto-seccion">
      <div className="foto-seccion-header">
        <div className="foto-icono">
          <Camera size={18} color="white" />
        </div>
        <span className="foto-seccion-titulo">Fotografía del Paciente</span>
      </div>
      <hr className="foto-divisor" />

      <div
        className={`foto-zona ${arrastrandoEncima ? "encima" : ""} ${preview ? "con-preview" : ""}`}
        onClick={() => inputRef.current.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {preview ? (
          <img src={preview} alt="Foto del paciente" className="foto-preview" />
        ) : (
          <>
            <div className="foto-camara-icono">
              <Camera size={32} color="#374151" />
            </div>
            <p className="foto-texto-principal">Arrastra tu foto aquí</p>
            <p className="foto-texto-secundario">o haz clic para seleccionar</p>
            <p className="foto-texto-limite">PNG, JPG hasta 5MB</p>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png, image/jpeg"
        onChange={handleArchivo}
        style={{ display: "none" }}
      />
    </div>
  );
}

export default Fotografia;
