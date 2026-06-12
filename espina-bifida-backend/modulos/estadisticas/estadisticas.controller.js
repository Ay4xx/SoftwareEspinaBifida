import { getEstadisticasService, descargarReporteMensualService } from "./estadisticas.service.js";

const MIME_MAP = {
  csv:   "text/csv",
  excel: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pdf:   "application/pdf",
};

export async function getEstadisticas(req, res) {
  try {
    const { fechaInicio, fechaFin } = req.query; 
    const data = await getEstadisticasService({ fechaInicio, fechaFin });
    return res.status(200).json({ ok: true, data });
  } catch (error) {
    console.error("Error en getEstadisticas:", error);
    return res.status(500).json({ ok: false, message: "Error al obtener las estadísticas", error: error.message });
  }
}

export async function descargarReporteMensual(req, res) {
  try {
    const filtros   = req.body;
    const resultado = await descargarReporteMensualService(filtros);
    const mime      = MIME_MAP[filtros.tipoArchivo];

    if (mime) {
      res.setHeader("Content-Type", mime);
      return res.status(200).send(resultado);
    }

    return res.status(200).json({ ok: true, data: resultado });
  } catch (error) {
    console.error("Error en descargarReporteMensual:", error);
    return res.status(500).json({ ok: false, message: "Error al generar reporte", error: error.message });
  }
}
