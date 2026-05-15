import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

import { getEstadisticasModel } from "./estadisticas.model.js";

export async function getEstadisticasService() {
  const stats = await getEstadisticasModel();

  return {
    totalArticulos: stats.TOTAL_ARTICULOS || 0,
    existenciasNormal: stats.EXISTENCIAS_NORMAL || 0,
    existenciasBajas: stats.EXISTENCIAS_BAJAS || 0,
    existenciasAgotadas: stats.EXISTENCIAS_AGOTADAS || 0,

    totalPacientes: stats.TOTAL_PACIENTES || 0,
    pacientesActivos: stats.PACIENTES_ACTIVOS || 0,
    pacientesInactivos: stats.PACIENTES_INACTIVOS || 0,
    pacientesNuevosMes: stats.PACIENTES_NUEVOS_MES || 0,

    visitasMes: stats.VISITAS_MES || 0,
    serviciosRealizados: stats.SERVICIOS_REALIZADOS || 0,
    medicinasEntregadas: stats.MEDICINAS_ENTREGADAS || 0,
    equipoSinRegresar: stats.EQUIPO_SIN_REGRESAR || 0,

    ingresosMes: stats.INGRESOS_MES || 0,
    registrosPendientes: stats.REGISTROS_PENDIENTES || 0,
    notificacionesMes: stats.NOTIFICACIONES_MES || 0,
    totalReportes: stats.TOTAL_REPORTES || 0,
  };
}

export async function descargarReporteMensualService(
  filtros
) {

  const stats = await getEstadisticasModel();

  const response = {};

  if (filtros.inventario) {
    response.inventario = {
      totalArticulos:
        stats.TOTAL_ARTICULOS || 0,

      existenciasNormal:
        stats.EXISTENCIAS_NORMAL || 0,

      existenciasBajas:
        stats.EXISTENCIAS_BAJAS || 0,

      existenciasAgotadas:
        stats.EXISTENCIAS_AGOTADAS || 0,
    };
  }

  if (filtros.pacientes) {
    response.pacientes = {
      totalPacientes:
        stats.TOTAL_PACIENTES || 0,

      pacientesActivos:
        stats.PACIENTES_ACTIVOS || 0,

      pacientesInactivos:
        stats.PACIENTES_INACTIVOS || 0,

      pacientesNuevosMes:
        stats.PACIENTES_NUEVOS_MES || 0,
    };
  }

  if (filtros.servicios) {
    response.servicios = {
      visitasMes:
        stats.VISITAS_MES || 0,

      serviciosRealizados:
        stats.SERVICIOS_REALIZADOS || 0,

      medicinasEntregadas:
        stats.MEDICINAS_ENTREGADAS || 0,

      equipoSinRegresar:
        stats.EQUIPO_SIN_REGRESAR || 0,
    };
  }

  if (filtros.reportes) {
    response.reportes = {
      ingresosMes:
        stats.INGRESOS_MES || 0,

      registrosPendientes:
        stats.REGISTROS_PENDIENTES || 0,

      notificacionesMes:
        stats.NOTIFICACIONES_MES || 0,

      totalReportes:
        stats.TOTAL_REPORTES || 0,
    };
  }

  if (filtros.tipoArchivo === "csv") {
    return convertirACSV(response);
  }

  if (filtros.tipoArchivo === "excel") {
    return await convertirAExcel(response);
  }

  if (filtros.tipoArchivo === "pdf") {
    return await convertirAPDF(response);
  }
  return response;
}

function convertirACSV(data) {

  let csv = "";

  Object.entries(data).forEach(
    ([seccion, valores]) => {

      csv += `${seccion.toUpperCase()}\n`;

      csv += "campo,valor\n";

      if (!valores) return;

      Object.entries(valores).forEach(
        ([key, value]) => {

          csv += `${key},${value}\n`;
        }
      );

      csv += "\n";
    }
  );

  return csv;
}

async function convertirAExcel(data) {

  const workbook = new ExcelJS.Workbook();

  const worksheet =
    workbook.addWorksheet("Reporte");

  worksheet.columns = [
    {
      header: "Sección",
      key: "seccion",
      width: 25,
    },
    {
      header: "Campo",
      key: "campo",
      width: 35,
    },
    {
      header: "Valor",
      key: "valor",
      width: 20,
    },
  ];

  Object.entries(data).forEach(
    ([seccion, valores]) => {

      if (!valores) return;

      Object.entries(valores).forEach(
        ([key, value]) => {

          worksheet.addRow({
            seccion,
            campo: key,
            valor: value,
          });
        }
      );
    }
  );

  worksheet.getRow(1).font = {
    bold: true,
  };

  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",

    fgColor: {
      argb: "DCE6F1",
    },
  };

  const buffer =
    await workbook.xlsx.writeBuffer();

  return buffer;
}

async function convertirAPDF(data) {

  return new Promise((resolve) => {

    const doc = new PDFDocument({
      margin: 50,
    });

    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));

    doc.on("end", () => {

      const pdfData =
        Buffer.concat(buffers);

      resolve(pdfData);
    });

    doc
      .fontSize(22)
      .text(
        "Reporte Mensual",
        {
          align: "center",
        }
      );

    doc.moveDown(2);

    Object.entries(data).forEach(
      ([seccion, valores]) => {

        doc
          .fontSize(18)
          .text(
            seccion.toUpperCase(),
            {
              underline: true,
            }
          );

        doc.moveDown(0.5);

        if (!valores) return;

        Object.entries(valores).forEach(
          ([key, value]) => {

            doc
              .fontSize(12)
              .text(
                `${key}: ${value}`
              );
          }
        );

        doc.moveDown(1.5);
      }
    );

    doc.end();
  });
}