import { getConnection } from "../../config/db.js";
import { mapPacienteToCard } from "../paciente/paciente.mapper.js";

export async function getPacienteCards(search = "") {
  let conn;

  try {
    conn = await getConnection();

    const sql = `
      SELECT
        paciente_id,
        nombre,
        ciudad_residencia,
        estado_residencia,
        fecha_ultima_visita,
        etapa_vida,
        vive
      FROM PACIENTE
      WHERE (:search IS NULL OR LOWER(nombre) LIKE '%' || LOWER(:search) || '%')
      ORDER BY paciente_id DESC
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

export async function getPacienteDetail(id) {
  let conn;

  try {
    conn = await getConnection();

    const sql = `
      SELECT
        paciente_id,
        nombre,
        ciudad_residencia,
        estado_residencia,
        fecha_ultima_visita,
        etapa_vida,
        vive
      FROM PACIENTE
      WHERE paciente_id = :id
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