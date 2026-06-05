import oracledb from "oracledb";
import bcrypt from "bcrypt";
import { getConnection } from "../../config/db.js";
import { mapUsuario } from "./gestionUsuarios.mapper.js";

const TIPOS_VALIDOS = ["ADMINISTRADOR", "COORDINADOR", "SUPERADMIN"];

// ── Helpers ───────────────────────────────────────────────────────────────────

function fotoToBase64(row) {
  if (row.FOTO) {
    row.FOTO = `data:image/jpeg;base64,${row.FOTO.toString("base64")}`;
  }
}

function validarTipoUsuario(tipoUsuario) {
  if (tipoUsuario !== undefined && !TIPOS_VALIDOS.includes(tipoUsuario?.toUpperCase()))
    throw { status: 400, message: `Tipo de usuario inválido. Valores: ${TIPOS_VALIDOS.join(", ")}` };
  if (tipoUsuario?.toUpperCase() === "SUPERADMIN")
    throw { status: 403, message: "No se puede asignar el rol de Super Admin desde aquí" };
}

async function verificarExistencia(conn, id) {
  const existe = await conn.execute(
    `SELECT 1 FROM USUARIO WHERE USUARIO_ID = :id`,
    [id],
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  if (!existe.rows.length)
    throw { status: 404, message: "Usuario no encontrado" };
}

// ── Servicios públicos ────────────────────────────────────────────────────────

export async function listarUsuarios({ busqueda = "", pagina = 1, limite = 20 }) {
  let conn;
  try {
    conn = await getConnection();
    const saltar = (pagina - 1) * limite;
    const filtro = `%${busqueda.toUpperCase()}%`;

    const result = await conn.execute(
      `SELECT USUARIO_ID, NOMBRE, USERNAME, TIPO_USUARIO, FECHA_REGISTRO, FOTO
         FROM USUARIO
        WHERE UPPER(USERNAME) LIKE :filtro
           OR UPPER(NOMBRE)   LIKE :filtro
        ORDER BY FECHA_REGISTRO DESC
        OFFSET :saltar ROWS FETCH NEXT :maxRows ROWS ONLY`,
      [filtro, filtro, saltar, limite],
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        fetchInfo: { FOTO: { type: oracledb.BUFFER } },
      }
    );

    const total = await conn.execute(
      `SELECT COUNT(*) AS TOTAL FROM USUARIO
        WHERE UPPER(USERNAME) LIKE :filtro
           OR UPPER(NOMBRE)   LIKE :filtro`,
      [filtro, filtro],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return {
      usuarios: result.rows.map((row) => {
        fotoToBase64(row);
        return mapUsuario(row);
      }),
      total:  total.rows[0].TOTAL,
      pagina: Number(pagina),
      limite: Number(limite),
    };
  } finally {
    if (conn) await conn.close();
  }
}

export async function obtenerUsuario(id) {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT USUARIO_ID, NOMBRE, USERNAME, TIPO_USUARIO, FECHA_REGISTRO, FOTO
         FROM USUARIO
        WHERE USUARIO_ID = :id`,
      [id],
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        fetchInfo: { FOTO: { type: oracledb.BUFFER } },
      }
    );

    if (!result.rows.length) return null;

    const row = result.rows[0];
    fotoToBase64(row);
    return mapUsuario(row);
  } finally {
    if (conn) await conn.close();
  }
}

export async function crearUsuario({ nombre, username, password, confirmarPassword, tipoUsuario, foto }) {
  if (!nombre?.trim())
    throw { status: 400, message: "El nombre es requerido" };
  if (!username?.trim())
    throw { status: 400, message: "El correo es requerido" };
  if (!password)
    throw { status: 400, message: "La contraseña es requerida" };
  if (password.length < 8)
    throw { status: 400, message: "La contraseña debe tener mínimo 8 caracteres" };
  if (password !== confirmarPassword)
    throw { status: 400, message: "Las contraseñas no coinciden" };
  validarTipoUsuario(tipoUsuario);

  let conn;
  try {
    conn = await getConnection();

    const existe = await conn.execute(
      `SELECT 1 FROM USUARIO WHERE LOWER(USERNAME) = LOWER(:username)`,
      { username: username.trim() },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (existe.rows.length)
      throw { status: 409, message: "El correo ya está en uso" };

    const passwordHash = await bcrypt.hash(String(password), 10);

    const insert = await conn.execute(
      `INSERT INTO USUARIO (NOMBRE, USERNAME, PASSWORD, TIPO_USUARIO, FOTO)
       VALUES (:nombre, :username, :passwordHash, :tipoUsuario, :foto)
       RETURNING USUARIO_ID INTO :id`,
      {
        nombre:       nombre.trim(),
        username:     username.trim(),
        passwordHash,
        tipoUsuario:  tipoUsuario.toUpperCase(),
        foto:         foto ? { val: foto, type: oracledb.BLOB } : { val: null, type: oracledb.BLOB },
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      },
      { autoCommit: true }
    );

    const nuevoId = insert.outBinds.id[0];
    const nuevo   = await conn.execute(
      `SELECT USUARIO_ID, NOMBRE, USERNAME, TIPO_USUARIO, FECHA_REGISTRO
         FROM USUARIO WHERE USUARIO_ID = :id`,
      [nuevoId],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return mapUsuario(nuevo.rows[0]);
  } finally {
    if (conn) await conn.close();
  }
}

export async function actualizarUsuario(id, { nombre, username, tipoUsuario, foto }) {
  if (nombre   !== undefined && !nombre.trim())
    throw { status: 400, message: "El nombre no puede estar vacío" };
  if (username !== undefined && !username.trim())
    throw { status: 400, message: "El correo no puede estar vacío" };
  validarTipoUsuario(tipoUsuario);

  let conn;
  try {
    conn = await getConnection();

    await verificarExistencia(conn, id);

    if (username) {
      const duplicado = await conn.execute(
        `SELECT 1 FROM USUARIO
          WHERE LOWER(USERNAME) = LOWER(:username)
            AND USUARIO_ID != :id`,
        { username: username.trim(), id },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      if (duplicado.rows.length)
        throw { status: 409, message: "El correo ya está en uso" };
    }

    await conn.execute(
      `UPDATE USUARIO
          SET NOMBRE       = NVL(:nombre,      NOMBRE),
              USERNAME     = NVL(:username,    USERNAME),
              TIPO_USUARIO = NVL(:tipoUsuario, TIPO_USUARIO),
              FOTO         = CASE WHEN :fotoUpdate = 1 THEN :foto ELSE FOTO END
        WHERE USUARIO_ID = :id`,
      {
        nombre:      nombre?.trim()             ?? null,
        username:    username?.trim()           ?? null,
        tipoUsuario: tipoUsuario?.toUpperCase() ?? null,
        foto:        foto ? { val: foto, type: oracledb.BLOB } : { val: null, type: oracledb.BLOB },
        fotoUpdate:  foto !== undefined ? 1 : 0,
        id,
      },
      { autoCommit: true }
    );

    const actualizado = await conn.execute(
      `SELECT USUARIO_ID, NOMBRE, USERNAME, TIPO_USUARIO, FECHA_REGISTRO, FOTO
         FROM USUARIO WHERE USUARIO_ID = :id`,
      [id],
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        fetchInfo: { FOTO: { type: oracledb.BUFFER } },
      }
    );

    const row = actualizado.rows[0];
    fotoToBase64(row);
    return mapUsuario(row);
  } finally {
    if (conn) await conn.close();
  }
}

export async function eliminarUsuario(id, usuarioActualId) {
  if (id === usuarioActualId)
    throw { status: 400, message: "No puedes eliminar tu propia cuenta" };

  let conn;
  try {
    conn = await getConnection();

    await verificarExistencia(conn, id);

    await conn.execute(
      `DELETE FROM USUARIO WHERE USUARIO_ID = :id`,
      [id],
      { autoCommit: true }
    );
  } finally {
    if (conn) await conn.close();
  }
}
