import { getConnection } from "../../../config/db.js"; 
import oracledb from "oracledb";

export async function getPacienteDetalle(pacienteId) {
    let conn;
    try {
      conn = await getConnection();
      const result = await conn.execute(
        `SELECT 
          p.PACIENTE_ID,
          p.NOMBRE,
          p.EMAIL,
          p.EMERGENCIA_TELEFONO,
          p.ESTADO_RESIDENCIA,
          p.FOTOGRAFIA,
          p.FECHA_ALTA,
          m.FECHA_INICIO,
          m.FECHA_FIN
        FROM PACIENTE p
        LEFT JOIN MEMBRESIA m ON p.PACIENTE_ID = m.PACIENTE_ID
        WHERE p.PACIENTE_ID = :pacienteId`,
        { pacienteId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows[0] || null;
    } finally {
      if (conn) await conn.close();
    }
  }