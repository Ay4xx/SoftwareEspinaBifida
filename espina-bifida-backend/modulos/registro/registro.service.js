import oracledb from "oracledb";
import { getConnection } from "../../config/db.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

function calcularEdad(fechaNacimiento) {
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
  return edad;
}

function calcularEtapaVida(edad) {
  if (edad <= 12) return "Infancia";
  if (edad <= 17) return "Adolescencia";
  return "Adulto";
}

function nullIfEmpty(val) {
  if (val === undefined || val === null || val === "" || val === "N/A") return null;
  return val;
}

function normalizarSiNo(val) {
  if (val === "Sí") return "SI";
  if (val === "No") return "NO";
  return null;
}

// ── Auxiliares de BD ──────────────────────────────────────────────────────────

async function upsertPadecimiento(conn, pacienteId, tipoEspinaBifida, otrosPadecimiento) {
  const resPad = await conn.execute(
    `SELECT PADECIMIENTO_ID FROM PADECIMIENTOEB WHERE UPPER(TIPO_PADECIMIENTO) = UPPER(:tipo)`,
    { tipo: tipoEspinaBifida },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  if (resPad.rows.length === 0) return;

  const padecimientoId = resPad.rows[0].PADECIMIENTO_ID;

  const checkPad = await conn.execute(
    `SELECT COUNT(*) AS total FROM PACIENTE_PADECIMIENTO WHERE PACIENTE_ID = :pacienteId`,
    { pacienteId },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  if (checkPad.rows[0].TOTAL > 0) {
    await conn.execute(
      `UPDATE PACIENTE_PADECIMIENTO SET PADECIMIENTO_ID = :padecimientoId WHERE PACIENTE_ID = :pacienteId`,
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

  if (tipoEspinaBifida === "OTROS" && otrosPadecimiento) {
    await conn.execute(
      `UPDATE PADECIMIENTOEB SET DESCRIPCION = :descripcion WHERE PADECIMIENTO_ID = :padecimientoId`,
      { descripcion: nullIfEmpty(otrosPadecimiento), padecimientoId },
      { autoCommit: false }
    );
  }
}

async function upsertHistorialAmbos(conn, pacienteId, { adicciones, hijoDtn, familiarDtn, expoToxicos, descripcionExpoToxicos }) {
  const binds = {
    adicciones:             nullIfEmpty(adicciones),
    hijoDtn:                normalizarSiNo(hijoDtn),
    familiarDtn:            normalizarSiNo(familiarDtn),
    expoToxicos:            normalizarSiNo(expoToxicos),
    descripcionExpoToxicos: nullIfEmpty(descripcionExpoToxicos),
    pacienteId,
  };

  const check = await conn.execute(
    `SELECT COUNT(*) AS total FROM HISTORIAL_AMBOS WHERE PACIENTE_ID = :pacienteId`,
    { pacienteId },
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
      binds,
      { autoCommit: false }
    );
  } else {
    await conn.execute(
      `INSERT INTO HISTORIAL_AMBOS
        (AMBOS_ID, PACIENTE_ID, ADICCIONES, HIJO_DTN, FAMILIAR_DTN, EXPO_TOXICOS, DESCRIPCION_EXPO_TOXICOS)
       VALUES
        ((SELECT NVL(MAX(AMBOS_ID),0)+1 FROM HISTORIAL_AMBOS),
         :pacienteId, :adicciones, :hijoDtn, :familiarDtn, :expoToxicos, :descripcionExpoToxicos)`,
      binds,
      { autoCommit: false }
    );
  }
}

// ── Servicios públicos ────────────────────────────────────────────────────────

export async function crearPacientePaso1({ nombre, apellido, genero, fechaNacimiento, curp, usuarioId }) {
  const edad = fechaNacimiento ? calcularEdad(fechaNacimiento) : null;
  const etapaVida = edad !== null ? calcularEtapaVida(edad) : null;
  let conn;
  try {
    conn = await getConnection();

    const check = await conn.execute(
      `SELECT COUNT(*) FROM PACIENTE WHERE CURP = :curp`,
      { curp }
    );
    if (check.rows[0][0] > 0) {
      throw Object.assign(new Error("Ya existe un paciente registrado con ese CURP."), { code: "CURP_DUPLICADO" });
    }

    const result = await conn.execute(
      `INSERT INTO PACIENTE (
        PACIENTE_ID, NOMBRE, APELLIDO, CURP, FECHA_NACIMIENTO, GENERO, EDAD, ETAPA_VIDA,
        DIRECCION, CIUDAD_RESIDENCIA, ESTADO_RESIDENCIA, CODIGO_POSTAL,
        EMERGENCIA_CONTACTO, EMERGENCIA_TELEFONO,
        LUGAR_NACIMIENTO, HOSPITAL_NACIMIENTO, SANGRE_TIPO
      ) VALUES (
        (SELECT NVL(MAX(PACIENTE_ID), 0) + 1 FROM PACIENTE),
        :nombre, :apellido, :curp,
        ${fechaNacimiento ? "TO_DATE(:fechaNacimiento, 'YYYY-MM-DD')" : "NULL"},
        :genero, :edad, :etapaVida,
        NULL, NULL, NULL, NULL,
        NULL, NULL,
        NULL, NULL, NULL
      ) RETURNING PACIENTE_ID INTO :id`,
      {
        nombre:   nullIfEmpty(nombre),
        apellido: nullIfEmpty(apellido),
        curp,
        ...(fechaNacimiento ? { fechaNacimiento } : {}),
        genero:   nullIfEmpty(genero),
        edad,
        etapaVida,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      },
      { autoCommit: true }
    );

    const pacienteId = result.outBinds.id[0];

    if (usuarioId) {
      await conn.execute(
        `DELETE FROM NOTIFICACION WHERE paciente_id = :pacienteId AND estado_proceso = 'pendiente'`,
        { pacienteId },
        { autoCommit: true }
      );
    }

    return { pacienteId };
  } catch (error) {
    if (error.errorNum === 1) {
      throw Object.assign(new Error("Ya existe un paciente registrado con ese CURP."), { code: "CURP_DUPLICADO" });
    }
    throw error;
  } finally {
    if (conn) await conn.close();
  }
}

export async function actualizarPaso2(pacienteId, {
  direccion, ciudad, estado, codigoPostal,
  emergenciaContacto, emergenciaTelefono,
  telefonoCasa, telefonoCelular, correo,
}) {
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `UPDATE PACIENTE SET
        DIRECCION            = :direccion,
        CIUDAD_RESIDENCIA    = :ciudad,
        ESTADO_RESIDENCIA    = :estado,
        CODIGO_POSTAL        = :codigoPostal,
        EMERGENCIA_CONTACTO  = :emergenciaContacto,
        EMERGENCIA_TELEFONO  = :emergenciaTelefono,
        TELEFONO_CASA        = :telefonoCasa,
        TELEFONO_CELULAR     = :telefonoCelular,
        EMAIL                = :correo
       WHERE PACIENTE_ID = :pacienteId`,
      {
        direccion:          nullIfEmpty(direccion),
        ciudad:             nullIfEmpty(ciudad),
        estado:             nullIfEmpty(estado),
        codigoPostal:       nullIfEmpty(codigoPostal),
        emergenciaContacto: nullIfEmpty(emergenciaContacto),
        emergenciaTelefono: nullIfEmpty(emergenciaTelefono),
        telefonoCasa:       nullIfEmpty(telefonoCasa),
        telefonoCelular:    nullIfEmpty(telefonoCelular),
        correo:             nullIfEmpty(correo),
        pacienteId,
      },
      { autoCommit: true }
    );
  } finally {
    if (conn) await conn.close();
  }
}

export async function actualizarPaso3(pacienteId, {
  lugarNacimiento, hospitalNacimiento, tipoSangre, usaValvula, notas,
  tipoEspinaBifida, otrosPadecimiento,
}) {
  let conn;
  try {
    conn = await getConnection();

    await conn.execute(
      `UPDATE PACIENTE SET
        LUGAR_NACIMIENTO    = :lugarNacimiento,
        HOSPITAL_NACIMIENTO = :hospitalNacimiento,
        SANGRE_TIPO         = :tipoSangre,
        VALVULA             = :valvula,
        NOTAS_ADICIONALES   = :notas
       WHERE PACIENTE_ID = :pacienteId`,
      {
        lugarNacimiento:    nullIfEmpty(lugarNacimiento),
        hospitalNacimiento: nullIfEmpty(hospitalNacimiento),
        tipoSangre:         nullIfEmpty(tipoSangre),
        valvula:            normalizarSiNo(usaValvula),
        notas:              nullIfEmpty(notas),
        pacienteId,
      },
      { autoCommit: false }
    );

    if (tipoEspinaBifida) {
      await upsertPadecimiento(conn, pacienteId, tipoEspinaBifida, otrosPadecimiento);
    }

    await conn.commit();
  } catch (error) {
    if (conn) await conn.rollback();
    throw error;
  } finally {
    if (conn) await conn.close();
  }
}

export async function actualizarPaso4(pacienteId, {
  tutorParentesco, tutorNombre, tutorLugarNacimiento, tutorEdad,
  tutorOcupacion, tutorEscolaridad, tutorSeguroMedico, madreSeguroMedico,
  cdEmbarazo, acidoFolico, citasControl,
  adicciones, hijoDtn, familiarDtn, expoToxicos, descripcionExpoToxicos,
}) {
  let conn;
  try {
    conn = await getConnection();
    const esMadre = tutorParentesco === "Madre";
    const esPadre = tutorParentesco === "Padre";

    if (esMadre) {
      await conn.execute(
        `INSERT INTO HISTORIAL_MADRE (
          MADRE_ID, PACIENTE_ID, NOMBRE, LUGAR_NACIMIENTO, ESCOLARIDAD,
          OCUPACION, EDAD, SEGURO_MEDICO, CD_EMBARAZO, ACIDO_FOLICO, CITAS_CONTROL
        ) VALUES (
          (SELECT NVL(MAX(MADRE_ID),0)+1 FROM HISTORIAL_MADRE),
          :pacienteId, :nombre, :lugarNacimiento, :escolaridad,
          :ocupacion, :edad, :seguroMedico, :cdEmbarazo, :acidoFolico, :citasControl
        )`,
        {
          pacienteId,
          nombre:          nullIfEmpty(tutorNombre),
          lugarNacimiento: nullIfEmpty(tutorLugarNacimiento),
          escolaridad:     nullIfEmpty(tutorEscolaridad),
          ocupacion:       nullIfEmpty(tutorOcupacion),
          edad:            tutorEdad ? Number(tutorEdad) : null,
          seguroMedico:    nullIfEmpty(madreSeguroMedico) || nullIfEmpty(tutorSeguroMedico),
          cdEmbarazo:      nullIfEmpty(cdEmbarazo),
          acidoFolico:     acidoFolico === "Sí" ? "S" : acidoFolico === "No" ? "N" : null,
          citasControl:    citasControl ? Number(citasControl) : null,
        },
        { autoCommit: false }
      );
    } else if (esPadre) {
      await conn.execute(
        `INSERT INTO HISTORIAL_PADRE (
          PADRE_ID, PACIENTE_ID, NOMBRE, LUGAR_NACIMIENTO, ESCOLARIDAD,
          OCUPACION, EDAD, SEGURO_MEDICO
        ) VALUES (
          (SELECT NVL(MAX(PADRE_ID),0)+1 FROM HISTORIAL_PADRE),
          :pacienteId, :nombre, :lugarNacimiento, :escolaridad,
          :ocupacion, :edad, :seguroMedico
        )`,
        {
          pacienteId,
          nombre:          nullIfEmpty(tutorNombre),
          lugarNacimiento: nullIfEmpty(tutorLugarNacimiento),
          escolaridad:     nullIfEmpty(tutorEscolaridad),
          ocupacion:       nullIfEmpty(tutorOcupacion),
          edad:            tutorEdad ? Number(tutorEdad) : null,
          seguroMedico:    nullIfEmpty(tutorSeguroMedico),
        },
        { autoCommit: false }
      );
    }

    await upsertHistorialAmbos(conn, pacienteId, {
      adicciones, hijoDtn, familiarDtn, expoToxicos, descripcionExpoToxicos,
    });

    await conn.commit();
  } catch (error) {
    if (conn) await conn.rollback();
    throw error;
  } finally {
    if (conn) await conn.close();
  }
}

export async function actualizarPaso5(pacienteId, fotoBuffer) {
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `UPDATE PACIENTE SET FOTOGRAFIA = :foto WHERE PACIENTE_ID = :pacienteId`,
      { foto: fotoBuffer, pacienteId },
      { autoCommit: true }
    );
  } finally {
    if (conn) await conn.close();
  }
}

export async function guardarDocumentos(pacienteId, {
  docPreregistro, docActaNacimiento, docCurp, docComprobanteDomicilio, docIneFamilia,
}) {
  let conn;
  try {
    conn = await getConnection();

    const campos = [];
    const binds = { pacienteId };

    if (docPreregistro)          { campos.push("DOC_PREREGISTRO = :docPreregistro");                   binds.docPreregistro = docPreregistro; }
    if (docActaNacimiento)       { campos.push("DOC_ACTA_NACIMIENTO = :docActaNacimiento");             binds.docActaNacimiento = docActaNacimiento; }
    if (docCurp)                 { campos.push("DOC_CURP = :docCurp");                                 binds.docCurp = docCurp; }
    if (docComprobanteDomicilio) { campos.push("DOC_COMPROBANTE_DOMICILIO = :docComprobanteDomicilio"); binds.docComprobanteDomicilio = docComprobanteDomicilio; }
    if (docIneFamilia)           { campos.push("DOC_INE_FAMILIA = :docIneFamilia");                    binds.docIneFamilia = docIneFamilia; }

    if (campos.length === 0) return;

    await conn.execute(
      `UPDATE PACIENTE SET ${campos.join(", ")} WHERE PACIENTE_ID = :pacienteId`,
      binds,
      { autoCommit: true }
    );
  } finally {
    if (conn) await conn.close();
  }
}
