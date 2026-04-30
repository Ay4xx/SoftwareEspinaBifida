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
        p.apellido,
        p.curp,
        p.ciudad_residencia,
        p.estado_residencia,
        p.telefono_casa,
        p.telefono_celular
      FROM NOTIFICACION n
      INNER JOIN PACIENTE p ON n.paciente_id = p.paciente_id
      WHERE (:estado IS NULL OR LOWER(n.estado_proceso) = LOWER(:estado))
        AND LOWER(n.estado_proceso) != 'aprobado'
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

export async function getNotificacionById(notificacionId) {
  let conn;
  try {
    conn = await getConnection();
    const sql = `
      SELECT
        n.notificacion_id,
        n.estado_proceso,
        TO_CHAR(n.fecha_creacion, 'DD/MM/YYYY HH24:MI') AS fecha_creacion,
        p.paciente_id,
        p.nombre,
        p.apellido,
        p.curp,
        p.genero,
        TO_CHAR(p.fecha_nacimiento, 'YYYY-MM-DD') AS fecha_nacimiento,
        p.direccion,
        p.ciudad_residencia,
        p.estado_residencia,
        p.codigo_postal,
        p.telefono_casa,
        p.telefono_celular,
        p.email,
        p.emergencia_contacto,
        p.emergencia_telefono,
        p.lugar_nacimiento,
        p.hospital_nacimiento,
        p.sangre_tipo,
        p.valvula,
        p.etapa_vida,
        p.notas_adicionales,
        p.fotografia,
        m.lugar_nacimiento   AS tutor_lugar_nacimiento,
        m.edad               AS tutor_edad,
        m.ocupacion          AS tutor_ocupacion,
        m.escolaridad        AS tutor_escolaridad,
        m.parentesco         AS tutor_parentesco,
        m.seguro_medico      AS madre_seguro_medico,
        m.cd_embarazo        AS cd_embarazo,
        m.acido_folico       AS acido_folico,
        m.citas_control      AS citas_control
      FROM NOTIFICACION n
      INNER JOIN PACIENTE p ON n.paciente_id = p.paciente_id
      LEFT JOIN HISTORIAL_MADRE m ON m.paciente_id = p.paciente_id  
      WHERE n.notificacion_id = :notificacionId
    `;
    const result = await conn.execute(
      sql,
      { notificacionId: Number(notificacionId) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (!result.rows || result.rows.length === 0) return null;
    const row = result.rows[0];

    // Convertir BLOB a base64
    let fotoBase64 = null;
    if (row.FOTOGRAFIA) {
      const chunks = [];
      await new Promise((resolve, reject) => {
        row.FOTOGRAFIA.on("data", (chunk) => chunks.push(chunk));
        row.FOTOGRAFIA.on("end", resolve);
        row.FOTOGRAFIA.on("error", reject);
      });
      const buffer = Buffer.concat(chunks);
      fotoBase64 = `data:image/jpeg;base64,${buffer.toString("base64")}`;
    }

    return {
      NOTIFICACION_ID:     row.NOTIFICACION_ID     ?? null,
      ESTADO_PROCESO:      row.ESTADO_PROCESO       ?? null,
      FECHA_CREACION:      row.FECHA_CREACION       ?? null,
      PACIENTE_ID:         row.PACIENTE_ID          ?? null,
      NOMBRE:              row.NOMBRE               ?? null,
      APELLIDO:            row.APELLIDO             ?? null,
      CURP:                row.CURP                 ?? null,
      GENERO:              row.GENERO               ?? null,
      FECHA_NACIMIENTO:    row.FECHA_NACIMIENTO     ?? null,
      DIRECCION:           row.DIRECCION            ?? null,
      CIUDAD_RESIDENCIA:   row.CIUDAD_RESIDENCIA    ?? null,
      ESTADO_RESIDENCIA:   row.ESTADO_RESIDENCIA    ?? null,
      CODIGO_POSTAL:       row.CODIGO_POSTAL        ?? null,
      TELEFONO_CASA:       row.TELEFONO_CASA        ?? null,
      TELEFONO_CELULAR:    row.TELEFONO_CELULAR     ?? null,
      EMAIL:               row.EMAIL                ?? null,
      EMERGENCIA_CONTACTO: row.EMERGENCIA_CONTACTO  ?? null,
      EMERGENCIA_TELEFONO: row.EMERGENCIA_TELEFONO  ?? null,
      LUGAR_NACIMIENTO:    row.LUGAR_NACIMIENTO     ?? null,
      HOSPITAL_NACIMIENTO: row.HOSPITAL_NACIMIENTO  ?? null,
      SANGRE_TIPO:         row.SANGRE_TIPO          ?? null,
      VALVULA:             row.VALVULA              ?? null,
      ETAPA_VIDA:          row.ETAPA_VIDA           ?? null,
      NOTAS_ADICIONALES:   row.NOTAS_ADICIONALES    ?? null,
      FOTO:                fotoBase64,
      TUTOR_LUGAR_NACIMIENTO: row.TUTOR_LUGAR_NACIMIENTO ?? null,
      TUTOR_EDAD:             row.TUTOR_EDAD             ?? null,
      TUTOR_OCUPACION:        row.TUTOR_OCUPACION        ?? null,
      TUTOR_ESCOLARIDAD:      row.TUTOR_ESCOLARIDAD      ?? null,
      TUTOR_PARENTESCO:       row.TUTOR_PARENTESCO       ?? null,
      MADRE_SEGURO_MEDICO:    row.MADRE_SEGURO_MEDICO    ?? null,
      CD_EMBARAZO:            row.CD_EMBARAZO            ?? null,
      ACIDO_FOLICO:           row.ACIDO_FOLICO            ?? null,
      CITAS_CONTROL:          row.CITAS_CONTROL           ?? null,
    };
  } catch (error) {
    console.error("Error en getNotificacionById:", error);
    throw error;
  } finally {
    if (conn) await conn.close();
  }
}

export async function aprobarNotificacion(notificacionId, usuarioId) {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `UPDATE NOTIFICACION SET estado_proceso = 'aprobado'
      WHERE notificacion_id = :notificacionId AND estado_proceso = 'pendiente'`,
      { notificacionId: Number(notificacionId) },
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
    const result = await conn.execute(
      `UPDATE NOTIFICACION SET estado_proceso = 'rechazado'
      WHERE notificacion_id = :notificacionId AND estado_proceso = 'pendiente'`,
      { notificacionId: Number(notificacionId) },
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

export async function eliminarNotificacionesAntiguas() {
  let conn;
  try {
    conn = await getConnection();

    const pacientes = await conn.execute(
      `SELECT DISTINCT paciente_id FROM NOTIFICACION
      WHERE TRUNC(fecha_creacion) <= TRUNC(SYSDATE) - 14
      AND LOWER(estado_proceso) != 'aprobado'`,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const ids = pacientes.rows.map((r) => r.PACIENTE_ID);

    if (ids.length === 0) {
      console.log("No hay notificaciones antiguas que eliminar");
      return 0;
    }

    const placeholders = ids.map((_, i) => `:id${i}`).join(",");
    const binds = Object.fromEntries(ids.map((id, i) => [`id${i}`, id]));

    await conn.execute(`DELETE FROM NOTIFICACION WHERE paciente_id IN (${placeholders})`, binds, { autoCommit: true });
    await conn.execute(`DELETE FROM PACIENTE_PADECIMIENTO WHERE paciente_id IN (${placeholders})`, binds, { autoCommit: true });
    await conn.execute(`DELETE FROM HISTORIAL_MADRE WHERE paciente_id IN (${placeholders})`, binds, { autoCommit: true });
    await conn.execute(`DELETE FROM HISTORIAL_PADRE WHERE paciente_id IN (${placeholders})`, binds, { autoCommit: true });
    await conn.execute(`DELETE FROM EVENTO_VISITA WHERE paciente_id IN (${placeholders})`, binds, { autoCommit: true });
    await conn.execute(`DELETE FROM MEMBRESIA WHERE paciente_id IN (${placeholders})`, binds, { autoCommit: true });
    await conn.execute(`DELETE FROM PACIENTE WHERE paciente_id IN (${placeholders})`, binds, { autoCommit: true });

    console.log(`[Limpieza] Eliminados ${ids.length} pacientes y sus notificaciones antiguas`);
    return ids.length;
  } catch (error) {
    console.error("Error en eliminarNotificacionesAntiguas:", error);
    throw error;
  } finally {
    if (conn) await conn.close();
  }
}