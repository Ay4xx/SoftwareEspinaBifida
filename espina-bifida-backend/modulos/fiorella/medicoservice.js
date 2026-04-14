import { getConnection } from "../../config/db.js";
import oracledb from "oracledb";

export async function getMedicos() {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT MEDICO_ID, NOMBRE, APELLIDO, ESPECIALIDAD FROM MEDICO`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return result.rows;
  } finally {
    if (conn) await conn.close();
  }
}

export async function getServiciosByMedico(medicoId) {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT SERVICIO_ID, NOMBRE_SERVICIO, DESCRIPCION, COSTO
       FROM SERVICIO
       WHERE MEDICO_ID = :medicoId`,
      { medicoId: parseInt(medicoId) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return result.rows;
  } finally {
    if (conn) await conn.close();
  }
}