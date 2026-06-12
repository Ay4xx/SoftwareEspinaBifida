import oracledb from "oracledb";
import { getConnection } from "../../config/db.js";

export async function getEstadisticasModel({ fechaInicio, fechaFin } = {}) {
  let connection;

  try {
    connection = await getConnection();

    const hasFecha = fechaInicio && fechaFin;
    const fi = hasFecha ? new Date(fechaInicio) : null;
    const ff = hasFecha ? new Date(fechaFin)    : null;
    const binds = hasFecha ? { fi, ff } : {};

    // Genera fragmento WHERE condicional para cada columna de fecha
    const w = (col) => hasFecha ? `AND ${col} BETWEEN :fi AND :ff` : "";

    const opts = { outFormat: oracledb.OUT_FORMAT_OBJECT };

    // ── Query 1: KPIs generales ──────────────────────────────────────────────
    const queryKPIs = `
      SELECT
        /* PACIENTES */
        (SELECT COUNT(*) FROM paciente p
         LEFT JOIN notificacion n ON n.paciente_id = p.paciente_id
         WHERE (n.estado_proceso = 'aprobado' OR n.notificacion_id IS NULL)
         ${w("p.fecha_alta")}) AS total_pacientes,

        (SELECT COUNT(*) FROM paciente p
        LEFT JOIN notificacion n ON n.paciente_id = p.paciente_id
        WHERE (n.estado_proceso = 'aprobado' OR n.notificacion_id IS NULL)
        AND ${hasFecha
          ? "p.fecha_alta BETWEEN :fi AND :ff"
          : "TRUNC(p.fecha_alta,'MM') = TRUNC(SYSDATE,'MM')"
        }) AS pacientes_nuevos_mes,

        (SELECT COUNT(*) FROM paciente p
         LEFT JOIN notificacion n ON n.paciente_id = p.paciente_id
         WHERE (n.estado_proceso = 'aprobado' OR n.notificacion_id IS NULL)
         AND p.valvula = 'SI'
         ${w("p.fecha_alta")}) AS pacientes_con_valvula,

        (SELECT COUNT(DISTINCT pp.paciente_id) FROM paciente_padecimiento pp
         LEFT JOIN notificacion n ON n.paciente_id = pp.paciente_id
         WHERE (n.estado_proceso = 'aprobado' OR n.notificacion_id IS NULL)) AS pacientes_con_padecimientos,

        /* CITAS */
        (SELECT COUNT(*) FROM agenda_citas WHERE 1=1
         ${w("fecha_cita")}) AS total_citas,

        (SELECT COUNT(*) FROM agenda_citas WHERE estatus_cita = 'ATENDIDA'
         ${w("fecha_cita")}) AS citas_atendidas,

        (SELECT COUNT(*) FROM agenda_citas WHERE estatus_cita = 'CANCELADA'
         ${w("fecha_cita")}) AS citas_canceladas,

        (SELECT COUNT(*) FROM agenda_citas WHERE estatus_cita = 'PENDIENTE'
         ${w("fecha_cita")}) AS citas_pendientes,


        (SELECT COUNT(*) FROM agenda_citas
          WHERE ${hasFecha
            ? "fecha_cita BETWEEN :fi AND :ff"
            : "TRUNC(fecha_cita,'MM') = TRUNC(SYSDATE,'MM')"
          }) AS citas_mes,

        /* VISITAS */
        (SELECT COUNT(*) FROM evento_visita WHERE 1=1
         ${w("fecha_evento")}) AS total_visitas,

        (SELECT COUNT(*) FROM agenda_citas
        WHERE ${hasFecha
          ? "fecha_cita BETWEEN :fi AND :ff"
          : "TRUNC(fecha_cita,'MM') = TRUNC(SYSDATE,'MM')"
        }) AS citas_mes,

        (SELECT NVL(SUM(cuota),0) FROM evento_visita WHERE 1=1
         ${w("fecha_evento")}) AS cuotas_totales,

        (SELECT NVL(SUM(monto_recibido),0) FROM evento_visita WHERE 1=1
         ${w("fecha_evento")}) AS ingresos_totales,

        (SELECT NVL(SUM(descuento),0) FROM evento_visita WHERE 1=1
         ${w("fecha_evento")}) AS descuentos_totales,

        (SELECT ROUND(AVG(monto_recibido),2) FROM evento_visita
         WHERE monto_recibido IS NOT NULL
         ${w("fecha_evento")}) AS ingreso_promedio_visita,

        (SELECT ROUND(NVL(SUM(monto_recibido),0)*100/NULLIF(NVL(SUM(cuota),0),0),2)
         FROM evento_visita WHERE 1=1
         ${w("fecha_evento")}) AS porcentaje_pago_completo,

        /* MEMBRESÍAS */
        (SELECT COUNT(DISTINCT paciente_id) FROM membresia WHERE estatus = 'activo')   AS membresias_activas,
        (SELECT COUNT(DISTINCT paciente_id) FROM membresia WHERE estatus = 'inactivo') AS membresias_inactivas,
        (SELECT COUNT(*) FROM membresia WHERE fecha_fin < SYSDATE)                     AS membresias_vencidas,

        /* SERVICIOS */
        (SELECT COUNT(*) FROM eventos_servicios es
         INNER JOIN evento_visita ev ON es.evento_id = ev.evento_id
         WHERE 1=1 ${w("ev.fecha_evento")}) AS total_servicios_realizados,

        (SELECT COUNT(*) FROM agenda_citas
        WHERE ${hasFecha
          ? "fecha_cita BETWEEN :fi AND :ff"
          : "TRUNC(fecha_cita,'MM') = TRUNC(SYSDATE,'MM')"
        }) AS citas_mes,

        /* MEDICINAS */
        (SELECT COUNT(*) FROM inventario_medicinas) AS total_medicinas,
        (SELECT NVL(SUM(cantidad_total),0) FROM inventario_medicinas) AS stock_total_medicinas,
        (SELECT COUNT(*) FROM inventario_medicinas WHERE cantidad_total < 10) AS medicinas_bajo_stock,
        (SELECT NVL(SUM(cantidad_total * precio),0) FROM inventario_medicinas) AS valor_inventario_medicinas,

        (SELECT NVL(SUM(em.cantidad_resta),0)
         FROM eventos_medicinas em
         INNER JOIN evento_visita ev ON em.evento_id = ev.evento_id
         WHERE 1=1 ${w("ev.fecha_evento")}) AS medicinas_utilizadas,

        (SELECT COUNT(*) FROM actualizacion_inventario WHERE 1=1
         ${w("fecha_actualizacion")}) AS actualizaciones_inventario,

        /* EQUIPO MÉDICO */
        (SELECT COUNT(*) FROM inventario_equipo_medico) AS total_equipos,
        (SELECT COUNT(*) FROM inventario_equipo_medico WHERE cantidad_total <= 5) AS equipos_bajo_stock,
        (SELECT NVL(SUM(cantidad_total),0) FROM inventario_equipo_medico) AS cantidad_total_equipos,

        (SELECT COUNT(*) FROM eventos_equipo_medico
         WHERE equipo_regresado = 'NO'
         ${w("fecha_inicio")}) AS equipos_en_uso,

        (SELECT COUNT(*) FROM eventos_equipo_medico
         WHERE equipo_regresado = 'SI'
         ${w("fecha_inicio")}) AS equipos_regresados,

        (SELECT ROUND(
          (SELECT COUNT(*) FROM eventos_equipo_medico
           WHERE equipo_regresado = 'SI' ${w("fecha_inicio")}) * 100 /
          NULLIF(
            (SELECT COUNT(*) FROM eventos_equipo_medico WHERE 1=1 ${w("fecha_inicio")}),
          0),2)
         FROM dual) AS porcentaje_retorno_equipos,

        (SELECT NVL(SUM(precio * cantidad_total),0) FROM inventario_equipo_medico) AS valor_total_equipos,

        /* NOTIFICACIONES */
        (SELECT COUNT(*) FROM notificacion
         WHERE estado_proceso = 'rechazado'
         ${w("fecha_creacion")}) AS pacientes_rechazados,

        (SELECT ROUND(
          (SELECT COUNT(*) FROM notificacion
           WHERE estado_proceso = 'aprobado' ${w("fecha_creacion")}) * 100 /
          NULLIF(
            (SELECT COUNT(*) FROM notificacion WHERE 1=1 ${w("fecha_creacion")}),
          0),2)
         FROM dual) AS tasa_aprobacion_pacientes,

        (SELECT COUNT(*) FROM notificacion
         WHERE fecha_creacion IS NOT NULL
         ${w("fecha_creacion")}) AS notificaciones_mes

      FROM dual
    `;

    // ── Queries de series por mes ────────────────────────────────────────────
    const queryVisitasMes = `
      SELECT TO_CHAR(fecha_evento,'YYYY-MM') AS mes, COUNT(*) AS total
      FROM evento_visita
      WHERE 1=1 ${w("fecha_evento")}
      GROUP BY TO_CHAR(fecha_evento,'YYYY-MM')
      ORDER BY mes
    `;

    const queryPacientesMes = `
      SELECT TO_CHAR(p.fecha_alta,'YYYY-MM') AS mes, COUNT(*) AS total
      FROM paciente p
      LEFT JOIN notificacion n ON n.paciente_id = p.paciente_id
      WHERE p.fecha_alta IS NOT NULL
        AND (n.estado_proceso = 'aprobado' OR n.notificacion_id IS NULL)
        ${w("p.fecha_alta")}
      GROUP BY TO_CHAR(p.fecha_alta,'YYYY-MM')
      ORDER BY mes
    `;

    const queryCitasMes = `
      SELECT TO_CHAR(fecha_cita,'YYYY-MM') AS mes, COUNT(*) AS total
      FROM agenda_citas
      WHERE 1=1 ${w("fecha_cita")}
      GROUP BY TO_CHAR(fecha_cita,'YYYY-MM')
      ORDER BY mes
    `;

    const queryCitasAtendidas = `
      SELECT TO_CHAR(fecha_cita,'YYYY-MM') AS mes, COUNT(*) AS total
      FROM agenda_citas
      WHERE estatus_cita = 'ATENDIDA' ${w("fecha_cita")}
      GROUP BY TO_CHAR(fecha_cita,'YYYY-MM')
      ORDER BY mes
    `;

    const queryCitasCanceladas = `
      SELECT TO_CHAR(fecha_cita,'YYYY-MM') AS mes, COUNT(*) AS total
      FROM agenda_citas
      WHERE estatus_cita = 'CANCELADA' ${w("fecha_cita")}
      GROUP BY TO_CHAR(fecha_cita,'YYYY-MM')
      ORDER BY mes
    `;

    const queryIngresosMes = `
      SELECT TO_CHAR(fecha_evento,'YYYY-MM') AS mes, NVL(SUM(monto_recibido),0) AS total
      FROM evento_visita
      WHERE 1=1 ${w("fecha_evento")}
      GROUP BY TO_CHAR(fecha_evento,'YYYY-MM')
      ORDER BY mes
    `;

    const queryDescuentosMes = `
      SELECT TO_CHAR(fecha_evento,'YYYY-MM') AS mes, NVL(SUM(descuento),0) AS total
      FROM evento_visita
      WHERE 1=1 ${w("fecha_evento")}
      GROUP BY TO_CHAR(fecha_evento,'YYYY-MM')
      ORDER BY mes
    `;

    const queryServiciosMes = `
      SELECT TO_CHAR(ev.fecha_evento,'YYYY-MM') AS mes, COUNT(*) AS total
      FROM eventos_servicios es
      INNER JOIN evento_visita ev ON es.evento_id = ev.evento_id
      WHERE 1=1 ${w("ev.fecha_evento")}
      GROUP BY TO_CHAR(ev.fecha_evento,'YYYY-MM')
      ORDER BY mes
    `;

    const queryMedicinasUtilizadasMes = `
      SELECT TO_CHAR(ev.fecha_evento,'YYYY-MM') AS mes, NVL(SUM(em.cantidad_resta),0) AS total
      FROM eventos_medicinas em
      INNER JOIN evento_visita ev ON em.evento_id = ev.evento_id
      WHERE 1=1 ${w("ev.fecha_evento")}
      GROUP BY TO_CHAR(ev.fecha_evento,'YYYY-MM')
      ORDER BY mes
    `;

    const queryActualizacionesMes = `
      SELECT TO_CHAR(fecha_actualizacion,'YYYY-MM') AS mes, COUNT(*) AS total
      FROM actualizacion_inventario
      WHERE 1=1 ${w("fecha_actualizacion")}
      GROUP BY TO_CHAR(fecha_actualizacion,'YYYY-MM')
      ORDER BY mes
    `;

    const queryNotificacionesMes = `
      SELECT TO_CHAR(fecha_creacion,'YYYY-MM') AS mes, COUNT(*) AS total
      FROM notificacion
      WHERE fecha_creacion IS NOT NULL ${w("fecha_creacion")}
      GROUP BY TO_CHAR(fecha_creacion,'YYYY-MM')
      ORDER BY mes
    `;

    const queryEquiposEnUsoMes = `
      SELECT TO_CHAR(fecha_inicio,'YYYY-MM') AS mes, COUNT(*) AS total
      FROM eventos_equipo_medico
      WHERE equipo_regresado = 'NO' ${w("fecha_inicio")}
      GROUP BY TO_CHAR(fecha_inicio,'YYYY-MM')
      ORDER BY mes
    `;

    const [
      resKPIs,
      resVisitasMes,
      resPacientesMes,
      resCitasMes,
      resCitasAtendidas,
      resCitasCanceladas,
      resIngresosMes,
      resDescuentosMes,
      resServiciosMes,
      resMedicinasUtilizadasMes,
      resActualizacionesMes,
      resNotificacionesMes,
      resEquiposEnUsoMes,
    ] = await Promise.all([
      connection.execute(queryKPIs,                   binds, opts),
      connection.execute(queryVisitasMes,             binds, opts),
      connection.execute(queryPacientesMes,           binds, opts),
      connection.execute(queryCitasMes,               binds, opts),
      connection.execute(queryCitasAtendidas,         binds, opts),
      connection.execute(queryCitasCanceladas,        binds, opts),
      connection.execute(queryIngresosMes,            binds, opts),
      connection.execute(queryDescuentosMes,          binds, opts),
      connection.execute(queryServiciosMes,           binds, opts),
      connection.execute(queryMedicinasUtilizadasMes, binds, opts),
      connection.execute(queryActualizacionesMes,     binds, opts),
      connection.execute(queryNotificacionesMes,      binds, opts),
      connection.execute(queryEquiposEnUsoMes,        binds, opts),
    ]);

    const toSerie = (rows) =>
      rows.map((r) => ({ mes: r.MES, total: Number(r.TOTAL) }));

    return {
      kpis: resKPIs.rows[0],
      series: {
        visitasMes:               toSerie(resVisitasMes.rows),
        pacientesNuevosMes:       toSerie(resPacientesMes.rows),
        citasMes:                 toSerie(resCitasMes.rows),
        citasAtendidasMes:        toSerie(resCitasAtendidas.rows),
        citasCanceladasMes:       toSerie(resCitasCanceladas.rows),
        ingresosMes:              toSerie(resIngresosMes.rows),
        descuentosMes:            toSerie(resDescuentosMes.rows),
        serviciosMes:             toSerie(resServiciosMes.rows),
        medicinasUtilizadasMes:   toSerie(resMedicinasUtilizadasMes.rows),
        actualizacionesMes:       toSerie(resActualizacionesMes.rows),
        notificacionesMes:        toSerie(resNotificacionesMes.rows),
        equiposEnUsoMes:          toSerie(resEquiposEnUsoMes.rows),
      },
    };
  } catch (error) {
    console.error("Error en getEstadisticasModel:", error);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}