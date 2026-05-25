import { getConnection } from "../../../config/db.js";
import { obtenerMembresiaPorPacienteId } from "../../../modulos/membresia/membresia.service.js";
import oracledb from "oracledb";

export async function getPacienteDetalle(pacienteId) {
  let conn;

  try {
    conn = await getConnection();

    const result = await conn.execute(
      `SELECT 
          p.PACIENTE_ID,
          p.NOMBRE,
          p.APELLIDO,
          p.EMAIL,
          p.EMERGENCIA_TELEFONO,
          p.ESTADO_RESIDENCIA,
          p.FECHA_ALTA
       FROM PACIENTE p
       WHERE p.PACIENTE_ID = :pacienteId`,
      { pacienteId: Number(pacienteId) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const row = result.rows[0];

    if (!row) return null;

    const membresia = await obtenerMembresiaPorPacienteId(pacienteId);

    return {
      PACIENTE_ID: row.PACIENTE_ID ?? null,
      NOMBRE: row.NOMBRE ?? null,
      APELLIDO: row.APELLIDO ?? null,
      EMAIL: row.EMAIL ?? null,
      EMERGENCIA_TELEFONO: row.EMERGENCIA_TELEFONO ?? null,
      ESTADO_RESIDENCIA: row.ESTADO_RESIDENCIA ?? null,
      FECHA_ALTA: row.FECHA_ALTA ? new Date(row.FECHA_ALTA).toISOString() : null,
      FECHA_INICIO: membresia?.FECHA_INICIO ? new Date(membresia.FECHA_INICIO).toISOString() : null,
      FECHA_FIN: membresia?.FECHA_FIN ? new Date(membresia.FECHA_FIN).toISOString() : null,
    };
  } finally {
    if (conn) await conn.close();
  }
}