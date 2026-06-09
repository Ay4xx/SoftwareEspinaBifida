import { getConnection } from "../../config/db.js";
import oracledb from "oracledb";
import { mapNotificacionToCard } from "./notificaciones.mapper.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

function normalizarSiNo(val) {
  if (val === "SI") return "Sí";
  if (val === "NO") return "No";
  return "";
}

async function leerBlob(blob) {
  if (!blob) return null;
  const chunks = [];
  await new Promise((resolve, reject) => {
    blob.on("data", (chunk) => chunks.push(chunk));
    blob.on("end", resolve);
    blob.on("error", reject);
  });
  return `data:image/jpeg;base64,${Buffer.concat(chunks).toString("base64")}`;
}

async function actualizarEstadoNotificacion(conn, notificacionId, nuevoEstado) {
  const result = await conn.execute(
    `UPDATE NOTIFICACION SET estado_proceso = :estado
      WHERE notificacion_id = :notificacionId AND estado_proceso = 'pendiente'`,
    { estado: nuevoEstado, notificacionId: Number(notificacionId) },
    { autoCommit: true }
  );
  return result.rowsAffected > 0;
}

function mapearTutor(parentesco, row, ambos) {
  const base = {
    tutorParentesco:        parentesco,
    tutorNombre:            row.NOMBRE            || "",
    tutorLugarNacimiento:   row.LUGAR_NACIMIENTO  || "",
    tutorEscolaridad:       row.ESCOLARIDAD       || "",
    tutorOcupacion:         row.OCUPACION         || "",
    tutorEdad:              row.EDAD ? String(row.EDAD) : "",
    adicciones:             ambos?.ADICCIONES                 || "",
    hijoDtn:                normalizarSiNo(ambos?.HIJO_DTN),
    familiarDtn:            normalizarSiNo(ambos?.FAMILIAR_DTN),
    expoToxicos:            normalizarSiNo(ambos?.EXPO_TOXICOS),
    descripcionExpoToxicos: ambos?.DESCRIPCION_EXPO_TOXICOS   || "",
  };

  if (parentesco === "Madre") {
    return {
      ...base,
      tutorSeguroMedico: "",
      madreSeguroMedico: row.SEGURO_MEDICO  || "",
      cdEmbarazo:        row.CD_EMBARAZO    || "",
      acidoFolico:       row.ACIDO_FOLICO === "S" ? "Sí" : row.ACIDO_FOLICO === "N" ? "No" : "",
      citasControl:      row.CITAS_CONTROL ? String(row.CITAS_CONTROL) : "",
    };
  }

  return {
    ...base,
    tutorSeguroMedico: row.SEGURO_MEDICO || "",
    madreSeguroMedico: "",
    cdEmbarazo:        "",
    acidoFolico:       "",
    citasControl:      "",
  };
}

// ── Servicios públicos ────────────────────────────────────────────────────────

export async function getNotificaciones(estado = null) {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT
        n.notificacion_id, n.paciente_id, n.usuario_id, n.titulo, n.mensaje, n.estado_proceso,
        TO_CHAR(n.fecha_creacion, 'DD/MM/YYYY HH24:MI') AS fecha_creacion,
        p.nombre, p.apellido, p.curp, p.ciudad_residencia, p.estado_residencia,
        p.telefono_casa, p.telefono_celular
       FROM NOTIFICACION n
       INNER JOIN PACIENTE p ON n.paciente_id = p.paciente_id
       WHERE (:estado IS NULL OR LOWER(n.estado_proceso) = LOWER(:estado))
         AND LOWER(n.estado_proceso) != 'aprobado'
       ORDER BY n.fecha_creacion DESC`,
      { estado: estado?.trim() ? estado.trim() : null },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return result.rows.map(mapNotificacionToCard);
  } finally {
    if (conn) await conn.close();
  }
}

export async function getNotificacionById(notificacionId) {
  let conn;
  try {
    conn = await getConnection();

    const result = await conn.execute(
      `SELECT
        n.notificacion_id, n.estado_proceso,
        TO_CHAR(n.fecha_creacion, 'DD/MM/YYYY HH24:MI') AS fecha_creacion,
        p.paciente_id, p.nombre, p.apellido, p.curp, p.genero,
        TO_CHAR(p.fecha_nacimiento, 'YYYY-MM-DD') AS fecha_nacimiento,
        p.direccion, p.ciudad_residencia, p.estado_residencia, p.codigo_postal,
        p.telefono_casa, p.telefono_celular, p.email,
        p.emergencia_contacto, p.emergencia_telefono,
        p.lugar_nacimiento, p.hospital_nacimiento, p.sangre_tipo,
        p.valvula, p.etapa_vida, p.notas_adicionales, p.fotografia,
        pb.tipo_padecimiento AS tipo_espina_bifida,
        pb.descripcion       AS otros_padecimiento
       FROM NOTIFICACION n
       INNER JOIN PACIENTE p ON n.paciente_id = p.paciente_id
       LEFT JOIN PACIENTE_PADECIMIENTO pp ON pp.PACIENTE_ID = p.PACIENTE_ID
       LEFT JOIN PADECIMIENTOEB pb ON pb.PADECIMIENTO_ID = pp.PADECIMIENTO_ID
       WHERE n.notificacion_id = :notificacionId`,
      { notificacionId: Number(notificacionId) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (!result.rows?.length) return null;
    const row = result.rows[0];

    const fotoBase64 = await leerBlob(row.FOTOGRAFIA);

    const fetchTutor = (sql, binds, fetchInfo) =>
      conn.execute(sql, binds, { outFormat: oracledb.OUT_FORMAT_OBJECT, fetchInfo });

    const STRING = { type: oracledb.STRING };

    const [resMadre, resPadre, resAmbos] = await Promise.all([
      fetchTutor(
        `SELECT NOMBRE, LUGAR_NACIMIENTO, ESCOLARIDAD, OCUPACION,
                EDAD, SEGURO_MEDICO, CD_EMBARAZO, ACIDO_FOLICO, CITAS_CONTROL
           FROM HISTORIAL_MADRE WHERE PACIENTE_ID = :pacienteId`,
        { pacienteId: row.PACIENTE_ID },
        { NOMBRE: STRING, LUGAR_NACIMIENTO: STRING, ESCOLARIDAD: STRING,
          OCUPACION: STRING, SEGURO_MEDICO: STRING, CD_EMBARAZO: STRING, ACIDO_FOLICO: STRING }
      ),
      fetchTutor(
        `SELECT NOMBRE, LUGAR_NACIMIENTO, ESCOLARIDAD, OCUPACION, EDAD, SEGURO_MEDICO
           FROM HISTORIAL_PADRE WHERE PACIENTE_ID = :pacienteId`,
        { pacienteId: row.PACIENTE_ID },
        { NOMBRE: STRING, LUGAR_NACIMIENTO: STRING, ESCOLARIDAD: STRING,
          OCUPACION: STRING, SEGURO_MEDICO: STRING }
      ),
      fetchTutor(
        `SELECT ADICCIONES, HIJO_DTN, FAMILIAR_DTN, EXPO_TOXICOS, DESCRIPCION_EXPO_TOXICOS
           FROM HISTORIAL_AMBOS WHERE PACIENTE_ID = :pacienteId`,
        { pacienteId: row.PACIENTE_ID },
        { ADICCIONES: STRING, HIJO_DTN: STRING, FAMILIAR_DTN: STRING,
          EXPO_TOXICOS: STRING, DESCRIPCION_EXPO_TOXICOS: STRING }
      ),
    ]);

    const madre = resMadre.rows?.[0] || null;
    const padre = resPadre.rows?.[0] || null;
    const ambos = resAmbos.rows?.[0] || null;
    const tutores = [];

    if (madre) tutores.push(mapearTutor("Madre", madre, ambos));
    if (padre) tutores.push(mapearTutor("Padre", padre, ambos));

    return {
      NOTIFICACION_ID:     row.NOTIFICACION_ID     ?? null,
      ESTADO_PROCESO:      row.ESTADO_PROCESO       ?? null,
      FECHA_CREACION:      row.FECHA_CREACION       ?? null,
      PACIENTE_ID:         row.PACIENTE_ID          ?? null,
      NOMBRE:              row.NOMBRE               ?? null,
      APELLIDO:            row.APELLIDO             ?? null,
      CURP:                row.CURP                 ?? null,
      GENERO:              row.GENERO               ?? null,
      FECHA_NACIMIENTO:    row.FECHA_NACIMIENTO     ?? null,
      DIRECCION:           row.DIRECCION            ?? null,
      CIUDAD_RESIDENCIA:   row.CIUDAD_RESIDENCIA    ?? null,
      ESTADO_RESIDENCIA:   row.ESTADO_RESIDENCIA    ?? null,
      CODIGO_POSTAL:       row.CODIGO_POSTAL        ?? null,
      TELEFONO_CASA:       row.TELEFONO_CASA        ?? null,
      TELEFONO_CELULAR:    row.TELEFONO_CELULAR     ?? null,
      EMAIL:               row.EMAIL                ?? null,
      EMERGENCIA_CONTACTO: row.EMERGENCIA_CONTACTO  ?? null,
      EMERGENCIA_TELEFONO: row.EMERGENCIA_TELEFONO  ?? null,
      LUGAR_NACIMIENTO:    row.LUGAR_NACIMIENTO     ?? null,
      HOSPITAL_NACIMIENTO: row.HOSPITAL_NACIMIENTO  ?? null,
      SANGRE_TIPO:         row.SANGRE_TIPO          ?? null,
      VALVULA:             row.VALVULA              ?? null,
      ETAPA_VIDA:          row.ETAPA_VIDA           ?? null,
      NOTAS_ADICIONALES:   row.NOTAS_ADICIONALES    ?? null,
      TIPO_ESPINA_BIFIDA:  row.TIPO_ESPINA_BIFIDA   ?? null,
      OTROS_PADECIMIENTO:  row.OTROS_PADECIMIENTO   ?? null,
      FOTO:                fotoBase64,
      TUTORES:             tutores,
    };
  } finally {
    if (conn) await conn.close();
  }
}

export async function aprobarNotificacion(notificacionId) {
  let conn;
  try {
    conn = await getConnection();
    return actualizarEstadoNotificacion(conn, notificacionId, "aprobado");
  } finally {
    if (conn) await conn.close();
  }
}

export async function rechazarNotificacion(notificacionId) {
  let conn;
  try {
    conn = await getConnection();
    return actualizarEstadoNotificacion(conn, notificacionId, "rechazado");
  } finally {
    if (conn) await conn.close();
  }
}

export async function eliminarNotificacionesAntiguas() {
  let conn;
  try {
    conn = await getConnection();

    const pacientes = await conn.execute(
      `SELECT DISTINCT paciente_id FROM NOTIFICACION
        WHERE TRUNC(fecha_creacion) <= TRUNC(SYSDATE) - 14
          AND LOWER(estado_proceso) != 'aprobado'`,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const ids = pacientes.rows.map((r) => r.PACIENTE_ID);
    if (ids.length === 0) return 0;

    const placeholders = ids.map((_, i) => `:id${i}`).join(",");
    const binds = Object.fromEntries(ids.map((id, i) => [`id${i}`, id]));

    const tablas = [
      "NOTIFICACION", "PACIENTE_PADECIMIENTO", "HISTORIAL_MADRE",
      "HISTORIAL_PADRE", "EVENTO_VISITA", "MEMBRESIA", "PACIENTE",
    ];
    for (const tabla of tablas) {
      await conn.execute(`DELETE FROM ${tabla} WHERE paciente_id IN (${placeholders})`, binds, { autoCommit: true });
    }

    return ids.length;
  } finally {
    if (conn) await conn.close();
  }
}
