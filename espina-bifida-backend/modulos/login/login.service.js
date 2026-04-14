import { getConnection } from "../../config/db.js";
import oracledb from "oracledb";
import bcrypt from "bcrypt";
import { mapPacienteLogin } from "./login.mapper.js";

export async function iniciarSesionPaciente(username, password) {
  let conn;

  try {
    conn = await getConnection();

    const sql = `
      SELECT
        u.USUARIO_ID,
        u.USERNAME,
        u.PASSWORD
      FROM USUARIO u
      WHERE LOWER(u.USERNAME) = LOWER(:username)
    `;

    const result = await conn.execute(
      sql,
      { username: String(username).trim() },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (!result.rows || result.rows.length === 0) {
      return null;
    }

    const usuario = result.rows[0];

    if (!usuario.PASSWORD || typeof usuario.PASSWORD !== "string") {
      console.error("PASSWORD inválido para usuario:", usuario.USUARIO_ID);
      return null;
    }

    const passwordCorrecta = await bcrypt.compare(
      String(password),
      usuario.PASSWORD
    );

    if (!passwordCorrecta) {
      return null;
    }

    return mapPacienteLogin(usuario);
  } catch (error) {
    console.error("Error en iniciarSesionPaciente:", error);
    throw error;
  } finally {
    if (conn) await conn.close();
  }
}