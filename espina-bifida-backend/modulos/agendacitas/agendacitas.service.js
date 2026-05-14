import { getConnection } from "../../config/db.js";
import oracledb from "oracledb";

//obtener citas por fecha
export async function getCitasByFecha(fecha) {

  let conn;

  try {

    conn = await getConnection();

    const result = await conn.execute(
      `
      SELECT
        c.ID_CITA,
        c.ID_PACIENTE,
        p.NOMBRE,
        p.TELEFONO_CELULAR,
        c.FECHA_CITA,
        c.HORA_CITA,
        c.ESTATUS_CITA,
        c.MOTIVO,
        c.NOTAS
      FROM AGENDA_CITAS c
      INNER JOIN PACIENTE p
        ON c.ID_PACIENTE = p.PACIENTE_ID
      WHERE TO_CHAR(
        c.FECHA_CITA,
        'YYYY-MM-DD'
      ) = :fecha
      ORDER BY c.HORA_CITA
      `,
      {
        fecha,
      },
      {
        outFormat:
          oracledb.OUT_FORMAT_OBJECT,
      }
    );

    return result.rows.map((row) => ({
      id_cita: row.ID_CITA,
      id_paciente: row.ID_PACIENTE,
      nombre: row.NOMBRE,
      telefono: row.TELEFONO_CELULAR,
      fecha_cita: row.FECHA_CITA,
      hora_cita: row.HORA_CITA,
      estatus_cita: row.ESTATUS_CITA,
      motivo: row.MOTIVO,
      notas: row.NOTAS,
    }));

  } finally {

    if (conn) await conn.close();
  }
}

//crea una cita nueva
export async function crearCita(citaData) {

  let conn;

  try {

    conn = await getConnection();

    const result = await conn.execute(
      `
      INSERT INTO AGENDA_CITAS (
        ID_PACIENTE,
        FECHA_CITA,
        HORA_CITA,
        MOTIVO,
        NOTAS,
        ESTATUS_CITA
      )
      VALUES (
        :idPaciente,
        TO_DATE(:fechaCita, 'YYYY-MM-DD'),
        :horaCita,
        :motivo,
        :notas,
        :estatusCita
      )
      RETURNING ID_CITA INTO :idCita
      `,
      {
        idPaciente: parseInt(
          citaData.id_paciente
        ),

        // STRING NORMAL
        fechaCita:
          citaData.fecha_cita,

        // VARCHAR2(5)
        horaCita:
          citaData.hora_cita,

        motivo:
          citaData.motivo || null,

        notas:
          citaData.notas || null,

        estatusCita:
          citaData.estatus_cita ||
          "PENDIENTE",

        idCita: {
          dir: oracledb.BIND_OUT,
          type: oracledb.NUMBER,
        },
      },
      {
        autoCommit: true,
      }
    );

    return {
      ok: true,
      id_cita:
        result.outBinds.idCita[0],
    };

  } finally {

    if (conn) await conn.close();
  }
}

//cambiar estatus de cita
export async function actualizarEstatusCita(
  idCita,
  nuevoEstatus
) {
  let conn;

  try {
    conn = await getConnection();

    await conn.execute(
      `
      UPDATE AGENDA_CITAS
      SET ESTATUS_CITA = :nuevoEstatus
      WHERE ID_CITA = :idCita
      `,
      {
        idCita: parseInt(idCita),
        nuevoEstatus,
      },
      {
        autoCommit: true,
      }
    );

    return { ok: true };
  } finally {
    if (conn) await conn.close();
  }
}

//eliminar cita
export async function eliminarCita(idCita) {
  let conn;

  try {
    conn = await getConnection();

    await conn.execute(
      `
      DELETE FROM AGENDA_CITAS
      WHERE ID_CITA = :idCita
      `,
      {
        idCita: parseInt(idCita),
      },
      {
        autoCommit: true,
      }
    );

    return { ok: true };
  } finally {
    if (conn) await conn.close();
  }
}

//obtiener cita por id
export async function getCitaById(idCita) {
  let conn;

  try {
    conn = await getConnection();

    const result = await conn.execute(
      `
      SELECT
        c.ID_CITA,
        c.ID_PACIENTE,
        p.NOMBRE,
        p.TELEFONO_CELULAR,
        c.FECHA_CITA,
        c.HORA_CITA,
        c.ESTATUS_CITA,
        c.MOTIVO,
        c.NOTAS
      FROM AGENDA_CITAS c
      INNER JOIN PACIENTE p
        ON c.ID_PACIENTE = p.PACIENTE_ID
      WHERE c.ID_CITA = :idCita
      `,
      {
        idCita: parseInt(idCita),
      },
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      }
    );

    return result.rows[0];
  } finally {
    if (conn) await conn.close();
  }
}