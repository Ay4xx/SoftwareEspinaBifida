import { getConnection } from "../../../config/db.js"; 
import oracledb from "oracledb";

export async function getMedicamentos() {
    let conn;
    try {
      conn = await getConnection();
      const result = await conn.execute(
        `SELECT MEDICINA_ID, DESCRIPCION, PRECIO, UNIDAD, CANTIDAD_TOTAL 
         FROM INVENTARIO_MEDICINAS
         WHERE CANTIDAD_TOTAL > 0`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows;
    } finally {
      if (conn) await conn.close();
    }
  }
  
  export async function getMedicamentosDisponibles(idsSeleccionados = []) {
    let conn;
    try {
      conn = await getConnection();
  
      let query;
      let binds;
  
      if (idsSeleccionados.length === 0) {
        query = `SELECT MEDICINA_ID, DESCRIPCION, PRECIO, UNIDAD, CANTIDAD_TOTAL 
                 FROM INVENTARIO_MEDICINAS
                 WHERE CANTIDAD_TOTAL > 0`;
        binds = [];
      } else {
        const placeholders = idsSeleccionados.map((_, i) => `:id${i}`).join(", ");
        query = `SELECT MEDICINA_ID, DESCRIPCION, PRECIO, UNIDAD, CANTIDAD_TOTAL 
                 FROM INVENTARIO_MEDICINAS 
                 WHERE CANTIDAD_TOTAL > 0
                 AND MEDICINA_ID NOT IN (${placeholders})`;
        binds = idsSeleccionados.reduce((acc, id, i) => {
          acc[`id${i}`] = id;
          return acc;
        }, {});
      }
  
      const result = await conn.execute(query, binds, { outFormat: oracledb.OUT_FORMAT_OBJECT });
      return result.rows;
    } finally {
      if (conn) await conn.close();
    }
  }