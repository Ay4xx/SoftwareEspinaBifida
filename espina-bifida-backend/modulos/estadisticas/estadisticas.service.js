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