import { getConnection } from "../../config/db.js";
import oracledb from "oracledb";
import bcrypt from "bcrypt";
import { mapPacienteLogin } from "./login.mapper.js";

// ── Helper ────────────────────────────────────────────────────────────────────

function fotoToBase64(row) {
  if (row.FOTO) {
    row.FOTO = `data:image/jpeg;base64,${row.FOTO.toString("base64")}`;
  }
}

// ── Servicio ──────────────────────────────────────────────────────────────────

export async function iniciarSesionPaciente(username, password) {
  let conn;
  try {
    conn = await getConnection();

    const result = await conn.execute(
      `SELECT u.USUARIO_ID, u.USERNAME, u.PASSWORD, u.TIPO_USUARIO, u.NOMBRE, u.FOTO
         FROM USUARIO u
        WHERE LOWER(u.USERNAME) = LOWER(:username)`,
      { username: String(username).trim() },
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        fetchInfo: { FOTO: { type: oracledb.BUFFER } },
      }
    );

    if (!result.rows || result.rows.length === 0) return null;

    const usuario = result.rows[0];

    if (!usuario.PASSWORD || typeof usuario.PASSWORD !== "string") return null;

    const passwordCorrecta = await bcrypt.compare(String(password), usuario.PASSWORD);
    if (!passwordCorrecta) return null;

    fotoToBase64(usuario);
    return mapPacienteLogin(usuario);
  } finally {
    if (conn) await conn.close();
  }
}
