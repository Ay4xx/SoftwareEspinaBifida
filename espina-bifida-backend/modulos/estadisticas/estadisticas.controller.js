import {
  getEstadisticasService,
  descargarReporteMensualService,
} from "./estadisticas.service.js";

export async function getEstadisticas(req, res) {
  try {
    const data = await getEstadisticasService();

    return res.status(200).json({
      ok: true,
      data,
    });
  } catch (error) {
    console.error("Error en getEstadisticas controller:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al obtener las estadísticas",
      error: error.message,
    });
  }
}

export async function descargarReporteMensual(req, res) {
  try {
    console.log("CONTROLLER HIT");
    const filtros = req.body;
    const resultado = await descargarReporteMensualService(filtros);

    const mimeMap = {
      csv:   "text/csv",
      excel: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      pdf:   "application/pdf",
    };

    const mime = mimeMap[filtros.tipoArchivo];

    if (mime) {
      // Solo Content-Type — el frontend maneja la descarga con createObjectURL
      res.setHeader("Content-Type", mime);
      return res.status(200).send(resultado);
    }

    return res.status(200).json({
      ok: true,
      data: resultado,
    });
  } catch (error) {
    console.error("Error en descargarReporteMensual:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al generar reporte",
      error: error.message,
    });
  }
}