import oracledb from "oracledb";
import { getConnection } from "../../config/db.js";
import { mapPacienteToCard } from "../paciente/paciente.mapper.js";

export async function getPacienteCards(search = "") {
  let conn;
  try {
    conn = await getConnection();
    const sql = `
      SELECT
        p.paciente_id,
        p.nombre,
        p.apellido,
        p.fotografia,
        p.ciudad_residencia,
        p.estado_residencia,
        p.fecha_ultima_visita,
        p.etapa_vida,
        m.estatus AS estatus_membresia,
        NVL(ev.total_consultas, 0) AS total_consultas
      FROM PACIENTE p
      LEFT JOIN MEMBRESIA m ON p.paciente_id = m.paciente_id
      LEFT JOIN (
        SELECT paciente_id, COUNT(evento_id) AS total_consultas
        FROM EVENTO_VISITA
        GROUP BY paciente_id
      ) ev ON p.paciente_id = ev.paciente_id
      INNER JOIN NOTIFICACION n ON p.paciente_id = n.paciente_id
      WHERE n.estado_proceso = 'aprobado'
        AND (
          :search IS NULL
          OR LOWER(p.nombre) LIKE '%' || LOWER(:search) || '%'
          OR LOWER(p.apellido) LIKE '%' || LOWER(:search) || '%'
          OR LOWER(p.nombre || ' ' || p.apellido) LIKE '%' || LOWER(:search) || '%'
        )
      ORDER BY p.paciente_id DESC
    `;
    const result = await conn.execute(
      sql,
      { search: search?.trim() ? search.trim() : null },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return result.rows.map(mapPacienteToCard);
  } catch (error) {
    console.error("Error en getPacienteCards:", error);
    throw error;
  } finally {
    if (conn) await conn.close();
  }
}

export async function getPacienteCredencial(id) {
  let conn;
  try {
    conn = await getConnection();
    const sql = `
      SELECT
        LPAD(p.paciente_id, 3, '0') AS folio,
        p.nombre AS nombre,
        p.apellido AS apellido,
        p.ciudad_residencia || ', ' || p.estado_residencia AS direccion,
        p.telefono_casa AS telCasa,
        p.emergencia_contacto AS padres,
        TO_CHAR(p.fecha_alta, 'DD/MM/RR') AS fechaExpedicion,
        p.sangre_tipo AS tipoSangre,
        CASE WHEN p.valvula = 'SI' THEN 'Sí' ELSE 'No' END AS valvula,
        p.emergencia_contacto AS accidenteAvisar,
        p.emergencia_telefono AS telefonoEmergencia,
        p.email AS correo,
        TO_CHAR(p.fecha_nacimiento, 'DD/MM/YYYY') AS fechaNacimiento,
        p.lugar_nacimiento AS lugarNacimiento,
        p.hospital_nacimiento AS hospital,
        p.fotografia AS fotoPrincipal,
        p.fotografia AS fotoMini
      FROM PACIENTE p
      WHERE p.paciente_id = :pacienteId
    `;
    const result = await conn.execute(sql, { pacienteId: id }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    if (!result.rows || result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      folio: row.FOLIO,
      nombre: row.NOMBRE,
      apellido: row.APELLIDO,
      nombreCompleto: [row.NOMBRE, row.APELLIDO].filter(Boolean).join(" "),
      direccion: row.DIRECCION,
      telCasa: row.TELCASA,
      padres: row.PADRES,
      fechaExpedicion: row.FECHAEXPEDICION,
      tipoSangre: row.TIPOSANGRE,
      valvula: row.VALVULA,
      accidenteAvisar: row.ACCIDENTEAVISAR,
      telefonoEmergencia: row.TELEFONOEMERGENCIA,
      correo: row.CORREO,
      fechaNacimiento: row.FECHANACIMIENTO,
      lugarNacimiento: row.LUGARNACIMIENTO,
      hospital: row.HOSPITAL,
      fotoPrincipal: row.FOTOPRINCIPAL,
      fotoMini: row.FOTOMINI,
    };
  } catch (error) {
    console.error("Error en getPacienteCredencial:", error);
    throw error;
  } finally {
    if (conn) await conn.close();
  }
}

export async function getPacienteDetail(id) {
  let conn;
  try {
    conn = await getConnection();
    const sql = `
      SELECT
        p.paciente_id, p.nombre, p.apellido, p.fotografia,
        p.ciudad_residencia, p.estado_residencia,
        p.fecha_ultima_visita, p.etapa_vida,
        m.estatus AS estatus_membresia,
        NVL(ev.total_consultas, 0) AS total_consultas
      FROM PACIENTE p
      LEFT JOIN MEMBRESIA m ON p.paciente_id = m.paciente_id
      LEFT JOIN (
        SELECT paciente_id, COUNT(evento_id) AS total_consultas
        FROM EVENTO_VISITA GROUP BY paciente_id
      ) ev ON p.paciente_id = ev.paciente_id
      WHERE p.paciente_id = :id
    `;
    const result = await conn.execute(sql, { id: Number(id) }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    if (!result.rows || result.rows.length === 0) return null;
    return mapPacienteToCard(result.rows[0]);
  } catch (error) {
    console.error("Error en getPacienteDetail:", error);
    throw error;
  } finally {
    if (conn) await conn.close();
  }
}

export async function getPacienteDetalle(pacienteId) {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT p.PACIENTE_ID, p.NOMBRE, p.APELLIDO, p.EMAIL,
        p.TELEFONO_CELULAR, p.ESTADO_RESIDENCIA, p.FECHA_ALTA,
        p.VIVE, m.FECHA_INICIO, m.FECHA_FIN
        FROM PACIENTE p
        LEFT JOIN MEMBRESIA m ON p.PACIENTE_ID = m.PACIENTE_ID
        WHERE p.PACIENTE_ID = :pacienteId`,
      { pacienteId: Number(pacienteId) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (!result.rows || result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      PACIENTE_ID: row.PACIENTE_ID ?? null,
      NOMBRE: row.NOMBRE ?? null,
      APELLIDO: row.APELLIDO ?? null,
      NOMBRE_COMPLETO: [row.NOMBRE, row.APELLIDO].filter(Boolean).join(" "),
      EMAIL: row.EMAIL ?? null,
      TELEFONO_CELULAR: row.TELEFONO_CELULAR ?? null,
      ESTADO_RESIDENCIA: row.ESTADO_RESIDENCIA ?? null,
      FECHA_ALTA: row.FECHA_ALTA ? new Date(row.FECHA_ALTA).toISOString() : null,
      VIVE: row.VIVE ?? null,
      FECHA_INICIO: row.FECHA_INICIO ? new Date(row.FECHA_INICIO).toISOString() : null,
      FECHA_FIN: row.FECHA_FIN ? new Date(row.FECHA_FIN).toISOString() : null,
      foto: `/api/pacientes/${row.PACIENTE_ID}/foto`,
    };
  } catch (error) {
    console.error("Error en getPacienteDetalle:", error);
    throw error;
  } finally {
    if (conn) await conn.close();
  }
}

export async function guardarFoto(id, buffer) {
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `UPDATE PACIENTE SET FOTOGRAFIA = :foto WHERE PACIENTE_ID = :id`,
      { foto: buffer, id: Number(id) },
      { autoCommit: true }
    );
  } catch (error) {
    console.error("Error en guardarFoto:", error);
    throw error;
  } finally {
    if (conn) await conn.close();
  }
}

export async function obtenerFoto(id) {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT FOTOGRAFIA FROM PACIENTE WHERE PACIENTE_ID = :id`,
      { id: Number(id) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (!result.rows || result.rows.length === 0) return null;
    const lob = result.rows[0].FOTOGRAFIA;
    if (!lob) return null;
    const chunks = [];
    return await new Promise((resolve, reject) => {
      lob.on("data", (chunk) => chunks.push(chunk));
      lob.on("end", () => resolve(Buffer.concat(chunks)));
      lob.on("error", reject);
    });
  } catch (error) {
    console.error("Error en obtenerFoto:", error);
    throw error;
  } finally {
    if (conn) await conn.close();
  }
}

export async function updatePaciente(pacienteId, datos = {}, archivo = null) {
  let conn;
  try {
    conn = await getConnection();
    const valvula = datos.usaValvula === "Sí" ? "SI" : datos.usaValvula === "No" ? "NO" : null;
    if (archivo) {
      await guardarFoto(pacienteId, archivo.buffer);
    }
    await conn.execute(
      `UPDATE PACIENTE SET
        NOMBRE               = :nombre,
        APELLIDO             = :apellido,
        CURP                 = :curp,
        GENERO               = :genero,
        FECHA_NACIMIENTO     = TO_DATE(:fechaNacimiento, 'YYYY-MM-DD'),
        DIRECCION            = :direccion,
        CIUDAD_RESIDENCIA    = :ciudad,
        ESTADO_RESIDENCIA    = :estado,
        CODIGO_POSTAL        = :codigoPostal,
        TELEFONO_CASA        = :telefonoCasa,
        TELEFONO_CELULAR     = :telefonoCelular,
        EMAIL                = :correo,
        EMERGENCIA_CONTACTO  = :emergenciaContacto,
        EMERGENCIA_TELEFONO  = :emergenciaTelefono,
        LUGAR_NACIMIENTO     = :lugarNacimiento,
        HOSPITAL_NACIMIENTO  = :hospitalNacimiento,
        SANGRE_TIPO          = :tipoSangre,
        VALVULA              = :valvula,
        NOTAS_ADICIONALES    = :notas
      WHERE PACIENTE_ID = :pacienteId`,
      {
        nombre:             datos.nombre             || null,
        apellido:           datos.apellido           || null,
        curp:               datos.curp               || null,
        genero:             datos.genero             || null,
        fechaNacimiento:    datos.fechaNacimiento     || null,
        direccion:          datos.direccion           || null,
        ciudad:             datos.ciudad              || null,
        estado:             datos.estado              || null,
        codigoPostal:       datos.codigoPostal        || null,
        telefonoCasa:       datos.telefonoCasa        || null,
        telefonoCelular:    datos.telefonoCelular     || null,
        correo:             datos.correo              || null,
        emergenciaContacto: datos.emergenciaContacto  || null,
        emergenciaTelefono: datos.emergenciaTelefono  || null,
        lugarNacimiento:    datos.lugarNacimiento     || null,
        hospitalNacimiento: datos.hospitalNacimiento  || null,
        tipoSangre:         datos.tipoSangre          || null,
        valvula,
        notas:              datos.notas               || null,
        pacienteId,
      },
      { autoCommit: true }
    );
  } catch (error) {
    console.error("Error en updatePaciente:", error);
    throw error;
  } finally {
    if (conn) await conn.close();
  }
}