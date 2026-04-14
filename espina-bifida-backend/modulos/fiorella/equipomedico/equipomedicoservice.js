import { getConnection } from "../../../config/db.js"; 
import oracledb from "oracledb";

export async function getEquipoMedico() {
    let conn;
    try {
      conn = await getConnection();
      const result = await conn.execute(
        `SELECT EQUIPO_M_ID, DESCRIPCION, PRECIO, CANTIDAD_TOTAL 
         FROM INVENTARIO_EQUIPO_MEDICO
         WHERE CANTIDAD_TOTAL > 0`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows;
    } finally {
      if (conn) await conn.close();
    }
  }
  
  export async function getEquipoDisponibles(idsSeleccionados = []) {
    let conn;
    try {
      conn = await getConnection();
  
      let query;
      let binds;
  
      if (idsSeleccionados.length === 0) {
        query = `SELECT EQUIPO_M_ID, DESCRIPCION, PRECIO, CANTIDAD_TOTAL 
                 FROM INVENTARIO_EQUIPO_MEDICO
                 WHERE CANTIDAD_TOTAL > 0`;
        binds = [];
      } else {
        const placeholders = idsSeleccionados.map((_, i) => `:id${i}`).join(", ");
        query = `SELECT EQUIPO_M_ID, DESCRIPCION, PRECIO, CANTIDAD_TOTAL 
                 FROM INVENTARIO_EQUIPO_MEDICO 
                 WHERE CANTIDAD_TOTAL > 0
                 AND EQUIPO_M_ID NOT IN (${placeholders})`;
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