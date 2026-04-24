import { getConnection } from "../../config/db.js";
import oracledb from "oracledb";

export async function getMedicos() {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT MEDICO_ID, NOMBRE, APELLIDO, ESPECIALIDAD FROM MEDICO`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return result.rows;
  } finally {
    if (conn) await conn.close();
  }
}

export async function getServiciosByMedico(medicoId) {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT MEDICO_ID, SERVICIO_ID, NOMBRE_SERVICIO, DESCRIPCION, COSTO
       FROM SERVICIOS
       WHERE MEDICO_ID = :medicoId`,
      { medicoId: parseInt(medicoId) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return result.rows;
  } finally {
    if (conn) await conn.close();
  }
}

export async function guardarEventoServicio(pacienteId, fechaEvento, cuota, servicioId, horaCita) {
  let conn;
  try {
    conn = await getConnection();

    await conn.execute(
      `BEGIN
        insertar_evento_servicio(
          :pacienteId,
          :fechaEvento,
          :cuota,
          :servicioId,
          :horaCita
        );
      END;`,
      {
        pacienteId: parseInt(pacienteId),
        fechaEvento: new Date(fechaEvento),
        cuota,
        servicioId: parseInt(servicioId),
        horaCita
      }
    );

    return { ok: true }; 
  } finally {
    if (conn) await conn.close();
  }
}


export async function getMedicosConServicios() {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT 
         m.MEDICO_ID,
         m.NOMBRE,
         m.APELLIDO,
         m.ESPECIALIDAD,
         s.SERVICIO_ID,
         s.COSTO, 
       FROM MEDICO m
       LEFT JOIN SERVICIOS s 
         ON m.MEDICO_ID = s.MEDICO_ID`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return result.rows; 
  } finally {
    if (conn) await conn.close();
  }
}
