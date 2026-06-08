import { getConnection } from "../../../config/db.js";
import oracledb from "oracledb";

const SQL_MEDICAMENTOS = `
  SELECT MEDICINA_ID, DESCRIPCION, PRECIO, UNIDAD, CANTIDAD_TOTAL
    FROM INVENTARIO_MEDICINAS
   WHERE CANTIDAD_TOTAL > 0`;

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildPlaceholders(ids) {
  return ids.map((_, i) => `:id${i}`).join(", ");
}

function buildIdBinds(ids) {
  return Object.fromEntries(ids.map((id, i) => [`id${i}`, id]));
}

// ── Servicios públicos ────────────────────────────────────────────────────────

export async function getMedicamentos() {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(SQL_MEDICAMENTOS, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    return result.rows;
  } finally {
    if (conn) await conn.close();
  }
}

export async function getMedicamentosDisponibles(idsSeleccionados = []) {
  let conn;
  try {
    conn = await getConnection();

    const query = idsSeleccionados.length === 0
      ? SQL_MEDICAMENTOS
      : `${SQL_MEDICAMENTOS} AND MEDICINA_ID NOT IN (${buildPlaceholders(idsSeleccionados)})`;

    const binds = idsSeleccionados.length === 0 ? [] : buildIdBinds(idsSeleccionados);

    const result = await conn.execute(query, binds, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    return result.rows;
  } finally {
    if (conn) await conn.close();
  }
}

export async function guardarEventoMedicinas(pacienteId, medicamentos) {
  let conn;
  try {
    conn = await getConnection();

    const cuota     = medicamentos.reduce((acc, m) => acc + m.PRECIO * m.cantidad, 0);
    const ids       = medicamentos.map((m) => String(m.MEDICINA_ID));
    const cantidades = medicamentos.map((m) => m.cantidad);

    const result = await conn.execute(
      `BEGIN
        insertar_evento_medicinas(
          :pacienteId, :cuota,
          SYS.ODCIVARCHAR2LIST(${ids.map((_, i) => `:id${i}`).join(",")}),
          SYS.ODCINUMBERLIST(${cantidades.map((_, i) => `:cant${i}`).join(",")}),
          :eventoId
        );
      END;`,
      {
        pacienteId: parseInt(pacienteId),
        cuota,
        ...buildIdBinds(ids),
        ...Object.fromEntries(cantidades.map((c, i) => [`cant${i}`, c])),
        eventoId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      }
    );

    return { eventoId: result.outBinds.eventoId };
  } finally {
    if (conn) await conn.close();
  }
}
