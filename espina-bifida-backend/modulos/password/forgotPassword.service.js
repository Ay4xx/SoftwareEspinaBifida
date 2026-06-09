import { getConnection } from "../../config/db.js";
import oracledb from "oracledb";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { enviarCorreoRecuperacion } from "../email/email.service.js";

const SQL_BUSCAR_TOKEN = `
  SELECT TOKEN_ID, USUARIO_ID
    FROM PASSWORD_RESET_TOKEN
   WHERE TOKEN     = :token
     AND USADO     = 0
     AND EXPIRA_EN > SYSTIMESTAMP`;

export async function solicitarRecuperacion(username) {
  let conn;
  try {
    conn = await getConnection();

    const result = await conn.execute(
      `SELECT USUARIO_ID, NOMBRE, USERNAME FROM USUARIO WHERE LOWER(USERNAME) = LOWER(:username)`,
      { username: username.trim() },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const usuario = result.rows[0];
    const token   = crypto.randomBytes(32).toString("hex");
    const expira  = new Date(Date.now() + 60 * 60 * 1000);

    await conn.execute(`DELETE FROM PASSWORD_RESET_TOKEN WHERE USUARIO_ID = :id`, { id: usuario.USUARIO_ID });
    await conn.execute(
      `INSERT INTO PASSWORD_RESET_TOKEN (USUARIO_ID, TOKEN, EXPIRA_EN, USADO) VALUES (:id, :token, :expira, 0)`,
      { id: usuario.USUARIO_ID, token, expira }
    );
    await conn.commit();

    await enviarCorreoRecuperacion({
      nombre: usuario.NOMBRE || usuario.USERNAME,
      correo: usuario.USERNAME,
      link:   `${process.env.FRONTEND_URL}/reset-password?token=${token}`,
    });

    return true;
  } catch (error) {
    if (conn) await conn.rollback().catch(() => {});
    throw error;
  } finally {
    if (conn) await conn.close();
  }
}

export async function validarToken(token) {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(SQL_BUSCAR_TOKEN, { token }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    if (!result.rows?.length) return null;
    return result.rows[0];
  } finally {
    if (conn) await conn.close();
  }
}

export async function cambiarPasswordConToken(token, nuevaPassword) {
  let conn;
  try {
    conn = await getConnection();

    const result = await conn.execute(SQL_BUSCAR_TOKEN, { token }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    if (!result.rows?.length) return false;

    const { TOKEN_ID, USUARIO_ID } = result.rows[0];
    const hash = await bcrypt.hash(nuevaPassword, 10);

    await conn.execute(`UPDATE USUARIO SET PASSWORD = :hash WHERE USUARIO_ID = :id`, { hash, id: USUARIO_ID });
    await conn.execute(`UPDATE PASSWORD_RESET_TOKEN SET USADO = 1 WHERE TOKEN_ID = :tokenId`, { tokenId: TOKEN_ID });
    await conn.commit();

    return true;
  } catch (error) {
    if (conn) await conn.rollback().catch(() => {});
    throw error;
  } finally {
    if (conn) await conn.close();
  }
}
