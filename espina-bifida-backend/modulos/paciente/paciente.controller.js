import {
  getPacienteCards,
  getPacienteDetail,
  getPacienteCredencial,
  getPacienteDetalle,
  guardarFoto,
  obtenerFoto as obtenerFotoService,
} from "../paciente/paciente.service.js";

export async function listarPacienteCards(req, res) {
  try {
    const { search } = req.query;
    const data = await getPacienteCards(search);

    res.json({
      ok: true,
      data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      message: "Error al obtener pacientes",
    });
  }
}

export async function obtenerPacientePorId(req, res) {
  try {
    const { id } = req.params;
    const paciente = await getPacienteDetail(id);

    if (!paciente) {
      return res.status(404).json({
        ok: false,
        message: "Paciente no encontrado",
      });
    }

    res.json({
      ok: true,
      data: paciente,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      message: "Error al obtener el paciente",
    });
  }
}

export async function obtenerPacienteCredencial(req, res) {
  try {
    const { pacienteId } = req.params;
    const credencial = await getPacienteCredencial(Number(pacienteId));

    if (!credencial) {
      return res.status(404).json({
        ok: false,
        message: "Paciente no encontrado",
      });
    }

    res.json({
      ok: true,
      data: credencial,
    });
  } catch (error) {
    console.error("Error al obtener credencial:", error);
    res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
}

export async function obtenerPacienteDetalle(req, res) {
  try {
    const { id } = req.params;
    const paciente = await getPacienteDetalle(id);

    if (!paciente) {
      return res.status(404).json({
        ok: false,
        message: "Paciente no encontrado",
      });
    }

    res.json({
      ok: true,
      data: paciente,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
}

export async function subirFoto(req, res) {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        ok: false,
        message: "No se recibió ninguna imagen",
      });
    }

    await guardarFoto(id, req.file.buffer);

    res.json({
      ok: true,
      message: "Foto guardada correctamente",
    });
  } catch (error) {
    console.error("Error en subirFoto:", error);
    res.status(500).json({
      ok: false,
      message: "Error al guardar la foto",
      error: error.message,
    });
  }
}

export async function obtenerFoto(req, res) {
  try {
    const { id } = req.params;
    const foto = await obtenerFotoService(id);

    if (!foto) {
      return res.status(404).json({
        ok: false,
        message: "Foto no encontrada",
      });
    }

    res.set("Content-Type", "image/jpeg");
    res.send(foto);
  } catch (error) {
    console.error("Error en obtenerFoto:", error);
    res.status(500).json({
      ok: false,
      message: "Error al obtener la foto",
      error: error.message,
    });
  }
}