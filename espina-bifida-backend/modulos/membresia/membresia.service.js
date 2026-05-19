import oracledb from "oracledb";
import { getConnection } from "../../config/db.js";

export async function activarMembresia(pacienteId, fechaInicio) {
  let conn;

  try {
    conn = await getConnection();

    const result = await conn.execute(
      `
      SELECT membresia_id
      FROM MEMBRESIA
      WHERE paciente_id = :pacienteId
      `,
      { pacienteId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length > 0) {
      await conn.execute(
        `
        UPDATE MEMBRESIA
        SET 
          estatus = 'activo',
          fecha_inicio = TO_DATE(:fechaInicio, 'YYYY-MM-DD'),
          fecha_fin = ADD_MONTHS(TO_DATE(:fechaInicio, 'YYYY-MM-DD'), 12)
        WHERE paciente_id = :pacienteId
        `,
        {
          pacienteId,
          fechaInicio,
        },
        { autoCommit: true }
      );
    } else {
      await conn.execute(
        `
        INSERT INTO MEMBRESIA (
          membresia_id,
          paciente_id,
          estatus,
          fecha_inicio,
          fecha_fin
        ) VALUES (
          MEMBRESIA_SEQ.NEXTVAL, 
          :pacienteId,
          'activo',
          TO_DATE(:fechaInicio, 'YYYY-MM-DD'),
          ADD_MONTHS(TO_DATE(:fechaInicio, 'YYYY-MM-DD'), 12)
        )
        `,
        {
          pacienteId,
          fechaInicio,
        },
        { autoCommit: true }
      );
    }

    return {
      ok: true,
      message: "Membresía activada correctamente",
    };
  } catch (error) {
    console.error("Error al activar membresía:", error);
    throw error;
  } finally {
    if (conn) await conn.close();
  }
}

export async function obtenerMembresiaPorPacienteId(pacienteId) {
  let conn;

  try {
    conn = await getConnection();
    const result = await conn.execute(
      `
      SELECT *
      FROM MEMBRESIA
      WHERE paciente_id = :pacienteId
      `,
      { pacienteId: Number(pacienteId) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error("Error al obtener membresía por paciente:", error);
    throw error;
  } finally {
    if (conn) await conn.close();
  }
}

export async function desactivarMembresia(pacienteId) {
  let conn;

  try {
    conn = await getConnection();
    await conn.execute(
      `
      UPDATE MEMBRESIA
      SET estatus = 'inactivo'
      WHERE paciente_id = :pacienteId
      `,
      { pacienteId },
      { autoCommit: true }
    );

    return {
      ok: true,
      message: "Membresía desactivada correctamente",
    };
  } catch (error) {
    console.error("Error al desactivar membresía:", error);
    throw error;
  } finally {
    if (conn) await conn.close();
  }
}
