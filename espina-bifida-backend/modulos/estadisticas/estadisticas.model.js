import oracledb from "oracledb";
import { getConnection } from "../../config/db.js";

export async function getEstadisticasModel() {
  let connection;

  try {
    connection = await getConnection();

    const query = `
      SELECT
        (
          SELECT COUNT(*)
          FROM (
            SELECT medicina_id AS id FROM inventario_medicinas
            UNION ALL
            SELECT equipo_m_id AS id FROM inventario_equipo_medico
          )
        ) AS total_articulos,

        (
          SELECT COUNT(*)
          FROM (
            SELECT cantidad_total FROM inventario_medicinas
            UNION ALL
            SELECT cantidad_total FROM inventario_equipo_medico
          )
          WHERE cantidad_total > 5
        ) AS existencias_normal,

        (
          SELECT COUNT(*)
          FROM (
            SELECT cantidad_total FROM inventario_medicinas
            UNION ALL
            SELECT cantidad_total FROM inventario_equipo_medico
          )
          WHERE cantidad_total BETWEEN 1 AND 5
        ) AS existencias_bajas,

        (
          SELECT COUNT(*)
          FROM (
            SELECT cantidad_total FROM inventario_medicinas
            UNION ALL
            SELECT cantidad_total FROM inventario_equipo_medico
          )
          WHERE cantidad_total = 0
        ) AS existencias_agotadas,

        (
          SELECT COUNT(*)
          FROM paciente
        ) AS total_pacientes,

        (
          SELECT COUNT(*)
          FROM paciente
          WHERE vive = 'SI'
        ) AS pacientes_activos,

        (
          SELECT (
            SELECT COUNT(*) FROM paciente
          ) - (
            SELECT COUNT(*) FROM paciente WHERE vive = 'SI'
          )
          FROM dual
        ) AS pacientes_inactivos,

        (
          SELECT COUNT(*)
          FROM paciente
          WHERE TRUNC(fecha_alta, 'MM') = TRUNC(SYSDATE, 'MM')
        ) AS pacientes_nuevos_mes,

        (
          SELECT COUNT(*)
          FROM evento_visita
          WHERE TRUNC(fecha_evento, 'MM') = TRUNC(SYSDATE, 'MM')
        ) AS visitas_mes,

        (
          SELECT COUNT(*)
          FROM eventos_servicios es
          INNER JOIN evento_visita ev
            ON es.evento_id = ev.evento_id
          WHERE TRUNC(ev.fecha_evento, 'MM') = TRUNC(SYSDATE, 'MM')
        ) AS servicios_realizados,

        (
          SELECT NVL(SUM(em.cantidad_resta), 0)
          FROM eventos_medicinas em
          INNER JOIN evento_visita ev
            ON em.evento_id = ev.evento_id
          WHERE TRUNC(ev.fecha_evento, 'MM') = TRUNC(SYSDATE, 'MM')
        ) AS medicinas_entregadas,

        (
          SELECT COUNT(*)
          FROM eventos_equipo_medico
          WHERE equipo_regresado = 'NO'
        ) AS equipo_sin_regresar,

        (
          SELECT NVL(SUM(cuota), 0)
          FROM evento_visita
          WHERE TRUNC(fecha_evento, 'MM') = TRUNC(SYSDATE, 'MM')
        ) AS ingresos_mes,

        (
          SELECT COUNT(*)
          FROM notificacion
          WHERE estado_proceso = 'pendiente'
        ) AS registros_pendientes,

        (
          SELECT COUNT(*)
          FROM notificacion
          WHERE TRUNC(fecha_creacion, 'MM') = TRUNC(SYSDATE, 'MM')
        ) AS notificaciones_mes,

        (
          SELECT COUNT(*)
          FROM evento_visita
        ) AS total_reportes

      FROM dual
    `;

    const result = await connection.execute(query, [], {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    return result.rows[0];
  } catch (error) {
    console.error("Error en getEstadisticasModel:", error);
    throw error;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}