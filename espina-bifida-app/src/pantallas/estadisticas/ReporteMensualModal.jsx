import React, { useState } from "react";
import "./ReporteMensualModal.css";
import {
  descargarReporteMensual,
} from "../../services/estadisticasService";

function ReporteMensualModal({ open, onClose }) {
  const [formData, setFormData] = useState({
    inventario: true,
    pacientes: true,
    servicios: true,
    reportes: true,
    fechaInicio: "",
    fechaFin: "",
    tipoArchivo: "excel",
  });

  if (!open) return null;

  const handleCheckbox = (e) => {
    const { name, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleDate = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTipoArchivo = (e) => {
    setFormData((prev) => ({
        ...prev,
        tipoArchivo: e.target.value,
    }));
};

  const handleDownload = async () => {
    try {
        const data =
        await descargarReporteMensual(formData);

        console.log(
        "REPORTE GENERADO:",
        data
        );

        onClose();
    } catch (error) {
        console.error(
        "Error descargando reporte:",
        error
        );
    }
    };

  return (
    <div className="reporte-modal-overlay">
      <div className="reporte-modal">

        <div className="reporte-modal-header">
          <h2>Reporte Mensual</h2>

          <button
            className="close-btn"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <p className="reporte-description">
          Selecciona qué información deseas incluir en el reporte.
        </p>

        <div className="checkbox-group">

          <label>
            <input
              type="checkbox"
              name="inventario"
              checked={formData.inventario}
              onChange={handleCheckbox}
            />
            Inventario
          </label>

          <label>
            <input
              type="checkbox"
              name="pacientes"
              checked={formData.pacientes}
              onChange={handleCheckbox}
            />
            Pacientes
          </label>

          <label>
            <input
              type="checkbox"
              name="servicios"
              checked={formData.servicios}
              onChange={handleCheckbox}
            />
            Servicios
          </label>

          <label>
            <input
              type="checkbox"
              name="reportes"
              checked={formData.reportes}
              onChange={handleCheckbox}
            />
            Reportes
          </label>
        </div>

        <div className="date-group">

          <div>
            <label>Fecha inicio</label>

            <input
              type="date"
              name="fechaInicio"
              value={formData.fechaInicio}
              onChange={handleDate}
            />
          </div>

          <div>
            <label>Fecha fin</label>

            <input
              type="date"
              name="fechaFin"
              value={formData.fechaFin}
              onChange={handleDate}
            />
          </div>
        </div>

        <div className="tipo-archivo-group">

            <label>
                Tipo de archivo
            </label>

            <select
                value={formData.tipoArchivo}
                onChange={handleTipoArchivo}
            >
                <option value="excel">
                Excel (.xlsx)
                </option>

                <option value="pdf">
                PDF (.pdf)
                </option>

                <option value="csv">
                CSV (.csv)
                </option>
            </select>
            </div>

        <button
          className="download-btn"
          onClick={handleDownload}
        >
          Descargar Reporte
        </button>
      </div>
    </div>
  );
}

export default ReporteMensualModal;