import React, { useRef } from "react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import "./credencial.css";
import logoPic from "../../assets/logo_AEBNL.png";
import placeholederPic from "../../assets/placeholder.png";

function Credencial() {
  const credencialRef = useRef(null);

  const datos = {
    folio: "303",
    nombre: "Juan Pérez López",
    direccion: "Monterrey, Nuevo León",
    telCasa: "8181234567",
    padres: "María López / Pedro Pérez",
    fechaExpedicion: "27/7/99",
    tipoSangre: "A+",
    valvula: "Sí",
    accidenteAvisar: "María López",
    telefonoEmergencia: "8187654321",
    correo: "correo@ejemplo.com",
    fechaNacimiento: "26/05/1993",
    lugarNacimiento: "Monterrey",
    hospital: "GINE-IMSS",
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

  return (
    <div className="credencial-wrapper">
      <div className="acciones">
        <button onClick={descargarImagen}>Descargar PNG</button>
        <button onClick={descargarPDF}>Descargar PDF</button>
      </div>

      <div className="credencial" ref={credencialRef}>
        <div className="credencial-superior">
          <div className="logo-col">
            <img src={datos.logo} alt="Logo" className="logo" />
          </div>

          <div className="info-col">
            <div className="fila">
              <span><strong>Nombre:</strong> {datos.nombre}</span>
              <span><strong>Folio:</strong> {datos.folio}</span>
            </div>

            <div className="fila">
              <span><strong>Dirección:</strong> {datos.direccion}</span>
            </div>

            <div className="fila foto-info">
              <img src={datos.fotoMini} alt="Foto mini" className="foto-mini" />
              <div className="bloque-texto">
                <div><strong>Tel. Casa:</strong> {datos.telCasa}</div>
                <div><strong>Nombre de padres:</strong> {datos.padres}</div>
                <div><strong>Fecha de Expedición:</strong> {datos.fechaExpedicion}</div>
              </div>
            </div>
          </div>

          <div className="info-col derecha">
            <div className="fila">
              <span><strong>Tipo de Sangre:</strong> {datos.tipoSangre}</span>
              <span><strong>Tiene Válvula?:</strong> {datos.valvula}</span>
            </div>

            <div className="fila">
              <span><strong>En caso de accidente avisar a:</strong> {datos.accidenteAvisar}</span>
              <span><strong>Teléfono:</strong> {datos.telefonoEmergencia}</span>
            </div>

            <div className="fila">
              <span><strong>Correo Electrónico:</strong> {datos.correo}</span>
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
              <div><strong>Fecha</strong><br />{datos.fechaNacimiento}</div>
              <div><strong>Lugar Nac.</strong><br />{datos.lugarNacimiento}</div>
              <div><strong>Hospital</strong><br />{datos.hospital}</div>
            </div>
          </div>
        </div>

        <div className="credencial-inferior">
          <img
            src={datos.fotoPrincipal}
            alt="Foto principal"
            className="foto-principal"
          />
        </div>
      </div>
    </div>
  );
}

export default Credencial;