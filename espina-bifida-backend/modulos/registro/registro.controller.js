import { crearPacientePaso1, actualizarPaso2, actualizarPaso3, actualizarPaso4, actualizarPaso5, guardarDocumentos } from "./registro.service.js";
import { enviarCorreoPreRegistro, enviarCorreoAltaManual } from "../email/email.service.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

async function enviarCorreoSilencioso(fn, label) {
  try {
    await fn();
  } catch (err) {
    console.error(`Error al enviar correo (${label}):`, err);
  }
}

function extraerDocumentos(files) {
  const campos = ["docPreregistro", "docActaNacimiento", "docCurp", "docComprobanteDomicilio", "docIneFamilia"];
  return Object.fromEntries(campos.map((campo) => [campo, files[campo]?.[0]?.buffer ?? null]));
}

// ── Controllers ───────────────────────────────────────────────────────────────

export async function registrarPaciente(req, res) {
  try {
    const { nombre, apellido, genero, fechaNacimiento, curp, usuarioId } = req.body;

    if (!curp) {
      return res.status(400).json({ ok: false, message: "La CURP es obligatoria." });
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

export async function contactoPaciente(req, res) {
  try {
    const { id } = req.params;
    const { direccion, ciudad, estado, codigoPostal, emergenciaContacto, emergenciaTelefono,
            telefonoCasa, telefonoCelular, correo, usuarioId, nombre, apellido } = req.body;

    await actualizarPaso2(Number(id), {
      direccion, ciudad, estado, codigoPostal,
      emergenciaContacto, emergenciaTelefono,
      telefonoCasa, telefonoCelular, correo,
    });

    if (!usuarioId && correo) {
      await enviarCorreoSilencioso(
        () => enviarCorreoPreRegistro({ nombre: nombre || "", apellido: apellido || "", correo }),
        "pre-registro"
      );
    }

    res.json({ ok: true });
  } catch (error) {
    console.error("Error en contactoPaciente:", error);
    res.status(500).json({ ok: false, message: "Error al guardar contacto." });
  }
}

export async function historialMedicoPaciente(req, res) {
  try {
    const { id } = req.params;
    const { lugarNacimiento, hospitalNacimiento, tipoSangre, usaValvula, notas,
            tipoEspinaBifida, otrosPadecimiento } = req.body;

    await actualizarPaso3(Number(id), {
      lugarNacimiento, hospitalNacimiento, tipoSangre,
      usaValvula, notas, tipoEspinaBifida, otrosPadecimiento,
    });
    res.json({ ok: true });
  } catch (error) {
    console.error("Error en historialMedicoPaciente:", error);
    res.status(500).json({ ok: false, message: "Error al guardar historial médico." });
  }
}

export async function historialTutorPaciente(req, res) {
  try {
    const { id } = req.params;
    const datos = req.body;

    await actualizarPaso4(Number(id), datos);
    res.json({ ok: true });
  } catch (error) {
    console.error("Error en historialTutorPaciente:", error);
    res.status(500).json({ ok: false, message: "Error al guardar historial del tutor." });
  }
}

export async function fotografiaPaciente(req, res) {
  try {
    const { id } = req.params;
    const { usuarioId, nombre, apellido, correo } = req.body;
    const files = req.files || {};

    const fotoBuffer = files.foto?.[0]?.buffer ?? null;
    if (fotoBuffer) {
      await actualizarPaso5(Number(id), fotoBuffer);
    }

    const documentos = extraerDocumentos(files);
    const tieneDocumentos = Object.values(documentos).some((b) => b !== null);
    if (tieneDocumentos) {
      await guardarDocumentos(Number(id), documentos);
    }

    if (usuarioId && correo) {
      await enviarCorreoSilencioso(
        () => enviarCorreoAltaManual({ nombre: nombre || "", apellido: apellido || "", correo }),
        "alta-manual"
      );
    }

    res.json({ ok: true });
  } catch (error) {
    console.error("Error en fotografiaPaciente:", error);
    res.status(500).json({ ok: false, message: "Error al guardar la fotografía." });
  }
}
