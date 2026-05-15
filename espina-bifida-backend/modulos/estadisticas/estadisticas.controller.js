import {
  getEstadisticasService,
  descargarReporteMensualService,
} from "./estadisticas.service.js";

export async function getEstadisticas(req, res) {
  try {

    const data =
      await getEstadisticasService();

    return res.status(200).json({
      ok: true,
      data,
    });

  } catch (error) {

    console.error(
      "Error en getEstadisticas controller:",
      error
    );

    return res.status(500).json({
      ok: false,
      message:
        "Error al obtener las estadísticas",

      error: error.message,
    });
  }
}

export async function descargarReporteMensual(
  req,
  res
) {
  try {

    const filtros = req.body;

    const resultado =
      await descargarReporteMensualService(
        filtros
      );

    if (filtros.tipoArchivo === "csv") {

      res.setHeader(
        "Content-Type",
        "text/csv"
      );

      res.setHeader(
        "Content-Disposition",
        "attachment; filename=reporte_mensual.csv"
      );

      return res
        .status(200)
        .send(resultado);
    }

    if (filtros.tipoArchivo === "excel") {

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      res.setHeader(
        "Content-Disposition",
        "attachment; filename=reporte_mensual.xlsx"
      );

      return res
        .status(200)
        .send(resultado);
    }

    if (filtros.tipoArchivo === "pdf") {

      res.setHeader(
        "Content-Type",
        "application/pdf"
      );

      res.setHeader(
        "Content-Disposition",
        "attachment; filename=reporte_mensual.pdf"
      );

      return res
        .status(200)
        .send(resultado);
    }

    return res.status(200).json({
      ok: true,
      data: resultado,
    });

  } catch (error) {

    console.error(
      "Error en descargarReporteMensual:",
      error
    );

    return res.status(500).json({
      ok: false,
      message:
        "Error al generar reporte",

      error: error.message,
    });
  }
}