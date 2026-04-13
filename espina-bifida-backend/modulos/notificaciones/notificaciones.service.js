import { getConnection } from "../../config/db.js";
import oracledb from "oracledb";
import { mapNotificacionToCard } from "./notificaciones.mapper.js";

export async function getNotificaciones(estado = null) {
  let conn;

  try {
    conn = await getConnection();

    const sql = `
      SELECT
        n.notificacion_id,
        n.paciente_id,
        n.usuario_id,
        n.titulo,
        n.mensaje,
        n.estado_proceso,
        TO_CHAR(n.fecha_creacion, 'DD/MM/YYYY HH24:MI') AS fecha_creacion,
        p.nombre,
        p.curp,
        p.ciudad_residencia,
        p.estado_residencia,
        p.telefono_casa,
        p.telefono_celular
      FROM NOTIFICACION n
      INNER JOIN PACIENTE p
        ON n.paciente_id = p.paciente_id
      WHERE (:estado IS NULL OR LOWER(n.estado_proceso) = LOWER(:estado))
      ORDER BY n.fecha_creacion DESC
    `;

    const result = await conn.execute(
      sql,
      { estado: estado?.trim() ? estado.trim() : null },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows.map(mapNotificacionToCard);
  } catch (error) {
    console.error("Error en getNotificaciones:", error);
    throw error;
  } finally {
    if (conn) await conn.close();
  }
}

export async function aprobarNotificacion(notificacionId, usuarioId) {
  let conn;

  try {
    conn = await getConnection();

    const sql = `
  UPDATE NOTIFICACION
  SET estado_proceso = 'aprobado'
  WHERE notificacion_id = :notificacionId
    AND estado_proceso = 'pendiente'
`;

    const result = await conn.execute(
      sql,
      {
        notificacionId: Number(notificacionId),
      },
      { autoCommit: true }
    );

    return result.rowsAffected > 0;
  } catch (error) {
    console.error("Error en aprobarNotificacion:", error);
    throw error;
  } finally {
    if (conn) await conn.close();
  }
}

export async function rechazarNotificacion(notificacionId, usuarioId) {
  let conn;

  try {
    conn = await getConnection();

    const sql = `
  UPDATE NOTIFICACION
  SET estado_proceso = 'rechazado'
  WHERE notificacion_id = :notificacionId
    AND estado_proceso = 'pendiente'
`;

    const result = await conn.execute(
      sql,
      {
        notificacionId: Number(notificacionId),
        
      },
      { autoCommit: true }
    );

    return result.rowsAffected > 0;
  } catch (error) {
    console.error("Error en rechazarNotificacion:", error);
    throw error;
  } finally {
    if (conn) await conn.close();
  }
}