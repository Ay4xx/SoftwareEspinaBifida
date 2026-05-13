import { getConnection } from "../../../config/db.js"; 
import oracledb from "oracledb";

export async function insertarMedicina({ descripcion, unidad, precio, medicion, cantidad_total }) {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `BEGIN
        insertar_medicina(
          :descripcion,
          :unidad,
          :precio,
          :medicion,
          :cantidad_total,
          :medicina_id
        );
      END;`,
      {
        descripcion,
        unidad,
        precio: parseFloat(precio),
        medicion: parseFloat(medicion),
        cantidad_total: parseInt(cantidad_total),
        medicina_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );
    return { medicina_id: result.outBinds.medicina_id };
  } finally {
    if (conn) await conn.close();
  }
}

export async function insertarEquipoMedico({ descripcion, precio, cantidad_total }) {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `BEGIN
        insertar_equipo_medico(
          :descripcion,
          :precio,
          :cantidad_total,
          :equipo_m_id
        );
      END;`,
      {
        descripcion,
        precio: parseFloat(precio),
        cantidad_total: parseInt(cantidad_total),
        equipo_m_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );
    return { equipo_m_id: result.outBinds.equipo_m_id };
  } finally {
    if (conn) await conn.close();
  }
}


export async function verificarDuplicado(descripcion, tipo) {
  let conn;
  try {
    conn = await getConnection();
    const tabla = tipo === "medicina" ? "INVENTARIO_MEDICINAS" : "INVENTARIO_EQUIPO_MEDICO";
    const result = await conn.execute(
      `SELECT COUNT(*) AS TOTAL FROM ${tabla} WHERE LOWER(DESCRIPCION) = LOWER(:descripcion)`,
      { descripcion },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    console.log("Resultado duplicado:", result.rows[0]); 
    return result.rows[0].TOTAL > 0;
  } finally {
    if (conn) await conn.close();
  }
}


export async function actualizarCantidadMedicina(medicinaId, cantidad) {
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `BEGIN
        actualizar_cantidad_medicina(:medicinaId, :cantidad);
      END;`,
      {
        medicinaId: parseInt(medicinaId),
        cantidad: parseInt(cantidad)
      }
    );
  } finally {
    if (conn) await conn.close();
  }
}

export async function actualizarCantidadEquipo(equipoId, cantidad) {
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `BEGIN
        actualizar_cantidad_equipo(:equipoId, :cantidad);
      END;`,
      {
        equipoId: parseInt(equipoId),
        cantidad: parseInt(cantidad)
      }
    );
  } finally {
    if (conn) await conn.close();
  }
}