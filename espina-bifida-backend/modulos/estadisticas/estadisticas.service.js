import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

import { getEstadisticasModel } from "./estadisticas.model.js";

export async function getEstadisticasService() {
  const { kpis: k, series } = await getEstadisticasModel();

  return {
    /* ── Pacientes ── */
    pacientes: {
      total:              Number(k.TOTAL_PACIENTES)           || 0,
      vivos:              Number(k.PACIENTES_VIVOS)           || 0,
      fallecidos:         Number(k.PACIENTES_FALLECIDOS)      || 0,
      nuevos_mes:         Number(k.PACIENTES_NUEVOS_MES)      || 0,
      con_valvula:        Number(k.PACIENTES_CON_VALVULA)     || 0,
      con_padecimientos:  Number(k.PACIENTES_CON_PADECIMIENTOS) || 0,
    },

    /* ── Citas ── */
    citas: {
      total:      Number(k.TOTAL_CITAS)      || 0,
      atendidas:  Number(k.CITAS_ATENDIDAS)  || 0,
      canceladas: Number(k.CITAS_CANCELADAS) || 0,
      pendientes: Number(k.CITAS_PENDIENTES) || 0,
      mes:        Number(k.CITAS_MES)        || 0,
    },

    /* ── Visitas ── */
    visitas: {
      total:                  Number(k.TOTAL_VISITAS)           || 0,
      mes:                    Number(k.VISITAS_MES)             || 0,
      cuotas_totales:         Number(k.CUOTAS_TOTALES)          || 0,
      ingresos_totales:       Number(k.INGRESOS_TOTALES)        || 0,
      descuentos_totales:     Number(k.DESCUENTOS_TOTALES)      || 0,
      ingreso_promedio:       Number(k.INGRESO_PROMEDIO_VISITA) || 0,
      porcentaje_pago:        Number(k.PORCENTAJE_PAGO_COMPLETO)|| 0,
    },

    /* ── Membresías ── */
    membresias: {
      activas:   Number(k.MEMBRESIAS_ACTIVAS)   || 0,
      inactivas: Number(k.MEMBRESIAS_INACTIVAS) || 0,
      vencidas:  Number(k.MEMBRESIAS_VENCIDAS)  || 0,
    },

    /* ── Servicios ── */
    servicios: {
      total:  Number(k.TOTAL_SERVICIOS_REALIZADOS) || 0,
      mes:    Number(k.SERVICIOS_REALIZADOS_MES)   || 0,
    },

    /* ── Medicinas ── */
    medicinas: {
      total:                   Number(k.TOTAL_MEDICINAS)            || 0,
      stock_total:             Number(k.STOCK_TOTAL_MEDICINAS)      || 0,
      bajo_stock:              Number(k.MEDICINAS_BAJO_STOCK)       || 0,
      valor_inventario:        Number(k.VALOR_INVENTARIO_MEDICINAS) || 0,
      utilizadas:              Number(k.MEDICINAS_UTILIZADAS)       || 0,
      actualizaciones_inventario: Number(k.ACTUALIZACIONES_INVENTARIO) || 0,
    },

    /* ── Equipo médico ── */
    equipo: {
      total:               Number(k.TOTAL_EQUIPOS)              || 0,
      cantidad_total:      Number(k.CANTIDAD_TOTAL_EQUIPOS)     || 0,
      en_uso:              Number(k.EQUIPOS_EN_USO)             || 0,
      regresados:          Number(k.EQUIPOS_REGRESADOS)         || 0,
      porcentaje_retorno:  Number(k.PORCENTAJE_RETORNO_EQUIPOS) || 0,
      valor_total:         Number(k.VALOR_TOTAL_EQUIPOS)        || 0,
    },

    /* ── Notificaciones ── */
    notificaciones: {
      rechazados:        Number(k.PACIENTES_RECHAZADOS)      || 0,
      tasa_aprobacion:   Number(k.TASA_APROBACION_PACIENTES) || 0,
      mes:               Number(k.NOTIFICACIONES_MES)        || 0,
    },

    /* ── Series de tiempo ── */
    series,
  };
}

export async function descargarReporteMensualService(filtros) {
  const data = await getEstadisticasService();

  const response = {};

  if (filtros.pacientes)      response.pacientes      = data.pacientes;
  if (filtros.citas)          response.citas          = data.citas;
  if (filtros.visitas)        response.visitas        = data.visitas;
  if (filtros.membresias)     response.membresias     = data.membresias;
  if (filtros.servicios)      response.servicios      = data.servicios;
  if (filtros.medicinas)      response.medicinas      = data.medicinas;
  if (filtros.equipo)         response.equipo         = data.equipo;
  if (filtros.notificaciones) response.notificaciones = data.notificaciones;

  if (filtros.tipoArchivo === "csv")   return convertirACSV(response);
  if (filtros.tipoArchivo === "excel") return await convertirAExcel(response);
  if (filtros.tipoArchivo === "pdf")   return await convertirAPDF(response);

  return response;
}

// ── Helpers de exportación ───────────────────────────────────────────────────

function convertirACSV(data) {
  let csv = "";
  Object.entries(data).forEach(([seccion, valores]) => {
    csv += `${seccion.toUpperCase()}\ncampo,valor\n`;
    if (!valores) return;
    Object.entries(valores).forEach(([key, value]) => {
      csv += `${key},${value}\n`;
    });
    csv += "\n";
  });
  return csv;
}

async function convertirAExcel(data) {
  const workbook  = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Reporte");

  worksheet.columns = [
    { header: "Sección", key: "seccion", width: 25 },
    { header: "Campo",   key: "campo",   width: 35 },
    { header: "Valor",   key: "valor",   width: 20 },
  ];

  Object.entries(data).forEach(([seccion, valores]) => {
    if (!valores) return;
    Object.entries(valores).forEach(([key, value]) => {
      worksheet.addRow({ seccion, campo: key, valor: value });
    });
  });

  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: "pattern", pattern: "solid",
    fgColor: { argb: "DCE6F1" },
  };

  return workbook.xlsx.writeBuffer();
}

async function convertirAPDF(data) {
  return new Promise((resolve) => {
    const doc     = new PDFDocument({ margin: 50 });
    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));

    doc.fontSize(22).text("Reporte Mensual", { align: "center" });
    doc.moveDown(2);

    Object.entries(data).forEach(([seccion, valores]) => {
      doc.fontSize(18).text(seccion.toUpperCase(), { underline: true });
      doc.moveDown(0.5);
      if (!valores) return;
      Object.entries(valores).forEach(([key, value]) => {
        doc.fontSize(12).text(`${key}: ${value}`);
      });
      doc.moveDown(1.5);
    });

    doc.end();
  });
}