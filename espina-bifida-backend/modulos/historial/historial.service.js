import { getConnection } from "../../config/db.js";

export async function obtenerHistorialPorPaciente(pacienteId) {
  let conn;

  try {
    conn = await getConnection();

    const result = await conn.execute(
      `SELECT *
       FROM (
          SELECT v.EVENTO_ID, v.MONTO_RECIBIDO, v.PACIENTE_ID, v.FECHA_EVENTO, 'servicio' AS tipo, s.NOMBRE_SERVICIO AS nombre, (s.COSTO * 1) AS precio, 1 AS cantidad
          FROM EVENTOS_SERVICIOS es
          JOIN EVENTO_VISITA v ON v.EVENTO_ID = es.EVENTO_ID
          JOIN SERVICIOS s ON es.SERVICIO_ID = s.SERVICIO_ID

          UNION ALL

          SELECT v.EVENTO_ID, v.MONTO_RECIBIDO, v.PACIENTE_ID, v.FECHA_EVENTO, 'medicamento' AS tipo, i.DESCRIPCION AS nombre, (i.PRECIO * m.CANTIDAD_RESTA) AS precio, m.CANTIDAD_RESTA AS cantidad
          FROM EVENTOS_MEDICINAS m
          JOIN EVENTO_VISITA v ON v.EVENTO_ID = m.EVENTO_ID
          JOIN INVENTARIO_MEDICINAS i ON i.MEDICINA_ID = m.MEDICINA_ID

          UNION ALL

          SELECT v.EVENTO_ID, v.MONTO_RECIBIDO, v.PACIENTE_ID, v.FECHA_EVENTO, 'equipo' AS tipo, iep.DESCRIPCION AS nombre, (iep.PRECIO * ep.CANTIDAD_RESTA) AS precio, ep.CANTIDAD_RESTA AS cantidad
          FROM EVENTOS_EQUIPO_MEDICO ep
          JOIN EVENTO_VISITA v ON v.EVENTO_ID = ep.EVENTO_ID
          JOIN INVENTARIO_EQUIPO_MEDICO iep ON iep.EQUIPO_M_ID = ep.EQUIPO_M_ID
       )
       WHERE PACIENTE_ID = :id
       ORDER BY FECHA_EVENTO DESC`,
      [pacienteId]
    );


    return result.rows;

  } catch (error) {
    console.error("Error en obtenerHistorialPorPaciente:");
    console.error(error);

    throw error;
  } finally {
    if (conn) {
      try {
        await conn.close();
        console.log("Conexión cerrada");
      } catch (err) {
        console.error("Error al cerrar conexión:", err);
      }
    }
  }
}