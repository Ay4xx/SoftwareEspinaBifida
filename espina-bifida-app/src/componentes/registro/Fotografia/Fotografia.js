import React, { useRef, useState, useEffect } from "react";
import "./Fotografia.css";
import { Camera, Check } from "lucide-react";

function Fotografia({ datos, onChange, onGuardar, cambiosGuardados }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [arrastrandoEncima, setArrastrandoEncima] = useState(false);

  useEffect(() => {
    if (!datos?.foto) {
      setPreview(null);
      return;
    }

    if (typeof datos.foto === "string") {
      setPreview(datos.foto);
      return;
    }

    if (datos.foto instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(datos.foto);
    }
  }, [datos?.foto]);

  const procesarArchivo = (archivo) => {
    if (!archivo) return;
    if (!["image/png", "image/jpeg"].includes(archivo.type)) return;
    if (archivo.size > 5 * 1024 * 1024) return;
    onChange({ foto: archivo });
  };

  const handleArchivo = (e) => procesarArchivo(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setArrastrandoEncima(false);
    procesarArchivo(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setArrastrandoEncima(true);
  };

  const handleDragLeave = () => setArrastrandoEncima(false);

  return (
    <div className="foto-seccion">
      {/* Header */}
      <div className="foto-seccion-header">
        <div className="foto-header-izquierda">
          <div className="foto-icono">
            <Camera size={18} color="white" />
          </div>
          <span className="foto-seccion-titulo">Fotografía del Paciente</span>
        </div>

        {onGuardar && (
          <button className="btn-guardar-cambios-header" onClick={onGuardar}>
            {cambiosGuardados ? (
              <>
                <Check size={16} />
                Guardado
              </>
            ) : (
              "Guardar cambios"
            )}
          </button>
        )}
      </div>

      <hr className="foto-divisor" />

      {preview ? (
        <div className="foto-dos-columnas">

          {/* Columna izquierda — foto actual */}
          <div className="foto-columna-actual">
            <p className="foto-columna-label">Foto actual</p>
            <div className="foto-actual-wrapper">
              <img
                src={preview}
                alt="Foto actual del paciente"
                className="foto-actual-img"
              />
            </div>
          </div>

          <div className="foto-divisor-vertical" />

          {/* Columna derecha — zona de carga */}
          <div className="foto-columna-nueva">
            <p className="foto-columna-label">Subir nueva foto</p>
            <div
              className={`foto-zona foto-zona-compacta ${arrastrandoEncima ? "encima" : ""}`}
              onClick={() => inputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="foto-camara-icono">
                <Camera size={28} color="#374151" />
              </div>
              <p className="foto-texto-principal">Arrastra tu foto aquí</p>
              <p className="foto-texto-secundario">o haz clic para seleccionar</p>
              <p className="foto-texto-limite">PNG, JPG hasta 5MB</p>
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
          <div className="foto-camara-icono">
            <Camera size={32} color="#374151" />
          </div>
          <p className="foto-texto-principal">Arrastra tu foto aquí</p>
          <p className="foto-texto-secundario">o haz clic para seleccionar</p>
          <p className="foto-texto-limite">PNG, JPG hasta 5MB</p>
        </div>
      )}

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