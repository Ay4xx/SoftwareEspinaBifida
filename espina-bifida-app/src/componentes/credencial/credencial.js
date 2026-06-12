import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import "./credencial.css";
import logoPic from "../../assets/logo_AEBNL.png";
import placeholederPic from "../../assets/placeholder.png";
import API_BASE from "../../config.js";

function Credencial() {
  const { pacienteId } = useParams();
  const navigate = useNavigate();
  const credencialRef = useRef(null);
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCredencial = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/api/pacientes/credencial/${pacienteId}`
        );
        const json = await response.json();

        if (!response.ok || !json.ok) {
          throw new Error(json.message || "No se pudo cargar la credencial");
        }

        setDatos(json.data);
      } catch (err) {
        console.error("Error cargando la credencial:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCredencial();
  }, [pacienteId]);

  const datosMostrados = datos || {
    folio: "000",
    nombre: "Sin nombre",
    direccion: "Sin dirección",
    telCasa: "Sin teléfono",
    padres: "Sin contacto",
    fechaExpedicion: "Sin fecha",
    tipoSangre: "Sin tipo",
    valvula: "No",
    accidenteAvisar: "Sin contacto",
    telefonoEmergencia: "Sin teléfono",
    correo: "Sin correo",
    fechaNacimiento: "Sin fecha",
    lugarNacimiento: "Sin lugar",
    hospital: "Sin hospital",
    fotoPrincipal: placeholederPic,
    fotoMini: placeholederPic,
    logo: logoPic,
  };

  const descargarImagen = async () => {
    if (!credencialRef.current) return;

    try {
      const dataUrl = await toPng(credencialRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });

      const link = document.createElement("a");
      link.download = "credencial.png";
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error al generar imagen:", error);
    }
  };

  const descargarPDF = async () => {
    if (!credencialRef.current) return;

    try {
      const dataUrl = await toPng(credencialRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });

      const ancho = credencialRef.current.offsetWidth;
      const alto = credencialRef.current.offsetHeight;
      const orientacion = ancho > alto ? "landscape" : "portrait";
      const pdf = new jsPDF({ orientation: orientacion, unit: "px", format: [ancho, alto] });

      pdf.addImage(dataUrl, "PNG", 0, 0, ancho, alto);
      pdf.save("credencial.pdf");
    } catch (error) {
      console.error("Error al generar PDF:", error);
    }
  };

  if (loading) {
    return <div className="credencial-loading">Cargando credencial...</div>;
  }

  if (error) {
    return (
      <div className="credencial-error">
        <p>Error: {error}</p>
        <button onClick={() => navigate(-1)}>Volver</button>
      </div>
    );
  }

  return (
    <div className="credencial-wrapper">
      <div className="acciones">
        <button onClick={descargarImagen}>Descargar PNG</button>
        <button onClick={descargarPDF}>Descargar PDF</button>
      </div>

      <div className="credencial" ref={credencialRef}>
        <div className="credencial-superior">
          <div className="logo-col">
            <img src={logoPic} alt="Logo" className="logo" />
          </div>

          <div className="info-col">
            <div className="fila">
              <span><strong>Nombre:</strong> {datosMostrados.nombre}</span>
              <span><strong>Folio:</strong> {datosMostrados.folio}</span>
            </div>

            <div className="fila">
              <span><strong>Dirección:</strong> {datosMostrados.direccion}</span>
            </div>

            <div className="fila foto-info">
              <img src={`${API_BASE}/api/pacientes/${pacienteId}/foto`
              || placeholederPic} 
              alt="Foto mini" className="foto-mini" 
              />
              <div className="bloque-texto">
                <div><strong>Tel. Casa:</strong> {datosMostrados.telCasa}</div>
                <div><strong>Nombre de padres:</strong> {datosMostrados.padres}</div>
                <div><strong>Fecha de Expedición:</strong> {datosMostrados.fechaExpedicion}</div>
              </div>
            </div>
          </div>

          <div className="info-col derecha">
            <div className="fila">
              <span><strong>Tipo de Sangre:</strong> {datosMostrados.tipoSangre}</span>
              <span><strong>Tiene Válvula?:</strong> {datosMostrados.valvula}</span>
            </div>

            <div className="fila">
              <span><strong>En caso de accidente avisar a:</strong> {datosMostrados.accidenteAvisar}</span>
              <span><strong>Teléfono:</strong> {datosMostrados.telefonoEmergencia}</span>
            </div>

            <div className="fila">
              <span><strong>Correo Electrónico:</strong> {datosMostrados.correo}</span>
            </div>

            <div className="asociacion-box">
              <div className="titulo-asociacion">ASOCIACIÓN DE ESPINA BÍFIDA DE N.L. A.B.P.</div>
              <div className="direccion-asociacion">
                Monterrey, N.L.<br />
                Teléfono<br />
                www.espinabifida.org.mx
              </div>
            </div>

            <div className="datos-extra">
              <div><strong>Fecha</strong><br />{datosMostrados.fechaNacimiento}</div>
              <div><strong>Lugar Nac.</strong><br />{datosMostrados.lugarNacimiento}</div>
              <div><strong>Hospital</strong><br />{datosMostrados.hospital}</div>
            </div>
          </div>
        </div>

        <div className="credencial-inferior">
          <img
            src={`${API_BASE}/api/pacientes/${pacienteId}/foto` || placeholederPic}
            alt="Foto principal"
            className="foto-principal"
          />
        </div>
      </div>
    </div>
  );
}

export default Credencial;