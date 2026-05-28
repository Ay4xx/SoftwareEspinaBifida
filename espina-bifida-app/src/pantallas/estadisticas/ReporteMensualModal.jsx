import React, { useState } from "react";
import {
  X, Download, FileSpreadsheet, FileText, FileDown,
  Users, CalendarDays, Activity, Heart, Stethoscope,
  Pill, Package, Bell,
} from "lucide-react";
import { descargarReporteMensual } from "../../services/estadisticasService";
import "./ReporteMensualModal.css";

const SECCIONES = [
  { key: "pacientes",      label: "Pacientes",         icon: Users,          desc: "KPIs, nuevos por mes, membresías" },
  { key: "citas",          label: "Citas",             icon: CalendarDays,   desc: "Totales, atendidas, canceladas" },
  { key: "visitas",        label: "Visitas e ingresos",icon: Activity,       desc: "Ingresos, descuentos, servicios" },
  { key: "membresias",     label: "Membresías",        icon: Heart,          desc: "Activas, inactivas, vencidas" },
  { key: "servicios",      label: "Servicios",         icon: Stethoscope,    desc: "Servicios realizados por mes" },
  { key: "medicinas",      label: "Medicinas",         icon: Pill,           desc: "Stock, uso, valor de inventario" },
  { key: "equipo",         label: "Equipo médico",     icon: Package,        desc: "Uso, retorno, valor total" },
  { key: "notificaciones", label: "Notificaciones",    icon: Bell,           desc: "Por mes, rechazados, aprobación" },
];

const FORMATOS = [
  { value: "excel", label: "Excel (.xlsx)", icon: FileSpreadsheet, desc: "Hojas con tablas, fórmulas y gráficas" },
  { value: "pdf",   label: "PDF (.pdf)",    icon: FileText,        desc: "Documento con gráficas y tablas" },
  { value: "csv",   label: "CSV (.csv)",    icon: FileDown,        desc: "Datos planos, sin gráficas" },
];

export default function ReporteMensualModal({ open, onClose }) {
  const [formData, setFormData] = useState({
    pacientes:      true,
    citas:          true,
    visitas:        true,
    membresias:     true,
    servicios:      true,
    medicinas:      true,
    equipo:         true,
    notificaciones: true,
    tipoArchivo:    "excel",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  if (!open) return null;

  const toggleSection = (key) =>
    setFormData((p) => ({ ...p, [key]: !p[key] }));

  const selectAll = () =>
    setFormData((p) => {
      const next = { ...p };
      SECCIONES.forEach((s) => { next[s.key] = true; });
      return next;
    });

  const deselectAll = () =>
    setFormData((p) => {
      const next = { ...p };
      SECCIONES.forEach((s) => { next[s.key] = false; });
      return next;
    });

  const selectedCount = SECCIONES.filter((s) => formData[s.key]).length;

  const handleDownload = async () => {
    if (selectedCount === 0) {
      setError("Selecciona al menos una sección.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      // DEBUGS ----------------------------------------------------------------------------
      console.log("=== INICIO DESCARGA ===");
      console.log("Form data:", formData);
      // DEBUGS ----------------------------------------------------------------------------
      const blob = await descargarReporteMensual(formData);
      // DEBUGS ----------------------------------------------------------------------------
      console.log("Blob recibido:", blob);
      console.log("Blob type:", blob.type);
      console.log("Blob size:", blob.size);
      // DEBUGS ----------------------------------------------------------------------------

      const mimeMap = {
        excel: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        pdf:   "application/pdf",
        csv:   "text/csv",
      };
      const extMap = { excel: "xlsx", pdf: "pdf", csv: "csv" };
      // DEBUGS ----------------------------------------------------------------------------
      console.log("Creando URL...");
      // DEBUGS ----------------------------------------------------------------------------
      const url = URL.createObjectURL(
        new Blob([blob], { type: mimeMap[formData.tipoArchivo] })
      );
      // DEBUGS ----------------------------------------------------------------------------
      console.log("Download iniciado");
      // DEBUGS ----------------------------------------------------------------------------
      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte_mensual.${extMap[formData.tipoArchivo]}`;
      a.click();
      URL.revokeObjectURL(url);
      onClose();
    } catch (e) {
      console.error(e);
      setError("Error al generar el reporte. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="rm-modal">

        {/* header */}
        <div className="rm-header">
          <div>
            <h2 className="rm-title">Descargar reporte</h2>
            <p className="rm-desc">Elige las secciones y el formato del archivo.</p>
          </div>
          <button className="rm-close" onClick={onClose} aria-label="Cerrar">
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* secciones */}
        <div className="rm-section-label">
          <span>Secciones ({selectedCount}/{SECCIONES.length})</span>
          <div className="rm-quick-btns">
            <button className="rm-link-btn" onClick={selectAll}>Todas</button>
            <span className="rm-link-sep">·</span>
            <button className="rm-link-btn" onClick={deselectAll}>Ninguna</button>
          </div>
        </div>

        <div className="rm-sections-grid">
          {SECCIONES.map(({ key, label, icon: Icon, desc }) => (
            <label
              key={key}
              className={`rm-section-card ${formData[key] ? "checked" : ""}`}
            >
              <input
                type="checkbox"
                checked={formData[key]}
                onChange={() => toggleSection(key)}
                className="rm-hidden-check"
              />
              <div className="rm-card-icon">
                <Icon size={16} strokeWidth={2} />
              </div>
              <div className="rm-card-text">
                <p className="rm-card-name">{label}</p>
                <p className="rm-card-desc">{desc}</p>
              </div>
              <div className={`rm-check-dot ${formData[key] ? "on" : ""}`} />
            </label>
          ))}
        </div>

        {/* formato */}
        <div className="rm-section-label" style={{ marginTop: "20px" }}>
          <span>Formato de exportación</span>
        </div>
        <div className="rm-format-grid">
          {FORMATOS.map(({ value, label, icon: Icon, desc }) => (
            <label
              key={value}
              className={`rm-format-card ${formData.tipoArchivo === value ? "selected" : ""}`}
            >
              <input
                type="radio"
                name="tipoArchivo"
                value={value}
                checked={formData.tipoArchivo === value}
                onChange={() => setFormData((p) => ({ ...p, tipoArchivo: value }))}
                className="rm-hidden-check"
              />
              <Icon size={20} strokeWidth={1.8}
                    className={`rm-fmt-icon ${formData.tipoArchivo === value ? "active" : ""}`} />
              <p className="rm-fmt-name">{label}</p>
              <p className="rm-fmt-desc">{desc}</p>
            </label>
          ))}
        </div>

        {error && <p className="rm-error">{error}</p>}

        {/* action */}
        <button
          className={`rm-download-btn ${loading ? "loading" : ""}`}
          onClick={handleDownload}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="rm-spinner" />
              Generando reporte…
            </>
          ) : (
            <>
              <Download size={16} strokeWidth={2.5} />
              Descargar reporte
            </>
          )}
        </button>
      </div>
    </div>
  );
}