import { getConnection } from "../../config/db.js";
import oracledb from "oracledb";
import { mapNotificacionToCard } from "./notificaciones.mapper.js";

export async function getNotificaciones(estado = null) {
  let conn;
  try {
    conn = await getConnection();
    const sql = `
      SELECT
        n.notificacion_id,
        n.paciente_id,
        n.usuario_id,
        n.titulo,
        n.mensaje,
        n.estado_proceso,
        TO_CHAR(n.fecha_creacion, 'DD/MM/YYYY HH24:MI') AS fecha_creacion,
        p.nombre,
        p.apellido,
        p.curp,
        p.ciudad_residencia,
        p.estado_residencia,
        p.telefono_casa,
        p.telefono_celular
      FROM NOTIFICACION n
      INNER JOIN PACIENTE p ON n.paciente_id = p.paciente_id
      WHERE (:estado IS NULL OR LOWER(n.estado_proceso) = LOWER(:estado))
        AND LOWER(n.estado_proceso) != 'aprobado'
      ORDER BY n.fecha_creacion DESC
    `;
    const result = await conn.execute(
      sql,
      { estado: estado?.trim() ? estado.trim() : null },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return result.rows.map(mapNotificacionToCard);
  } catch (error) {
    console.error("Error en getNotificaciones:", error);
    throw error;
  } finally {
    if (conn) await conn.close();
  }
}

export async function getNotificacionById(notificacionId) {
  let conn;
  try {
    conn = await getConnection();
    const sql = `
      SELECT
        n.notificacion_id,
        n.estado_proceso,
        TO_CHAR(n.fecha_creacion, 'DD/MM/YYYY HH24:MI') AS fecha_creacion,
        p.paciente_id,
        p.nombre,
        p.apellido,
        p.curp,
        p.genero,
        TO_CHAR(p.fecha_nacimiento, 'YYYY-MM-DD') AS fecha_nacimiento,
        p.direccion,
        p.ciudad_residencia,
        p.estado_residencia,
        p.codigo_postal,
        p.telefono_casa,
        p.telefono_celular,
        p.email,
        p.emergencia_contacto,
        p.emergencia_telefono,
        p.lugar_nacimiento,
        p.hospital_nacimiento,
        p.sangre_tipo,
        p.valvula,
        p.etapa_vida,
        p.notas_adicionales,
        p.fotografia,
        pb.tipo_padecimiento AS tipo_espina_bifida,
        pb.descripcion       AS otros_padecimiento
      FROM NOTIFICACION n
      INNER JOIN PACIENTE p ON n.paciente_id = p.paciente_id
      LEFT JOIN PACIENTE_PADECIMIENTO pp ON pp.PACIENTE_ID = p.PACIENTE_ID
      LEFT JOIN PADECIMIENTOEB pb ON pb.PADECIMIENTO_ID = pp.PADECIMIENTO_ID
      WHERE n.notificacion_id = :notificacionId
    `;
    const result = await conn.execute(
      sql,
      { notificacionId: Number(notificacionId) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (!result.rows || result.rows.length === 0) return null;
    const row = result.rows[0];

    let fotoBase64 = null;
    if (row.FOTOGRAFIA) {
      const chunks = [];
      await new Promise((resolve, reject) => {
        row.FOTOGRAFIA.on("data", (chunk) => chunks.push(chunk));
        row.FOTOGRAFIA.on("end", resolve);
        row.FOTOGRAFIA.on("error", reject);
      });
      const buffer = Buffer.concat(chunks);
      fotoBase64 = `data:image/jpeg;base64,${buffer.toString("base64")}`;
    }

    const resMadre = await conn.execute(
      `SELECT NOMBRE, LUGAR_NACIMIENTO, ESCOLARIDAD, OCUPACION,
        EDAD, SEGURO_MEDICO, CD_EMBARAZO, ACIDO_FOLICO, CITAS_CONTROL
      FROM HISTORIAL_MADRE WHERE PACIENTE_ID = :pacienteId`,
      { pacienteId: row.PACIENTE_ID },
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        fetchInfo: {
          NOMBRE:           { type: oracledb.STRING },
          LUGAR_NACIMIENTO: { type: oracledb.STRING },
          ESCOLARIDAD:      { type: oracledb.STRING },
          OCUPACION:        { type: oracledb.STRING },
          SEGURO_MEDICO:    { type: oracledb.STRING },
          CD_EMBARAZO:      { type: oracledb.STRING },
          ACIDO_FOLICO:     { type: oracledb.STRING },
        }
      }
    );

    const resPadre = await conn.execute(
      `SELECT NOMBRE, LUGAR_NACIMIENTO, ESCOLARIDAD, OCUPACION, EDAD, SEGURO_MEDICO
      FROM HISTORIAL_PADRE WHERE PACIENTE_ID = :pacienteId`,
      { pacienteId: row.PACIENTE_ID },
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        fetchInfo: {
          NOMBRE:           { type: oracledb.STRING },
          LUGAR_NACIMIENTO: { type: oracledb.STRING },
          ESCOLARIDAD:      { type: oracledb.STRING },
          OCUPACION:        { type: oracledb.STRING },
          SEGURO_MEDICO:    { type: oracledb.STRING },
        }
      }
    );

    const resAmbos = await conn.execute(
      `SELECT ADICCIONES, HIJO_DTN, FAMILIAR_DTN, EXPO_TOXICOS, DESCRIPCION_EXPO_TOXICOS
      FROM HISTORIAL_AMBOS WHERE PACIENTE_ID = :pacienteId`,
      { pacienteId: row.PACIENTE_ID },
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        fetchInfo: {
          ADICCIONES:               { type: oracledb.STRING },
          HIJO_DTN:                 { type: oracledb.STRING },
          FAMILIAR_DTN:             { type: oracledb.STRING },
          EXPO_TOXICOS:             { type: oracledb.STRING },
          DESCRIPCION_EXPO_TOXICOS: { type: oracledb.STRING },
        }
      }
    );

    const madre = resMadre.rows?.[0] || null;
    const padre = resPadre.rows?.[0] || null;
    const ambos = resAmbos.rows?.[0] || null;
    const tutores = [];

    if (madre) {
      tutores.push({
        tutorParentesco:        "Madre",
        tutorNombre:            madre.NOMBRE           || "",
        tutorLugarNacimiento:   madre.LUGAR_NACIMIENTO || "",
        tutorEscolaridad:       madre.ESCOLARIDAD      || "",
        tutorOcupacion:         madre.OCUPACION        || "",
        tutorEdad:              madre.EDAD ? String(madre.EDAD) : "",
        tutorSeguroMedico:      "",
        madreSeguroMedico:      madre.SEGURO_MEDICO    || "",
        cdEmbarazo:             madre.CD_EMBARAZO      || "",
        acidoFolico:            madre.ACIDO_FOLICO === "S" ? "Sí" : madre.ACIDO_FOLICO === "N" ? "No" : "",
        citasControl:           madre.CITAS_CONTROL ? String(madre.CITAS_CONTROL) : "",
        adicciones:             ambos?.ADICCIONES      || "",
        hijoDtn:                ambos?.HIJO_DTN    === "SI" ? "Sí" : ambos?.HIJO_DTN    === "NO" ? "No" : "",
        familiarDtn:            ambos?.FAMILIAR_DTN=== "SI" ? "Sí" : ambos?.FAMILIAR_DTN=== "NO" ? "No" : "",
        expoToxicos:            ambos?.EXPO_TOXICOS=== "SI" ? "Sí" : ambos?.EXPO_TOXICOS=== "NO" ? "No" : "",
        descripcionExpoToxicos: ambos?.DESCRIPCION_EXPO_TOXICOS || "",
      });
    }

    if (padre) {
      tutores.push({
        tutorParentesco:        "Padre",
        tutorNombre:            padre.NOMBRE           || "",
        tutorLugarNacimiento:   padre.LUGAR_NACIMIENTO || "",
        tutorEscolaridad:       padre.ESCOLARIDAD      || "",
        tutorOcupacion:         padre.OCUPACION        || "",
        tutorEdad:              padre.EDAD ? String(padre.EDAD) : "",
        tutorSeguroMedico:      padre.SEGURO_MEDICO    || "",
        madreSeguroMedico:      "",
        cdEmbarazo:             "",
        acidoFolico:            "",
        citasControl:           "",
        adicciones:             ambos?.ADICCIONES      || "",
        hijoDtn:                ambos?.HIJO_DTN    === "SI" ? "Sí" : ambos?.HIJO_DTN    === "NO" ? "No" : "",
        familiarDtn:            ambos?.FAMILIAR_DTN=== "SI" ? "Sí" : ambos?.FAMILIAR_DTN=== "NO" ? "No" : "",
        expoToxicos:            ambos?.EXPO_TOXICOS=== "SI" ? "Sí" : ambos?.EXPO_TOXICOS=== "NO" ? "No" : "",
        descripcionExpoToxicos: ambos?.DESCRIPCION_EXPO_TOXICOS || "",
      });
    }

    return {
      NOTIFICACION_ID:     row.NOTIFICACION_ID     ?? null,
      ESTADO_PROCESO:      row.ESTADO_PROCESO       ?? null,
      FECHA_CREACION:      row.FECHA_CREACION       ?? null,
      PACIENTE_ID:         row.PACIENTE_ID          ?? null,
      NOMBRE:              row.NOMBRE               ?? null,
      APELLIDO:            row.APELLIDO             ?? null,
      CURP:                row.CURP                 ?? null,
      GENERO:              row.GENERO               ?? null,
      FECHA_NACIMIENTO:    row.FECHA_NACIMIENTO     ?? null,
      DIRECCION:           row.DIRECCION            ?? null,
      CIUDAD_RESIDENCIA:   row.CIUDAD_RESIDENCIA    ?? null,
      ESTADO_RESIDENCIA:   row.ESTADO_RESIDENCIA    ?? null,
      CODIGO_POSTAL:       row.CODIGO_POSTAL        ?? null,
      TELEFONO_CASA:       row.TELEFONO_CASA        ?? null,
      TELEFONO_CELULAR:    row.TELEFONO_CELULAR     ?? null,
      EMAIL:               row.EMAIL                ?? null,
      EMERGENCIA_CONTACTO: row.EMERGENCIA_CONTACTO  ?? null,
      EMERGENCIA_TELEFONO: row.EMERGENCIA_TELEFONO  ?? null,
      LUGAR_NACIMIENTO:    row.LUGAR_NACIMIENTO     ?? null,
      HOSPITAL_NACIMIENTO: row.HOSPITAL_NACIMIENTO  ?? null,
      SANGRE_TIPO:         row.SANGRE_TIPO          ?? null,
      VALVULA:             row.VALVULA              ?? null,
      ETAPA_VIDA:          row.ETAPA_VIDA           ?? null,
      NOTAS_ADICIONALES:   row.NOTAS_ADICIONALES    ?? null,
      TIPO_ESPINA_BIFIDA:  row.TIPO_ESPINA_BIFIDA   ?? null,
      OTROS_PADECIMIENTO:  row.OTROS_PADECIMIENTO   ?? null,
      FOTO:                fotoBase64,
      TUTORES:             tutores,
    };
  } catch (error) {
    console.error("Error en getNotificacionById:", error);
    throw error;
  } finally {
    if (conn) await conn.close();
  }
}

export async function aprobarNotificacion(notificacionId, usuarioId) {
  let conn;
  try {
    conn = await getConnection();

    const result = await conn.execute(
      `UPDATE NOTIFICACION SET estado_proceso = 'aprobado'
      WHERE notificacion_id = :notificacionId AND estado_proceso = 'pendiente'`,
      { notificacionId: Number(notificacionId) },
      { autoCommit: true }
    );

    return result.rowsAffected > 0;
  } catch (error) {
    console.error("Error en aprobarNotificacion:", error);
    throw error;
  } finally {
    if (conn) await conn.close();
  }
}

export async function rechazarNotificacion(notificacionId, usuarioId) {
  let conn;
  try {
    conn = await getConnection();

    const result = await conn.execute(
      `UPDATE NOTIFICACION SET estado_proceso = 'rechazado'
      WHERE notificacion_id = :notificacionId AND estado_proceso = 'pendiente'`,
      { notificacionId: Number(notificacionId) },
      { autoCommit: true }
    );

    return result.rowsAffected > 0;
  } catch (error) {
    console.error("Error en rechazarNotificacion:", error);
    throw error;
  } finally {
    if (conn) await conn.close();
  }
}

export async function eliminarNotificacionesAntiguas() {
  let conn;
  try {
    conn = await getConnection();

    const pacientes = await conn.execute(
      `SELECT DISTINCT paciente_id FROM NOTIFICACION
      WHERE TRUNC(fecha_creacion) <= TRUNC(SYSDATE) - 14
      AND LOWER(estado_proceso) != 'aprobado'`,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const ids = pacientes.rows.map((r) => r.PACIENTE_ID);

    if (ids.length === 0) return 0;

    const placeholders = ids.map((_, i) => `:id${i}`).join(",");
    const binds = Object.fromEntries(ids.map((id, i) => [`id${i}`, id]));

    await conn.execute(`DELETE FROM NOTIFICACION WHERE paciente_id IN (${placeholders})`, binds, { autoCommit: true });
    await conn.execute(`DELETE FROM PACIENTE_PADECIMIENTO WHERE paciente_id IN (${placeholders})`, binds, { autoCommit: true });
    await conn.execute(`DELETE FROM HISTORIAL_MADRE WHERE paciente_id IN (${placeholders})`, binds, { autoCommit: true });
    await conn.execute(`DELETE FROM HISTORIAL_PADRE WHERE paciente_id IN (${placeholders})`, binds, { autoCommit: true });
    await conn.execute(`DELETE FROM EVENTO_VISITA WHERE paciente_id IN (${placeholders})`, binds, { autoCommit: true });
    await conn.execute(`DELETE FROM MEMBRESIA WHERE paciente_id IN (${placeholders})`, binds, { autoCommit: true });
    await conn.execute(`DELETE FROM PACIENTE WHERE paciente_id IN (${placeholders})`, binds, { autoCommit: true });

    return ids.length;
  } catch (error) {
    console.error("Error en eliminarNotificacionesAntiguas:", error);
    throw error;
  } finally {
    if (conn) await conn.close();
  }
}