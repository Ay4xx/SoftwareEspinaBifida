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

  export async function guardarEventoEquipoMedico(pacienteId, equipos) {
    let conn;
    try {
      conn = await getConnection();
  
      // La cuota se calcula sumando precio * cantidad de cada equipo
      const cuota = equipos.reduce((acc, e) => acc + e.PRECIO * e.cantidad, 0);
  
      // Preparamos listas de IDs, cantidades y fechas finales
      const ids = equipos.map((e) => String(e.EQUIPO_M_ID));
      const cantidades = equipos.map((e) => e.cantidad);
      const fechasFinal = equipos.map((e) => e.fechaFinal); // formato 'YYYY-MM-DD'
  
      const fechasInicio = equipos.map(() => new Date().toISOString().split("T")[0]); // hoy
const regresados = equipos.map(() => "NO");

      const result = await conn.execute(
        `BEGIN
          insertar_evento_equipo(
            :pacienteId,
            :cuota,
            SYS.ODCIVARCHAR2LIST(${ids.map((_, i) => `:id${i}`).join(",")}),
            SYS.ODCINUMBERLIST(${cantidades.map((_, i) => `:cant${i}`).join(",")}),
            SYS.ODCIVARCHAR2LIST(${fechasInicio.map((_, i) => `:fini${i}`).join(",")}),
            SYS.ODCIVARCHAR2LIST(${fechasFinal.map((_, i) => `:ffin${i}`).join(",")}),
            SYS.ODCIVARCHAR2LIST(${regresados.map((_, i) => `:reg${i}`).join(",")}),
            :eventoId
          );
        END;`,
        {
          pacienteId: parseInt(pacienteId),
          cuota,
          ...ids.reduce((acc, id, i) => ({ ...acc, [`id${i}`]: id }), {}),
          ...cantidades.reduce((acc, c, i) => ({ ...acc, [`cant${i}`]: c }), {}),
          ...fechasInicio.reduce((acc, f, i) => ({ ...acc, [`fini${i}`]: f }), {}),
          ...fechasFinal.reduce((acc, f, i) => ({ ...acc, [`ffin${i}`]: f }), {}),
          ...regresados.reduce((acc, r, i) => ({ ...acc, [`reg${i}`]: r }), {}),
          eventoId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        }
      );
        
      return { eventoId: result.outBinds.eventoId };
    } finally {
      if (conn) await conn.close();
    }
  }
  
  