import oracledb from "oracledb";
import { getConnection } from "../../config/db.js";
import { mapPacienteToCard } from "../paciente/paciente.mapper.js";
import { obtenerMembresiaPorPacienteId } from "../membresia/membresia.service.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

const STRING = { type: oracledb.STRING };

function normalizarSiNo(val) {
  if (val === "Sí") return "SI";
  if (val === "No") return "NO";
  return null;
}

function desnormalizarSiNo(val) {
  if (val === "SI") return "Sí";
  if (val === "NO") return "No";
  return "";
}

async function leerBlob(lob) {
  if (!lob) return null;
  const chunks = [];
  return new Promise((resolve, reject) => {
    lob.on("data",  (chunk) => chunks.push(chunk));
    lob.on("end",   () => resolve(Buffer.concat(chunks)));
    lob.on("error", reject);
  });
}

function parseTutores(datos) {
  if (datos.tutores) {
    return typeof datos.tutores === "string" ? JSON.parse(datos.tutores) : datos.tutores;
  }
  if (datos.tutorParentesco) return [datos];
  return [];
}

function mapearTutorCompleto(parentesco, row, ambos) {
  const base = {
    tutorParentesco:        parentesco,
    tutorNombre:            row?.NOMBRE            || "",
    tutorLugarNacimiento:   row?.LUGAR_NACIMIENTO  || "",
    tutorEscolaridad:       row?.ESCOLARIDAD       || "",
    tutorOcupacion:         row?.OCUPACION         || "",
    tutorEdad:              row?.EDAD ? String(row.EDAD) : "",
    adicciones:             ambos?.ADICCIONES                || "",
    hijoDtn:                desnormalizarSiNo(ambos?.HIJO_DTN),
    familiarDtn:            desnormalizarSiNo(ambos?.FAMILIAR_DTN),
    expoToxicos:            desnormalizarSiNo(ambos?.EXPO_TOXICOS),
    descripcionExpoToxicos: ambos?.DESCRIPCION_EXPO_TOXICOS  || "",
  };

  if (parentesco === "Madre") {
    return {
      ...base,
      tutorSeguroMedico: "",
      madreSeguroMedico: row?.SEGURO_MEDICO  || "",
      cdEmbarazo:        row?.CD_EMBARAZO    || "",
      acidoFolico:       row?.ACIDO_FOLICO === "S" ? "Sí" : row?.ACIDO_FOLICO === "N" ? "No" : "",
      citasControl:      row?.CITAS_CONTROL ? String(row.CITAS_CONTROL) : "",
    };
  }

  return {
    ...base,
    tutorSeguroMedico: row?.SEGURO_MEDICO || "",
    madreSeguroMedico: "",
    cdEmbarazo:        "",
    acidoFolico:       "",
    citasControl:      "",
  };
}

async function upsertHistorialAmbos(conn, pacienteId, tutor) {
  const binds = {
    adicciones:             tutor.adicciones             || null,
    hijoDtn:                normalizarSiNo(tutor.hijoDtn),
    familiarDtn:            normalizarSiNo(tutor.familiarDtn),
    expoToxicos:            normalizarSiNo(tutor.expoToxicos),
    descripcionExpoToxicos: tutor.descripcionExpoToxicos || null,
    pacienteId:             Number(pacienteId),
  };

  const check = await conn.execute(
    `SELECT COUNT(*) AS total FROM HISTORIAL_AMBOS WHERE PACIENTE_ID = :pacienteId`,
    { pacienteId: Number(pacienteId) },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  if (check.rows[0].TOTAL > 0) {
    await conn.execute(
      `UPDATE HISTORIAL_AMBOS SET
        ADICCIONES               = :adicciones,
        HIJO_DTN                 = :hijoDtn,
        FAMILIAR_DTN             = :familiarDtn,
        EXPO_TOXICOS             = :expoToxicos,
        DESCRIPCION_EXPO_TOXICOS = :descripcionExpoToxicos
       WHERE PACIENTE_ID = :pacienteId`,
      binds, { autoCommit: false }
    );
  } else {
    await conn.execute(
      `INSERT INTO HISTORIAL_AMBOS
        (AMBOS_ID, PACIENTE_ID, ADICCIONES, HIJO_DTN, FAMILIAR_DTN, EXPO_TOXICOS, DESCRIPCION_EXPO_TOXICOS)
       VALUES
        ((SELECT NVL(MAX(AMBOS_ID),0)+1 FROM HISTORIAL_AMBOS),
         :pacienteId, :adicciones, :hijoDtn, :familiarDtn, :expoToxicos, :descripcionExpoToxicos)`,
      binds, { autoCommit: false }
    );
  }
}

async function upsertPadecimiento(conn, pacienteId, tipoEspinaBifida, otrosPadecimiento) {
  const resPad = await conn.execute(
    `SELECT PADECIMIENTO_ID FROM PADECIMIENTOEB WHERE UPPER(TIPO_PADECIMIENTO) = UPPER(:tipo)`,
    { tipo: tipoEspinaBifida },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  if (!resPad.rows.length) return;

  const padecimientoId = resPad.rows[0].PADECIMIENTO_ID;

  const check = await conn.execute(
    `SELECT COUNT(*) AS total FROM PACIENTE_PADECIMIENTO WHERE PACIENTE_ID = :pacienteId`,
    { pacienteId },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  if (check.rows[0].TOTAL > 0) {
    await conn.execute(
      `UPDATE PACIENTE_PADECIMIENTO SET PADECIMIENTO_ID = :padecimientoId WHERE PACIENTE_ID = :pacienteId`,
      { padecimientoId, pacienteId }, { autoCommit: false }
    );
  } else {
    await conn.execute(
      `INSERT INTO PACIENTE_PADECIMIENTO
        (PADECIMIENTO_PACIENTE_ID, PACIENTE_ID, PADECIMIENTO_ID)
       VALUES
        ((SELECT NVL(MAX(PADECIMIENTO_PACIENTE_ID),0)+1 FROM PACIENTE_PADECIMIENTO),
         :pacienteId, :padecimientoId)`,
      { pacienteId, padecimientoId }, { autoCommit: false }
    );
  }

  if (tipoEspinaBifida === "OTROS" && otrosPadecimiento) {
    await conn.execute(
      `UPDATE PADECIMIENTOEB SET DESCRIPCION = :descripcion WHERE PADECIMIENTO_ID = :padecimientoId`,
      { descripcion: otrosPadecimiento || null, padecimientoId }, { autoCommit: false }
    );
  }
}

// ── Servicios públicos ────────────────────────────────────────────────────────

export async function getPacienteCards(search = "") {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT
        p.paciente_id, p.nombre, p.apellido, p.fotografia, p.curp, p.fecha_nacimiento,
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
           OR LOWER(p.nombre)  LIKE '%' || LOWER(:search) || '%'
           OR LOWER(p.apellido) LIKE '%' || LOWER(:search) || '%'
           OR LOWER(p.nombre || ' ' || p.apellido) LIKE '%' || LOWER(:search) || '%'
         )
       ORDER BY p.paciente_id DESC`,
      { search: search?.trim() ? search.trim() : null },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return result.rows.map(mapPacienteToCard);
  } finally {
    if (conn) await conn.close();
  }
}

export async function getPacienteCredencial(id) {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT
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
       FROM PACIENTE p WHERE p.paciente_id = :pacienteId`,
      { pacienteId: id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (!result.rows?.length) return null;
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
  } finally {
    if (conn) await conn.close();
  }
}

export async function getPacienteDetail(id) {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT
        p.paciente_id, p.nombre, p.apellido, p.fotografia,
        p.ciudad_residencia, p.estado_residencia,
        p.fecha_ultima_visita, p.etapa_vida,
        NVL(ev.total_consultas, 0) AS total_consultas
       FROM PACIENTE p
       LEFT JOIN (
         SELECT paciente_id, COUNT(evento_id) AS total_consultas
         FROM EVENTO_VISITA GROUP BY paciente_id
       ) ev ON p.paciente_id = ev.paciente_id
       WHERE p.paciente_id = :id`,
      { id: Number(id) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (!result.rows?.length) return null;
    const membresia = await obtenerMembresiaPorPacienteId(id);
    return mapPacienteToCard({ ...result.rows[0], ESTATUS_MEMBRESIA: membresia?.ESTATUS });
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
    if (!result.rows?.length) return null;
    const row = result.rows[0];
    const membresia = await obtenerMembresiaPorPacienteId(pacienteId);
    return {
      PACIENTE_ID:       row.PACIENTE_ID       ?? null,
      NOMBRE:            row.NOMBRE            ?? null,
      APELLIDO:          row.APELLIDO          ?? null,
      NOMBRE_COMPLETO:   [row.NOMBRE, row.APELLIDO].filter(Boolean).join(" "),
      EMAIL:             row.EMAIL             ?? null,
      TELEFONO_CELULAR:  row.TELEFONO_CELULAR  ?? null,
      ESTADO_RESIDENCIA: row.ESTADO_RESIDENCIA ?? null,
      FECHA_ALTA:        row.FECHA_ALTA ? new Date(row.FECHA_ALTA).toISOString() : null,
      VIVE:              row.VIVE              ?? null,
      FECHA_INICIO:      membresia?.FECHA_INICIO ? new Date(membresia.FECHA_INICIO).toISOString() : null,
      FECHA_FIN:         membresia?.FECHA_FIN   ? new Date(membresia.FECHA_FIN).toISOString()   : null,
      foto:              `/api/pacientes/${row.PACIENTE_ID}/foto`,
    };
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
    if (!result.rows?.length) return null;
    return await leerBlob(result.rows[0].FOTOGRAFIA);
  } finally {
    if (conn) await conn.close();
  }
}

export async function updatePaciente(pacienteId, datos = {}, archivo = null) {
  let conn;
  try {
    conn = await getConnection();
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
        valvula:            normalizarSiNo(datos.usaValvula),
        notas:              datos.notas              || null,
        pacienteId,
      },
      { autoCommit: false }
    );

    if (datos.tipoEspinaBifida) {
      await upsertPadecimiento(conn, pacienteId, datos.tipoEspinaBifida, datos.otrosPadecimiento);
    }

    await conn.commit();
  } catch (error) {
    if (conn) await conn.rollback();
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
          NOMBRE: STRING, APELLIDO: STRING, CURP: STRING, GENERO: STRING,
          DIRECCION: STRING, CIUDAD_RESIDENCIA: STRING, ESTADO_RESIDENCIA: STRING,
          CODIGO_POSTAL: STRING, TELEFONO_CASA: STRING, TELEFONO_CELULAR: STRING,
          EMAIL: STRING, EMERGENCIA_CONTACTO: STRING, EMERGENCIA_TELEFONO: STRING,
          LUGAR_NACIMIENTO: STRING, HOSPITAL_NACIMIENTO: STRING,
          SANGRE_TIPO: STRING, VALVULA: STRING, NOTAS_ADICIONALES: STRING,
        }
      }
    );
    if (!resPaciente.rows?.length) return null;
    const p = resPaciente.rows[0];

    const fetchStr = (sql, binds, fetchInfo) =>
      conn.execute(sql, binds, { outFormat: oracledb.OUT_FORMAT_OBJECT, fetchInfo });

    const [resPadecimiento, resMadre, resPadre, resAmbos] = await Promise.all([
      fetchStr(
        `SELECT pb.TIPO_PADECIMIENTO, pb.DESCRIPCION
           FROM PADECIMIENTOEB pb
           JOIN PACIENTE_PADECIMIENTO pp ON pp.PADECIMIENTO_ID = pb.PADECIMIENTO_ID
          WHERE pp.PACIENTE_ID = :id`,
        { id: Number(id) },
        { TIPO_PADECIMIENTO: STRING, DESCRIPCION: STRING }
      ),
      fetchStr(
        `SELECT MADRE_ID, NOMBRE, LUGAR_NACIMIENTO, ESCOLARIDAD,
                OCUPACION, EDAD, SEGURO_MEDICO, CD_EMBARAZO, ACIDO_FOLICO, CITAS_CONTROL
           FROM HISTORIAL_MADRE WHERE PACIENTE_ID = :id`,
        { id: Number(id) },
        { NOMBRE: STRING, LUGAR_NACIMIENTO: STRING, ESCOLARIDAD: STRING,
          OCUPACION: STRING, SEGURO_MEDICO: STRING, CD_EMBARAZO: STRING, ACIDO_FOLICO: STRING }
      ),
      fetchStr(
        `SELECT PADRE_ID, NOMBRE, LUGAR_NACIMIENTO, ESCOLARIDAD, OCUPACION, EDAD, SEGURO_MEDICO
           FROM HISTORIAL_PADRE WHERE PACIENTE_ID = :id`,
        { id: Number(id) },
        { NOMBRE: STRING, LUGAR_NACIMIENTO: STRING, ESCOLARIDAD: STRING,
          OCUPACION: STRING, SEGURO_MEDICO: STRING }
      ),
      fetchStr(
        `SELECT ADICCIONES, HIJO_DTN, FAMILIAR_DTN, EXPO_TOXICOS, DESCRIPCION_EXPO_TOXICOS
           FROM HISTORIAL_AMBOS WHERE PACIENTE_ID = :id`,
        { id: Number(id) },
        { ADICCIONES: STRING, HIJO_DTN: STRING, FAMILIAR_DTN: STRING,
          EXPO_TOXICOS: STRING, DESCRIPCION_EXPO_TOXICOS: STRING }
      ),
    ]);

    const madre        = resMadre.rows?.[0]        || null;
    const padre        = resPadre.rows?.[0]        || null;
    const ambos        = resAmbos.rows?.[0]        || null;
    const padecimiento = resPadecimiento.rows?.[0] || null;

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
      TUTORES:             [
        mapearTutorCompleto("Madre", madre, ambos),
        mapearTutorCompleto("Padre", padre, ambos),
      ],
    };
  } finally {
    if (conn) await conn.close();
  }
}

export async function updateHistorialMadre(pacienteId, datos = {}) {
  let conn;
  try {
    conn = await getConnection();
    const tutores = parseTutores(datos);

    for (const tutor of tutores) {
      const esMadre    = tutor.tutorParentesco === "Madre";
      const esPadre    = tutor.tutorParentesco === "Padre";
      const acidoFolico = tutor.acidoFolico === "Sí" ? "S" : tutor.acidoFolico === "No" ? "N" : null;

      if (esMadre) {
        const check = await conn.execute(
          `SELECT MADRE_ID FROM HISTORIAL_MADRE WHERE PACIENTE_ID = :pacienteId`,
          { pacienteId: Number(pacienteId) },
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        const binds = {
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
        };

        if (check.rows.length > 0) {
          await conn.execute(
            `UPDATE HISTORIAL_MADRE SET
              NOMBRE = :nombre, LUGAR_NACIMIENTO = :lugarNacimiento, EDAD = :edad,
              OCUPACION = :ocupacion, ESCOLARIDAD = :escolaridad, SEGURO_MEDICO = :seguroMedico,
              CD_EMBARAZO = :cdEmbarazo, ACIDO_FOLICO = :acidoFolico, CITAS_CONTROL = :citasControl
             WHERE PACIENTE_ID = :pacienteId`,
            binds, { autoCommit: false }
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
            binds, { autoCommit: false }
          );
        }
      } else if (esPadre) {
        const check = await conn.execute(
          `SELECT PADRE_ID FROM HISTORIAL_PADRE WHERE PACIENTE_ID = :pacienteId`,
          { pacienteId: Number(pacienteId) },
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        const binds = {
          nombre:          tutor.tutorNombre          || null,
          lugarNacimiento: tutor.tutorLugarNacimiento || null,
          edad:            tutor.tutorEdad ? Number(tutor.tutorEdad) : null,
          ocupacion:       tutor.tutorOcupacion       || null,
          escolaridad:     tutor.tutorEscolaridad     || null,
          seguroMedico:    tutor.tutorSeguroMedico    || null,
          pacienteId:      Number(pacienteId),
        };

        if (check.rows.length > 0) {
          await conn.execute(
            `UPDATE HISTORIAL_PADRE SET
              NOMBRE = :nombre, LUGAR_NACIMIENTO = :lugarNacimiento, EDAD = :edad,
              OCUPACION = :ocupacion, ESCOLARIDAD = :escolaridad, SEGURO_MEDICO = :seguroMedico
             WHERE PACIENTE_ID = :pacienteId`,
            binds, { autoCommit: false }
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
            binds, { autoCommit: false }
          );
        }
      }
    }

    await upsertHistorialAmbos(conn, pacienteId, tutores[0] || {});
    await conn.commit();
  } catch (error) {
    if (conn) await conn.rollback();
    throw error;
  } finally {
    if (conn) await conn.close();
  }
}

export async function borrarPacienteService(pacienteId) {
  let conn;
  try {
    conn = await getConnection();
    const id = { id: pacienteId };

    const eventosTablas = ["EVENTOS_EQUIPO_MEDICO", "EVENTOS_MEDICINAS", "EVENTOS_SERVICIOS"];
    for (const tabla of eventosTablas) {
      await conn.execute(
        `DELETE FROM ${tabla} WHERE EVENTO_ID IN (SELECT EVENTO_ID FROM EVENTO_VISITA WHERE PACIENTE_ID = :id)`,
        id
      );
    }

    const tablasDirectas = [
      "EVENTO_VISITA", "AGENDA_CITAS", "PACIENTE_PADECIMIENTO",
      "HISTORIAL_AMBOS", "HISTORIAL_MADRE", "HISTORIAL_PADRE",
      "MEMBRESIA", "NOTIFICACION",
    ];
    const colPaciente = { AGENDA_CITAS: "ID_PACIENTE" };
    for (const tabla of tablasDirectas) {
      const col = colPaciente[tabla] || "PACIENTE_ID";
      await conn.execute(`DELETE FROM ${tabla} WHERE ${col} = :id`, id);
    }

    const result = await conn.execute(`DELETE FROM PACIENTE WHERE PACIENTE_ID = :id`, id);
    await conn.commit();
    return result.rowsAffected > 0;
  } catch (error) {
    if (conn) await conn.rollback().catch(() => {});
    throw error;
  } finally {
    if (conn) await conn.close();
  }
}
