import { getConnection } from "../../config/db.js";
import { mapPacienteToCard } from "../paciente/paciente.mapper.js";
import oracledb from "oracledb"; 

export async function getPacienteCards(search = "") {
  let conn;

  try {
    conn = await getConnection();

    const sql = `
      SELECT
        p.paciente_id,
        p.nombre,
        p.ciudad_residencia,
        p.estado_residencia,
        p.fecha_ultima_visita,
        p.etapa_vida,
        m.estatus AS estatus_membresia,
        COUNT(ev.evento_id) AS total_consultas
      FROM PACIENTE p
      LEFT JOIN MEMBRESIA m ON p.paciente_id = m.paciente_id
      LEFT JOIN EVENTO_VISITA ev ON p.paciente_id = ev.paciente_id
      WHERE (:search IS NULL OR LOWER(p.nombre) LIKE '%' || LOWER(:search) || '%')
      GROUP BY p.paciente_id, p.nombre, p.ciudad_residencia, p.estado_residencia, p.fecha_ultima_visita, p.etapa_vida, m.estatus
      ORDER BY p.paciente_id DESC
    `;

    const binds = {
      search: search?.trim() ? search.trim() : null
    };

    const result = await conn.execute(sql, binds);

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
          p.ciudad_residencia || ', ' || p.estado_residencia AS direccion,
          p.telefono_casa AS telCasa,
          p.emergencia_contacto AS padres,
          TO_CHAR(p.fecha_alta, 'DD/MM/RR') AS fechaExpedicion,
          p.sangre_tipo AS tipoSangre,
          CASE 
              WHEN p.valvula = 'SI' THEN 'Sí'
              ELSE 'No'
          END AS valvula,
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

    const result = await conn.execute(
      sql,
      { pacienteId: id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (!result.rows || result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];

    return {
      folio: row.FOLIO,
      nombre: row.NOMBRE,
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
  } finally {
    if (conn) {
      await conn.close();
    }
  }
}

export async function getPacienteDetail(id) {
  let conn;

  try {
    conn = await getConnection();

    const sql = `
      SELECT
        p.paciente_id,
        p.nombre,
        p.ciudad_residencia,
        p.estado_residencia,
        p.fecha_ultima_visita,
        p.etapa_vida,
        m.estatus AS estatus_membresia,
        COUNT(ev.id) AS total_consultas
      FROM PACIENTE p
      LEFT JOIN MEMBRESIA m ON p.paciente_id = m.paciente_id
      LEFT JOIN EVENTO_VISITA ev ON p.paciente_id = ev.paciente_id
      WHERE p.paciente_id = :id
      GROUP BY p.paciente_id, p.nombre, p.ciudad_residencia, p.estado_residencia, p.fecha_ultima_visita, p.etapa_vida, m.estatus
    `;

    const binds = { id };

    const result = await conn.execute(sql, binds);
    
    if (!result.rows || result.rows.length === 0) {
      return null;
    }

    return mapPacienteToCard(result.rows[0]);
  } catch (error) {
    console.error("Error en getPacienteDetail:", error);
    throw error;
  } finally {
    if (conn) await conn.close();
  }
}