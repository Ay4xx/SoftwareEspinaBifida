import oracledb from "oracledb";
import { getConnection } from "../../config/db.js";
import { mapPacienteToCard } from "../paciente/paciente.mapper.js";
import { obtenerMembresiaPorPacienteId } from "../membresia/membresia.service.js";

export async function getPacienteCards(search = "") {
  let conn;
  try {
    conn = await getConnection();
    const sql = `
      SELECT
        p.paciente_id, p.nombre, p.apellido, p.fotografia,
        p.ciudad_residencia, p.estado_residencia,
        p.fecha_ultima_visita, p.etapa_vida,
        m.estatus AS estatus_membresia,
        NVL(ev.total_consultas, 0) AS total_consultas
      FROM PACIENTE p
      LEFT JOIN MEMBRESIA m ON p.paciente_id = m.paciente_id
      LEFT JOIN (
        SELECT paciente_id, COUNT(evento_id) AS total_consultas
        FROM EVENTO_VISITA GROUP BY paciente_id
      ) ev ON p.paciente_id = ev.paciente_id
      LEFT JOIN NOTIFICACION n ON p.paciente_id = n.paciente_id
      WHERE (n.estado_proceso = 'aprobado' OR n.notificacion_id IS NULL)
        AND (
          :search IS NULL
          OR LOWER(p.nombre) LIKE '%' || LOWER(:search) || '%'
          OR LOWER(p.apellido) LIKE '%' || LOWER(:search) || '%'
          OR LOWER(p.nombre || ' ' || p.apellido) LIKE '%' || LOWER(:search) || '%'
        )
      ORDER BY p.paciente_id DESC
    `;
    const result = await conn.execute(
      sql,
      { search: search?.trim() ? search.trim() : null },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return result.rows.map(mapPacienteToCard);
  } catch (error) {
    console.error("Error en getPacienteCards:", error);
    throw error;
  } finally {
    if (conn) await conn.close();
  }
}

export async function getPacienteCredencial(id) {
  let conn;
  try {
    conn = await getConnection();
    const sql = `
      SELECT
        LPAD(p.paciente_id, 3, '0') AS folio,
        p.nombre, p.apellido,
        p.ciudad_residencia || ', ' || p.estado_residencia AS direccion,
        p.telefono_casa AS telCasa,
        p.emergencia_contacto AS padres,
        TO_CHAR(p.fecha_alta, 'DD/MM/RR') AS fechaExpedicion,
        p.sangre_tipo AS tipoSangre,
        CASE WHEN p.valvula = 'SI' THEN 'Sí' ELSE 'No' END AS valvula,
        p.emergencia_contacto AS accidenteAvisar,
        p.emergencia_telefono AS telefonoEmergencia,
        p.email AS correo,
        TO_CHAR(p.fecha_nacimiento, 'DD/MM/YYYY') AS fechaNacimiento,
        p.lugar_nacimiento AS lugarNacimiento,
        p.hospital_nacimiento AS hospital
      FROM PACIENTE p WHERE p.paciente_id = :pacienteId
    `;
    const result = await conn.execute(sql, { pacienteId: id }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    if (!result.rows || result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      folio:              row.FOLIO,
      nombre:             row.NOMBRE,
      apellido:           row.APELLIDO,
      nombreCompleto:     [row.NOMBRE, row.APELLIDO].filter(Boolean).join(" "),
      direccion:          row.DIRECCION,
      telCasa:            row.TELCASA,
      padres:             row.PADRES,
      fechaExpedicion:    row.FECHAEXPEDICION,
      tipoSangre:         row.TIPOSANGRE,
      valvula:            row.VALVULA,
      accidenteAvisar:    row.ACCIDENTEAVISAR,
      telefonoEmergencia: row.TELEFONOEMERGENCIA,
      correo:             row.CORREO,
      fechaNacimiento:    row.FECHANACIMIENTO,
      lugarNacimiento:    row.LUGARNACIMIENTO,
      hospital:           row.HOSPITAL,
    };
  } catch (error) {
    console.error("Error en getPacienteCredencial:", error);
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
        p.paciente_id, p.nombre, p.apellido, p.fotografia,
        p.ciudad_residencia, p.estado_residencia,
        p.fecha_ultima_visita, p.etapa_vida,
        NVL(ev.total_consultas, 0) AS total_consultas
      FROM PACIENTE p
      LEFT JOIN (
        SELECT paciente_id, COUNT(evento_id) AS total_consultas
        FROM EVENTO_VISITA GROUP BY paciente_id
      ) ev ON p.paciente_id = ev.paciente_id
      WHERE p.paciente_id = :id
    `;
    const result = await conn.execute(sql, { id: Number(id) }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    if (!result.rows || result.rows.length === 0) return null;
    const row = result.rows[0];
    const membresia = await obtenerMembresiaPorPacienteId(id);
    return mapPacienteToCard({ ...row, ESTATUS_MEMBRESIA: membresia?.ESTATUS });
  } catch (error) {
    console.error("Error en getPacienteDetail:", error);
    throw error;
  } finally {
    if (conn) await conn.close();
  }
}

export async function getPacienteDetalle(pacienteId) {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT p.PACIENTE_ID, p.NOMBRE, p.APELLIDO, p.EMAIL,
        p.TELEFONO_CELULAR, p.ESTADO_RESIDENCIA, p.FECHA_ALTA, p.VIVE
      FROM PACIENTE p WHERE p.PACIENTE_ID = :pacienteId`,
      { pacienteId: Number(pacienteId) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (!result.rows || result.rows.length === 0) return null;
    const row = result.rows[0];
    const membresia = await obtenerMembresiaPorPacienteId(pacienteId);
    return {
      PACIENTE_ID:       row.PACIENTE_ID ?? null,
      NOMBRE:            row.NOMBRE ?? null,
      APELLIDO:          row.APELLIDO ?? null,
      NOMBRE_COMPLETO:   [row.NOMBRE, row.APELLIDO].filter(Boolean).join(" "),
      EMAIL:             row.EMAIL ?? null,
      TELEFONO_CELULAR:  row.TELEFONO_CELULAR ?? null,
      ESTADO_RESIDENCIA: row.ESTADO_RESIDENCIA ?? null,
      FECHA_ALTA:        row.FECHA_ALTA ? new Date(row.FECHA_ALTA).toISOString() : null,
      VIVE:              row.VIVE ?? null,
      FECHA_INICIO:      membresia?.FECHA_INICIO ? new Date(membresia.FECHA_INICIO).toISOString() : null,
      FECHA_FIN:         membresia?.FECHA_FIN ? new Date(membresia.FECHA_FIN).toISOString() : null,
      foto:              `/api/pacientes/${row.PACIENTE_ID}/foto`,
    };
  } catch (error) {
    console.error("Error en getPacienteDetalle:", error);
    throw error;
  } finally {
    if (conn) await conn.close();
  }
}

export async function guardarFoto(id, buffer) {
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `UPDATE PACIENTE SET FOTOGRAFIA = :foto WHERE PACIENTE_ID = :id`,
      { foto: buffer, id: Number(id) },
      { autoCommit: true }
    );
  } catch (error) {
    console.error("Error en guardarFoto:", error);
    throw error;
  } finally {
    if (conn) await conn.close();
  }
}

export async function obtenerFoto(id) {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT FOTOGRAFIA FROM PACIENTE WHERE PACIENTE_ID = :id`,
      { id: Number(id) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (!result.rows || result.rows.length === 0) return null;
    const lob = result.rows[0].FOTOGRAFIA;
    if (!lob) return null;
    const chunks = [];
    return await new Promise((resolve, reject) => {
      lob.on("data", (chunk) => chunks.push(chunk));
      lob.on("end", () => resolve(Buffer.concat(chunks)));
      lob.on("error", reject);
    });
  } catch (error) {
    console.error("Error en obtenerFoto:", error);
    throw error;
  } finally {
    if (conn) await conn.close();
  }
}

export async function updatePaciente(pacienteId, datos = {}, archivo = null) {
  let conn;
  try {
    conn = await getConnection();
    const valvula = datos.usaValvula === "Sí" ? "SI" : datos.usaValvula === "No" ? "NO" : null;
    if (archivo) await guardarFoto(pacienteId, archivo.buffer);

    await conn.execute(
      `UPDATE PACIENTE SET
        NOMBRE               = :nombre,
        APELLIDO             = :apellido,
        CURP                 = :curp,
        GENERO               = :genero,
        FECHA_NACIMIENTO     = TO_DATE(:fechaNacimiento, 'YYYY-MM-DD'),
        DIRECCION            = :direccion,
        CIUDAD_RESIDENCIA    = :ciudad,
        ESTADO_RESIDENCIA    = :estado,
        CODIGO_POSTAL        = :codigoPostal,
        TELEFONO_CASA        = :telefonoCasa,
        TELEFONO_CELULAR     = :telefonoCelular,
        EMAIL                = :correo,
        EMERGENCIA_CONTACTO  = :emergenciaContacto,
        EMERGENCIA_TELEFONO  = :emergenciaTelefono,
        LUGAR_NACIMIENTO     = :lugarNacimiento,
        HOSPITAL_NACIMIENTO  = :hospitalNacimiento,
        SANGRE_TIPO          = :tipoSangre,
        VALVULA              = :valvula,
        NOTAS_ADICIONALES    = :notas
      WHERE PACIENTE_ID = :pacienteId`,
      {
        nombre:             datos.nombre             || null,
        apellido:           datos.apellido           || null,
        curp:               datos.curp               || null,
        genero:             datos.genero             || null,
        fechaNacimiento:    datos.fechaNacimiento    || null,
        direccion:          datos.direccion          || null,
        ciudad:             datos.ciudad             || null,
        estado:             datos.estado             || null,
        codigoPostal:       datos.codigoPostal       || null,
        telefonoCasa:       datos.telefonoCasa       || null,
        telefonoCelular:    datos.telefonoCelular    || null,
        correo:             datos.correo             || null,
        emergenciaContacto: datos.emergenciaContacto || null,
        emergenciaTelefono: datos.emergenciaTelefono || null,
        lugarNacimiento:    datos.lugarNacimiento    || null,
        hospitalNacimiento: datos.hospitalNacimiento || null,
        tipoSangre:         datos.tipoSangre         || null,
        valvula,
        notas:              datos.notas              || null,
        pacienteId,
      },
      { autoCommit: false }
    );

    if (datos.tipoEspinaBifida) {
      const resPad = await conn.execute(
        `SELECT PADECIMIENTO_ID FROM PADECIMIENTOEB
        WHERE UPPER(TIPO_PADECIMIENTO) = UPPER(:tipo)`,
        { tipo: datos.tipoEspinaBifida },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (resPad.rows.length > 0) {
        const padecimientoId = resPad.rows[0].PADECIMIENTO_ID;

        const checkPad = await conn.execute(
          `SELECT COUNT(*) AS total FROM PACIENTE_PADECIMIENTO WHERE PACIENTE_ID = :pacienteId`,
          { pacienteId },
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (checkPad.rows[0].TOTAL > 0) {
          await conn.execute(
            `UPDATE PACIENTE_PADECIMIENTO SET PADECIMIENTO_ID = :padecimientoId
             WHERE PACIENTE_ID = :pacienteId`,
            { padecimientoId, pacienteId },
            { autoCommit: false }
          );
        } else {
          await conn.execute(
            `INSERT INTO PACIENTE_PADECIMIENTO
              (PADECIMIENTO_PACIENTE_ID, PACIENTE_ID, PADECIMIENTO_ID)
            VALUES
              ((SELECT NVL(MAX(PADECIMIENTO_PACIENTE_ID),0)+1 FROM PACIENTE_PADECIMIENTO),
               :pacienteId, :padecimientoId)`,
            { pacienteId, padecimientoId },
            { autoCommit: false }
          );
        }

        if (datos.tipoEspinaBifida === "OTROS" && datos.otrosPadecimiento) {
          await conn.execute(
            `UPDATE PADECIMIENTOEB SET DESCRIPCION = :descripcion
             WHERE PADECIMIENTO_ID = :padecimientoId`,
            { descripcion: datos.otrosPadecimiento || null, padecimientoId },
            { autoCommit: false }
          );
        }
      }
    }

    await conn.commit();
  } catch (error) {
    if (conn) await conn.rollback();
    console.error("Error en updatePaciente:", error);
    throw error;
  } finally {
    if (conn) await conn.close();
  }
}

export async function getPacienteCompleto(id) {
  let conn;
  try {
    conn = await getConnection();

    const resPaciente = await conn.execute(
      `SELECT
        p.PACIENTE_ID, p.NOMBRE, p.APELLIDO, p.CURP, p.GENERO,
        TO_CHAR(p.FECHA_NACIMIENTO, 'YYYY-MM-DD') AS FECHA_NACIMIENTO,
        p.DIRECCION, p.CIUDAD_RESIDENCIA, p.ESTADO_RESIDENCIA, p.CODIGO_POSTAL,
        p.TELEFONO_CASA, p.TELEFONO_CELULAR, p.EMAIL,
        p.EMERGENCIA_CONTACTO, p.EMERGENCIA_TELEFONO,
        p.LUGAR_NACIMIENTO, p.HOSPITAL_NACIMIENTO,
        p.SANGRE_TIPO, p.VALVULA, p.NOTAS_ADICIONALES
      FROM PACIENTE p WHERE p.PACIENTE_ID = :id`,
      { id: Number(id) },
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        fetchInfo: {
          NOMBRE:              { type: oracledb.STRING },
          APELLIDO:            { type: oracledb.STRING },
          CURP:                { type: oracledb.STRING },
          GENERO:              { type: oracledb.STRING },
          DIRECCION:           { type: oracledb.STRING },
          CIUDAD_RESIDENCIA:   { type: oracledb.STRING },
          ESTADO_RESIDENCIA:   { type: oracledb.STRING },
          CODIGO_POSTAL:       { type: oracledb.STRING },
          TELEFONO_CASA:       { type: oracledb.STRING },
          TELEFONO_CELULAR:    { type: oracledb.STRING },
          EMAIL:               { type: oracledb.STRING },
          EMERGENCIA_CONTACTO: { type: oracledb.STRING },
          EMERGENCIA_TELEFONO: { type: oracledb.STRING },
          LUGAR_NACIMIENTO:    { type: oracledb.STRING },
          HOSPITAL_NACIMIENTO: { type: oracledb.STRING },
          SANGRE_TIPO:         { type: oracledb.STRING },
          VALVULA:             { type: oracledb.STRING },
          NOTAS_ADICIONALES:   { type: oracledb.STRING },
        }
      }
    );
    if (!resPaciente.rows || resPaciente.rows.length === 0) return null;
    const p = resPaciente.rows[0];

    const resPadecimiento = await conn.execute(
      `SELECT pb.TIPO_PADECIMIENTO, pb.DESCRIPCION
       FROM PADECIMIENTOEB pb
       JOIN PACIENTE_PADECIMIENTO pp ON pp.PADECIMIENTO_ID = pb.PADECIMIENTO_ID
       WHERE pp.PACIENTE_ID = :id`,
      { id: Number(id) },
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        fetchInfo: {
          TIPO_PADECIMIENTO: { type: oracledb.STRING },
          DESCRIPCION:       { type: oracledb.STRING },
        }
      }
    );

    const resMadre = await conn.execute(
      `SELECT MADRE_ID, NOMBRE, LUGAR_NACIMIENTO, ESCOLARIDAD,
        OCUPACION, EDAD, SEGURO_MEDICO, CD_EMBARAZO, ACIDO_FOLICO, CITAS_CONTROL
      FROM HISTORIAL_MADRE WHERE PACIENTE_ID = :id`,
      { id: Number(id) },
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
      `SELECT PADRE_ID, NOMBRE, LUGAR_NACIMIENTO, ESCOLARIDAD,
        OCUPACION, EDAD, SEGURO_MEDICO
      FROM HISTORIAL_PADRE WHERE PACIENTE_ID = :id`,
      { id: Number(id) },
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
      FROM HISTORIAL_AMBOS WHERE PACIENTE_ID = :id`,
      { id: Number(id) },
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

    
    const madre        = resMadre.rows?.[0]        || null;
    const padre        = resPadre.rows?.[0]        || null;
    const ambos        = resAmbos.rows?.[0]        || null;
    const padecimiento = resPadecimiento.rows?.[0] || null;

    const tutores = [
      {
        tutorParentesco:        "Madre",
        tutorNombre:            madre?.NOMBRE             || "",
        tutorLugarNacimiento:   madre?.LUGAR_NACIMIENTO   || "",
        tutorEscolaridad:       madre?.ESCOLARIDAD        || "",
        tutorOcupacion:         madre?.OCUPACION          || "",
        tutorEdad:              madre?.EDAD ? String(madre.EDAD) : "",
        tutorSeguroMedico:      "",
        madreSeguroMedico:      madre?.SEGURO_MEDICO      || "",
        cdEmbarazo:             madre?.CD_EMBARAZO        || "",
        acidoFolico:            madre?.ACIDO_FOLICO === "S" ? "Sí" : madre?.ACIDO_FOLICO === "N" ? "No" : "",
        citasControl:           madre?.CITAS_CONTROL ? String(madre.CITAS_CONTROL) : "",
        adicciones:             ambos?.ADICCIONES         || "",
        hijoDtn:                ambos?.HIJO_DTN     === "SI" ? "Sí" : ambos?.HIJO_DTN     === "NO" ? "No" : "",
        familiarDtn:            ambos?.FAMILIAR_DTN === "SI" ? "Sí" : ambos?.FAMILIAR_DTN === "NO" ? "No" : "",
        expoToxicos:            ambos?.EXPO_TOXICOS === "SI" ? "Sí" : ambos?.EXPO_TOXICOS === "NO" ? "No" : "",
        descripcionExpoToxicos: ambos?.DESCRIPCION_EXPO_TOXICOS || "",
      },
      {
        tutorParentesco:        "Padre",
        tutorNombre:            padre?.NOMBRE             || "",
        tutorLugarNacimiento:   padre?.LUGAR_NACIMIENTO   || "",
        tutorEscolaridad:       padre?.ESCOLARIDAD        || "",
        tutorOcupacion:         padre?.OCUPACION          || "",
        tutorEdad:              padre?.EDAD ? String(padre.EDAD) : "",
        tutorSeguroMedico:      padre?.SEGURO_MEDICO      || "",
        madreSeguroMedico:      "",
        cdEmbarazo:             "",
        acidoFolico:            "",
        citasControl:           "",
        adicciones:             ambos?.ADICCIONES         || "",
        hijoDtn:                ambos?.HIJO_DTN     === "SI" ? "Sí" : ambos?.HIJO_DTN     === "NO" ? "No" : "",
        familiarDtn:            ambos?.FAMILIAR_DTN === "SI" ? "Sí" : ambos?.FAMILIAR_DTN === "NO" ? "No" : "",
        expoToxicos:            ambos?.EXPO_TOXICOS === "SI" ? "Sí" : ambos?.EXPO_TOXICOS === "NO" ? "No" : "",
        descripcionExpoToxicos: ambos?.DESCRIPCION_EXPO_TOXICOS || "",
      },
    ];

    return {
      PACIENTE_ID:         p.PACIENTE_ID,
      NOMBRE:              p.NOMBRE,
      APELLIDO:            p.APELLIDO,
      CURP:                p.CURP,
      GENERO:              p.GENERO,
      FECHA_NACIMIENTO:    p.FECHA_NACIMIENTO,
      DIRECCION:           p.DIRECCION,
      CIUDAD_RESIDENCIA:   p.CIUDAD_RESIDENCIA,
      ESTADO_RESIDENCIA:   p.ESTADO_RESIDENCIA,
      CODIGO_POSTAL:       p.CODIGO_POSTAL,
      TELEFONO_CASA:       p.TELEFONO_CASA,
      TELEFONO_CELULAR:    p.TELEFONO_CELULAR,
      EMAIL:               p.EMAIL,
      EMERGENCIA_CONTACTO: p.EMERGENCIA_CONTACTO,
      EMERGENCIA_TELEFONO: p.EMERGENCIA_TELEFONO,
      LUGAR_NACIMIENTO:    p.LUGAR_NACIMIENTO,
      HOSPITAL_NACIMIENTO: p.HOSPITAL_NACIMIENTO,
      SANGRE_TIPO:         p.SANGRE_TIPO,
      VALVULA:             p.VALVULA,
      NOTAS_ADICIONALES:   p.NOTAS_ADICIONALES,
      TIPO_ESPINA_BIFIDA:  padecimiento?.TIPO_PADECIMIENTO || "",
      OTROS_PADECIMIENTO:  padecimiento?.DESCRIPCION       || "",
      FOTO:                `/api/pacientes/${p.PACIENTE_ID}/foto`,
      TUTORES:             tutores,
    };
  } catch (error) {
    console.error("Error en getPacienteCompleto:", error);
    throw error;
  } finally {
    if (conn) await conn.close();
  }
}

export async function updateHistorialMadre(pacienteId, datos = {}) {
  let conn;
  try {
    conn = await getConnection();

    let tutores = [];
    if (datos.tutores) {
      tutores = typeof datos.tutores === "string" ? JSON.parse(datos.tutores) : datos.tutores;
    } else if (datos.tutorParentesco) {
      tutores = [datos];
    }

    for (const tutor of tutores) {
      const esMadre = tutor.tutorParentesco === "Madre";
      const esPadre = tutor.tutorParentesco === "Padre";
      const acidoFolico = tutor.acidoFolico === "Sí" ? "S" : tutor.acidoFolico === "No" ? "N" : null;

      if (esMadre) {
        const check = await conn.execute(
          `SELECT MADRE_ID FROM HISTORIAL_MADRE WHERE PACIENTE_ID = :pacienteId`,
          { pacienteId: Number(pacienteId) },
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        if (check.rows.length > 0) {
          await conn.execute(
            `UPDATE HISTORIAL_MADRE SET
              NOMBRE           = :nombre,
              LUGAR_NACIMIENTO = :lugarNacimiento,
              EDAD             = :edad,
              OCUPACION        = :ocupacion,
              ESCOLARIDAD      = :escolaridad,
              SEGURO_MEDICO    = :seguroMedico,
              CD_EMBARAZO      = :cdEmbarazo,
              ACIDO_FOLICO     = :acidoFolico,
              CITAS_CONTROL    = :citasControl
            WHERE PACIENTE_ID = :pacienteId`,
            {
              nombre:          tutor.tutorNombre          || null,
              lugarNacimiento: tutor.tutorLugarNacimiento || null,
              edad:            tutor.tutorEdad ? Number(tutor.tutorEdad) : null,
              ocupacion:       tutor.tutorOcupacion       || null,
              escolaridad:     tutor.tutorEscolaridad     || null,
              seguroMedico:    tutor.madreSeguroMedico || tutor.tutorSeguroMedico || null,
              cdEmbarazo:      tutor.cdEmbarazo           || null,
              acidoFolico,
              citasControl:    tutor.citasControl ? Number(tutor.citasControl) : null,
              pacienteId:      Number(pacienteId),
            },
            { autoCommit: false }
          );
        } else {
          await conn.execute(
            `INSERT INTO HISTORIAL_MADRE
              (MADRE_ID, PACIENTE_ID, NOMBRE, LUGAR_NACIMIENTO, ESCOLARIDAD,
               OCUPACION, EDAD, SEGURO_MEDICO, CD_EMBARAZO, ACIDO_FOLICO, CITAS_CONTROL)
            VALUES
              ((SELECT NVL(MAX(MADRE_ID),0)+1 FROM HISTORIAL_MADRE),
               :pacienteId, :nombre, :lugarNacimiento, :escolaridad,
               :ocupacion, :edad, :seguroMedico, :cdEmbarazo, :acidoFolico, :citasControl)`,
            {
              pacienteId:      Number(pacienteId),
              nombre:          tutor.tutorNombre          || null,
              lugarNacimiento: tutor.tutorLugarNacimiento || null,
              escolaridad:     tutor.tutorEscolaridad     || null,
              ocupacion:       tutor.tutorOcupacion       || null,
              edad:            tutor.tutorEdad ? Number(tutor.tutorEdad) : null,
              seguroMedico:    tutor.madreSeguroMedico || tutor.tutorSeguroMedico || null,
              cdEmbarazo:      tutor.cdEmbarazo           || null,
              acidoFolico,
              citasControl:    tutor.citasControl ? Number(tutor.citasControl) : null,
            },
            { autoCommit: false }
          );
        }
      } else if (esPadre) {
        const check = await conn.execute(
          `SELECT PADRE_ID FROM HISTORIAL_PADRE WHERE PACIENTE_ID = :pacienteId`,
          { pacienteId: Number(pacienteId) },
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        if (check.rows.length > 0) {
          await conn.execute(
            `UPDATE HISTORIAL_PADRE SET
              NOMBRE           = :nombre,
              LUGAR_NACIMIENTO = :lugarNacimiento,
              EDAD             = :edad,
              OCUPACION        = :ocupacion,
              ESCOLARIDAD      = :escolaridad,
              SEGURO_MEDICO    = :seguroMedico
            WHERE PACIENTE_ID = :pacienteId`,
            {
              nombre:          tutor.tutorNombre          || null,
              lugarNacimiento: tutor.tutorLugarNacimiento || null,
              edad:            tutor.tutorEdad ? Number(tutor.tutorEdad) : null,
              ocupacion:       tutor.tutorOcupacion       || null,
              escolaridad:     tutor.tutorEscolaridad     || null,
              seguroMedico:    tutor.tutorSeguroMedico    || null,
              pacienteId:      Number(pacienteId),
            },
            { autoCommit: false }
          );
        } else {
          await conn.execute(
            `INSERT INTO HISTORIAL_PADRE
              (PADRE_ID, PACIENTE_ID, NOMBRE, LUGAR_NACIMIENTO, ESCOLARIDAD,
               OCUPACION, EDAD, SEGURO_MEDICO)
            VALUES
              ((SELECT NVL(MAX(PADRE_ID),0)+1 FROM HISTORIAL_PADRE),
               :pacienteId, :nombre, :lugarNacimiento, :escolaridad,
               :ocupacion, :edad, :seguroMedico)`,
            {
              pacienteId:      Number(pacienteId),
              nombre:          tutor.tutorNombre          || null,
              lugarNacimiento: tutor.tutorLugarNacimiento || null,
              escolaridad:     tutor.tutorEscolaridad     || null,
              ocupacion:       tutor.tutorOcupacion       || null,
              edad:            tutor.tutorEdad ? Number(tutor.tutorEdad) : null,
              seguroMedico:    tutor.tutorSeguroMedico    || null,
            },
            { autoCommit: false }
          );
        }
      }
    }

    const tutorConAmbos = tutores[0] || {};
    const hijoDtn     = tutorConAmbos.hijoDtn     === "Sí" ? "SI" : tutorConAmbos.hijoDtn     === "No" ? "NO" : null;
    const familiarDtn = tutorConAmbos.familiarDtn === "Sí" ? "SI" : tutorConAmbos.familiarDtn === "No" ? "NO" : null;
    const expoToxicos = tutorConAmbos.expoToxicos === "Sí" ? "SI" : tutorConAmbos.expoToxicos === "No" ? "NO" : null;

    const checkAmbos = await conn.execute(
      `SELECT COUNT(*) AS total FROM HISTORIAL_AMBOS WHERE PACIENTE_ID = :pacienteId`,
      { pacienteId: Number(pacienteId) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (checkAmbos.rows[0].TOTAL > 0) {
      await conn.execute(
        `UPDATE HISTORIAL_AMBOS SET
          ADICCIONES               = :adicciones,
          HIJO_DTN                 = :hijoDtn,
          FAMILIAR_DTN             = :familiarDtn,
          EXPO_TOXICOS             = :expoToxicos,
          DESCRIPCION_EXPO_TOXICOS = :descripcionExpoToxicos
        WHERE PACIENTE_ID = :pacienteId`,
        {
          adicciones:             tutorConAmbos.adicciones             || null,
          hijoDtn,
          familiarDtn,
          expoToxicos,
          descripcionExpoToxicos: tutorConAmbos.descripcionExpoToxicos || null,
          pacienteId:             Number(pacienteId),
        },
        { autoCommit: false }
      );
    } else {
      await conn.execute(
        `INSERT INTO HISTORIAL_AMBOS
          (AMBOS_ID, PACIENTE_ID, ADICCIONES, HIJO_DTN, FAMILIAR_DTN,
           EXPO_TOXICOS, DESCRIPCION_EXPO_TOXICOS)
        VALUES
          ((SELECT NVL(MAX(AMBOS_ID),0)+1 FROM HISTORIAL_AMBOS),
           :pacienteId, :adicciones, :hijoDtn, :familiarDtn,
           :expoToxicos, :descripcionExpoToxicos)`,
        {
          pacienteId:             Number(pacienteId),
          adicciones:             tutorConAmbos.adicciones             || null,
          hijoDtn,
          familiarDtn,
          expoToxicos,
          descripcionExpoToxicos: tutorConAmbos.descripcionExpoToxicos || null,
        },
        { autoCommit: false }
      );
    }

    await conn.commit();
  } catch (error) {
    if (conn) await conn.rollback();
    console.error("Error en updateHistorialMadre:", error);
    throw error;
  } finally {
    if (conn) await conn.close();
  }
}