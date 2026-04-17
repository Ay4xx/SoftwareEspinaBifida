import { getConnection } from "../../config/db.js";
import oracledb from "oracledb";

export async function obtenerHistorialFamiliar(pacienteId) {
  let conn;

  try {
    conn = await getConnection();
    oracledb.fetchAsString = [ oracledb.CLOB ];

    const result = await conn.execute(
      `SELECT 
          p.PADRE_ID,
          p.PACIENTE_ID,
          p.LUGAR_NACIMIENTO AS PADRE_LUGAR_NACIMIENTO,
          p.ESCOLARIDAD AS PADRE_ESCOLARIDAD,
          p.OCUPACION AS PADRE_OCUPACION,
          p.EDAD AS PADRE_EDAD,
          p.PARENTESCO AS PADRE_PARENTESCO,
          p.SEGURO_MEDICO AS PADRE_SEGURO,

          m.MADRE_ID,
          m.LUGAR_NACIMIENTO AS MADRE_LUGAR_NACIMIENTO,
          m.ESCOLARIDAD AS MADRE_ESCOLARIDAD,
          m.OCUPACION AS MADRE_OCUPACION,
          m.EDAD AS MADRE_EDAD,
          m.PARENTESCO AS MADRE_PARENTESCO,
          m.CD_EMBARAZO,
          m.ACIDO_FOLICO,
          m.CITAS_CONTROL,
          m.SEGURO_MEDICO AS MADRE_SEGURO,

          a.ADICCIONES,
          a.HIJO_DTN,
          a.FAMILIAR_DTN,
          a.EXPO_TOXICOS,
          a.DESCRIPCION_EXPO_TOXICOS

      FROM ADMIN.HISTORIAL_PADRE p
      LEFT JOIN ADMIN.HISTORIAL_AMBOS a ON p.PADRE_ID = a.PADRE_ID
      LEFT JOIN ADMIN.HISTORIAL_MADRE m ON p.PACIENTE_ID = m.PACIENTE_ID
      WHERE p.PACIENTE_ID = :pacienteId`,
      [pacienteId],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows;

  } catch (error) {
    console.error("Error información familiar:", error);
    throw error;
  } finally {
    if (conn) await conn.close();
  }
}