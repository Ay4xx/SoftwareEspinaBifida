import { crearPacientePaso1, actualizarPaso2, actualizarPaso3, actualizarPaso4, actualizarPaso5 } from "./registro.service.js";
import { enviarCorreoPreRegistro, enviarCorreoAltaManual } from "../email/email.service.js";

export async function registrarPaciente(req, res) {
  try {
    const { nombre, apellido, genero, fechaNacimiento, curp, usuarioId } = req.body;
    if (!nombre || !apellido || !genero || !fechaNacimiento || !curp) {
      return res.status(400).json({ ok: false, message: "Todos los campos del paso 1 son obligatorios." });
    }
    const resultado = await crearPacientePaso1({ nombre, apellido, genero, fechaNacimiento, curp, usuarioId });
    res.status(201).json({ ok: true, data: resultado });
  } catch (error) {
    console.error("Error en registrarPaciente:", error);
    if (error.code === "CURP_DUPLICADO" || error.errorNum === 1) {
      return res.status(409).json({ ok: false, message: "Ya existe un paciente registrado con ese CURP." });
    }
    res.status(500).json({ ok: false, message: "Error al registrar el paciente." });
  }
}

export async function fotografiaPaciente(req, res) {
  try {
    const { id } = req.params;
    // usuarioId viene del body: null = invitado, tiene valor = coordinadora
    const { usuarioId, nombre, apellido, correo } = req.body;

    if (!req.file) return res.status(400).json({ ok: false, message: "No se recibió ninguna imagen." });
    await actualizarPaso5(Number(id), req.file.buffer);

    // Solo enviar correo de alta manual si es coordinadora
    if (usuarioId && correo) {
      try {
        await enviarCorreoAltaManual({ nombre: nombre || "", apellido: apellido || "", correo });
      } catch (mailErr) {
        console.error("Error al enviar correo de alta manual:", mailErr);
      }
    }

    res.json({ ok: true });
  } catch (error) {
    console.error("Error en fotografiaPaciente:", error);
    res.status(500).json({ ok: false, message: "Error al guardar la fotografía." });
  }
}

export async function historialTutorPaciente(req, res) {
  try {
    const { id } = req.params;
    const { tutorLugarNacimiento, tutorEdad, tutorOcupacion, tutorEscolaridad,
            tutorParentesco, madreSeguroMedico, cdEmbarazo, acidoFolico, citasControl } = req.body;
    await actualizarPaso4(Number(id), {
      tutorLugarNacimiento, tutorEdad, tutorOcupacion, tutorEscolaridad,
      tutorParentesco, madreSeguroMedico, cdEmbarazo, acidoFolico, citasControl,
    });
    res.json({ ok: true });
  } catch (error) {
    console.error("Error en historialTutorPaciente:", error);
    res.status(500).json({ ok: false, message: "Error al guardar historial del tutor." });
  }
}

export async function historialMedicoPaciente(req, res) {
  try {
    const { id } = req.params;
    const { lugarNacimiento, hospitalNacimiento, tipoSangre, usaValvula, notas } = req.body;
    if (!lugarNacimiento || !hospitalNacimiento || !tipoSangre) {
      return res.status(400).json({ ok: false, message: "Lugar de nacimiento, hospital y tipo de sangre son obligatorios." });
    }
    await actualizarPaso3(Number(id), { lugarNacimiento, hospitalNacimiento, tipoSangre, usaValvula, notas });
    res.json({ ok: true });
  } catch (error) {
    console.error("Error en historialMedicoPaciente:", error);
    res.status(500).json({ ok: false, message: "Error al guardar historial médico." });
  }
}

export async function contactoPaciente(req, res) {
  try {
    const { id } = req.params;
    const { direccion, ciudad, estado, codigoPostal,
            emergenciaContacto, emergenciaTelefono,
            telefonoCasa, telefonoCelular, correo,
            // usuarioId: null = invitado, tiene valor = coordinadora
            usuarioId, nombre, apellido } = req.body;

    if (!direccion || !ciudad || !estado || !codigoPostal || !emergenciaContacto || !emergenciaTelefono) {
      return res.status(400).json({ ok: false, message: "Faltan campos obligatorios de contacto." });
    }

    await actualizarPaso2(Number(id), {
      direccion, ciudad, estado, codigoPostal,
      emergenciaContacto, emergenciaTelefono,
      telefonoCasa, telefonoCelular, correo,
    });

    // Solo enviar correo de pre-registro si es invitado
    if (!usuarioId && correo) {
      try {
        await enviarCorreoPreRegistro({ nombre: nombre || "", apellido: apellido || "", correo });
      } catch (mailErr) {
        console.error("Error al enviar correo de pre-registro:", mailErr);
      }
    }

    res.json({ ok: true });
  } catch (error) {
    console.error("Error en contactoPaciente:", error);
    res.status(500).json({ ok: false, message: "Error al guardar contacto." });
  }
}