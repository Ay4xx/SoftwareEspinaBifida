import { getConnection } from "../../config/db.js";
import oracledb from "oracledb";

export async function obtenerHistorialFamiliar(pacienteId) {
  let conn;
  try {
    conn = await getConnection();
    oracledb.fetchAsString = [oracledb.CLOB];

    const result = await conn.execute(
      `SELECT 
          p.PADRE_ID,
          p.PACIENTE_ID,
          p.LUGAR_NACIMIENTO   AS PADRE_LUGAR_NACIMIENTO,
          p.ESCOLARIDAD        AS PADRE_ESCOLARIDAD,
          p.OCUPACION          AS PADRE_OCUPACION,
          p.EDAD               AS PADRE_EDAD,
          p.SEGURO_MEDICO      AS PADRE_SEGURO,
          p.NOMBRE             AS PADRE_NOMBRE,

          m.MADRE_ID,
          m.LUGAR_NACIMIENTO   AS MADRE_LUGAR_NACIMIENTO,
          m.ESCOLARIDAD        AS MADRE_ESCOLARIDAD,
          m.OCUPACION          AS MADRE_OCUPACION,
          m.EDAD               AS MADRE_EDAD,
          m.CD_EMBARAZO,
          m.ACIDO_FOLICO,
          m.CITAS_CONTROL,
          m.SEGURO_MEDICO      AS MADRE_SEGURO,
          m.NOMBRE             AS MADRE_NOMBRE,

          a.ADICCIONES,
          a.HIJO_DTN,
          a.FAMILIAR_DTN,
          a.EXPO_TOXICOS,
          a.DESCRIPCION_EXPO_TOXICOS

      FROM ADMIN.HISTORIAL_PADRE p
      LEFT JOIN ADMIN.HISTORIAL_MADRE  m ON p.PACIENTE_ID = m.PACIENTE_ID
      LEFT JOIN ADMIN.HISTORIAL_AMBOS  a ON p.PACIENTE_ID = a.PACIENTE_ID
      WHERE p.PACIENTE_ID = :pacienteId`,
      { pacienteId: Number(pacienteId) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows ?? [];

  } catch (error) {
    console.error("Error SQL:", error.message, "| ORA-code:", error.errorNum);
    throw error;
  } finally {
    if (conn) await conn.close();
  }
}