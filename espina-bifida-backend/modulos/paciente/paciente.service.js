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
  } finally {
    if (conn) await conn.close();
  }
}