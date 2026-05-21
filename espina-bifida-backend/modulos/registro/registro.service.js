import oracledb from "oracledb";
import { getConnection } from "../../config/db.js";
import { enviarSMS } from "../email/sms.service.js";
import { sseClients } from "../../app.js";

function notificarSSE() {
  for (const client of sseClients) {
    client.write(`data: ${JSON.stringify({ tipo: "actualizar" })}\n\n`);
  }
}

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
      throw Object.assign(
        new Error("Ya existe un paciente registrado con ese CURP."),
        { code: "CURP_DUPLICADO" }
      );
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
        nombre:    nullIfEmpty(nombre),
        apellido:  nullIfEmpty(apellido),
        curp,
        ...(fechaNacimiento ? { fechaNacimiento } : {}),
        genero:    nullIfEmpty(genero),
        edad,
        etapaVida,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      },
      { autoCommit: true }
    );

    const pacienteId = result.outBinds.id[0];

    if (usuarioId) {
      await conn.execute(
        `DELETE FROM NOTIFICACION
         WHERE paciente_id = :pacienteId
         AND estado_proceso = 'pendiente'`,
        { pacienteId },
        { autoCommit: true }
      );
    }

    return { pacienteId };
  } catch (error) {
    console.error("Error en crearPacientePaso1:", error);
    // ORA-00001 = unique constraint violated — la CURP ya existe
    if (error.errorNum === 1) {
      throw Object.assign(
        new Error("Ya existe un paciente registrado con ese CURP."),
        { code: "CURP_DUPLICADO" }
      );
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

    // Solo envía SMS si hay un número disponible
    const telefono = nullIfEmpty(telefonoCelular) || nullIfEmpty(telefonoCasa);
    if (telefono) {
      await enviarSMS(
        telefono,
        "Hola, tu solicitud de registro en la Asociación Espina Bífida ha sido recibida y está siendo revisada. Te notificaremos pronto."
      );
    }

    notificarSSE();
  } catch (error) {
    console.error("Error en actualizarPaso2:", error);
    throw error;
  } finally {
    if (conn) await conn.close();
  }
}

export async function actualizarPaso3(pacienteId, {
  lugarNacimiento, hospitalNacimiento, tipoSangre, usaValvula, notas,
}) {
  let conn;
  try {
    conn = await getConnection();
    const valvula = usaValvula === "Sí" ? "SI" : usaValvula === "No" ? "NO" : null;
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
        valvula,
        notas:              nullIfEmpty(notas),
        pacienteId,
      },
      { autoCommit: true }
    );
  } catch (error) {
    console.error("Error en actualizarPaso3:", error);
    throw error;
  } finally {
    if (conn) await conn.close();
  }
}

export async function actualizarPaso4(pacienteId, {
  tutorLugarNacimiento, tutorEdad, tutorOcupacion, tutorEscolaridad,
  tutorParentesco, madreSeguroMedico, cdEmbarazo, acidoFolico, citasControl,
}) {
  let conn;
  try {
    conn = await getConnection();
    await conn.execute(
      `INSERT INTO HISTORIAL_MADRE (
        MADRE_ID, PACIENTE_ID,
        LUGAR_NACIMIENTO, ESCOLARIDAD, OCUPACION, EDAD, PARENTESCO,
        SEGURO_MEDICO, CD_EMBARAZO, ACIDO_FOLICO, CITAS_CONTROL
      ) VALUES (
        (SELECT NVL(MAX(MADRE_ID), 0) + 1 FROM HISTORIAL_MADRE),
        :pacienteId,
        :lugarNacimiento, :escolaridad, :ocupacion, :edad, :parentesco,
        :seguroMedico, :cdEmbarazo, :acidoFolico, :citasControl
      )`,
      {
        pacienteId,
        lugarNacimiento: nullIfEmpty(tutorLugarNacimiento),
        escolaridad:     nullIfEmpty(tutorEscolaridad),
        ocupacion:       nullIfEmpty(tutorOcupacion),
        edad:            tutorEdad ? Number(tutorEdad) : null,
        parentesco:      tutorParentesco === "Sí" ? "S" : tutorParentesco === "No" ? "N" : null,
        seguroMedico:    nullIfEmpty(madreSeguroMedico),
        cdEmbarazo:      nullIfEmpty(cdEmbarazo),
        acidoFolico:     acidoFolico === "Sí" ? "S" : acidoFolico === "No" ? "N" : null,
        citasControl:    citasControl ? Number(citasControl) : null,
      },
      { autoCommit: true }
    );
  } catch (error) {
    console.error("Error en actualizarPaso4:", error);
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
  } catch (error) {
    console.error("Error en actualizarPaso5:", error);
    throw error;
  } finally {
    if (conn) await conn.close();
  }
}