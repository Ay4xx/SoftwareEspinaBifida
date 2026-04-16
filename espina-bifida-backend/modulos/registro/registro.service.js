import oracledb from "oracledb";
import { getConnection } from "../../config/db.js";

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

export async function crearPacientePaso1({ nombre, apellido, genero, fechaNacimiento, curp }) {
  const edad = calcularEdad(fechaNacimiento);
  const etapaVida = calcularEtapaVida(edad);

  let conn;

  try {
    conn = await getConnection();

    const result = await conn.execute(
      `INSERT INTO PACIENTE (
        PACIENTE_ID, NOMBRE, APELLIDO, CURP, FECHA_NACIMIENTO, GENERO, EDAD, ETAPA_VIDA,
        DIRECCION, CIUDAD_RESIDENCIA, ESTADO_RESIDENCIA, CODIGO_POSTAL,
        EMERGENCIA_CONTACTO, EMERGENCIA_TELEFONO,
        LUGAR_NACIMIENTO, HOSPITAL_NACIMIENTO, SANGRE_TIPO
      ) VALUES (
        (SELECT NVL(MAX(PACIENTE_ID), 0) + 1 FROM PACIENTE),
        :nombre, :apellido, :curp,
        TO_DATE(:fechaNacimiento, 'YYYY-MM-DD'),
        :genero, :edad, :etapaVida,
        'N/A', 'N/A', 'N/A', 'N/A',
        'N/A', 'N/A',
        'N/A', 'N/A', 'N/A'
      ) RETURNING PACIENTE_ID INTO :id`,
      {
        nombre,
        apellido,
        curp,
        fechaNacimiento,
        genero,
        edad,
        etapaVida,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      },
      { autoCommit: true }
    );

    const pacienteId = result.outBinds.id[0];
    return { pacienteId };
  } catch (error) {
    console.error("Error en crearPacientePaso1:", error);
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
        lugarNacimiento: tutorLugarNacimiento || 'N/A',
        escolaridad:     tutorEscolaridad     || 'N/A',
        ocupacion:       tutorOcupacion       || 'N/A',
        edad:            Number(tutorEdad)    || 0,
        parentesco:      tutorParentesco === 'Sí' ? 'S' : 'N',
        seguroMedico:    madreSeguroMedico    || 'N/A',
        cdEmbarazo:      cdEmbarazo           || 'N/A',
        acidoFolico:     acidoFolico === 'Sí' ? 'S' : 'N',
        citasControl:    Number(citasControl) || 0,
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
        lugarNacimiento,
        hospitalNacimiento,
        tipoSangre,
        valvula,
        notas: notas || null,
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

export async function actualizarPaso5(pacienteId, fotoBuffer) {
  let conn;

  try {
    conn = await getConnection();

    await conn.execute(
      `UPDATE PACIENTE SET FOTOGRAFIA = :foto WHERE PACIENTE_ID = :pacienteId`,
      {
        foto: fotoBuffer,
        pacienteId,
      },
      { autoCommit: true }
    );
  } catch (error) {
    console.error("Error en actualizarPaso5:", error);
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
        DIRECCION          = :direccion,
        CIUDAD_RESIDENCIA  = :ciudad,
        ESTADO_RESIDENCIA  = :estado,
        CODIGO_POSTAL      = :codigoPostal,
        EMERGENCIA_CONTACTO  = :emergenciaContacto,
        EMERGENCIA_TELEFONO  = :emergenciaTelefono,
        TELEFONO_CASA      = :telefonoCasa,
        TELEFONO_CELULAR   = :telefonoCelular,
        EMAIL              = :correo
      WHERE PACIENTE_ID = :pacienteId`,
      {
        direccion,
        ciudad,
        estado,
        codigoPostal,
        emergenciaContacto,
        emergenciaTelefono,
        telefonoCasa:    telefonoCasa    || null,
        telefonoCelular: telefonoCelular || null,
        correo:          correo          || null,
        pacienteId,
      },
      { autoCommit: true }
    );
  } catch (error) {
    console.error("Error en actualizarPaso2:", error);
    throw error;
  } finally {
    if (conn) await conn.close();
  }
}
