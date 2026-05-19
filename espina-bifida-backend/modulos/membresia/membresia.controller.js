import { activarMembresia, desactivarMembresia } from "./membresia.service.js";

export async function activarMembresiaController(req, res) {
  try {
    const { pacienteId } = req.params;
    const { fechaInicio } = req.body;

    if (!pacienteId) {
      return res.status(400).json({
        ok: false,
        message: "El pacienteId es obligatorio",
      });
    }

    if (!fechaInicio) {
      return res.status(400).json({
        ok: false,
        message: "La fecha de inicio es obligatoria",
      });
    }

    const result = await activarMembresia(pacienteId, fechaInicio);

    return res.status(200).json({
      ok: true,
      message: "Membresía activada correctamente",
      data: result,
    });
  } catch (error) {
    console.error("Error en activarMembresiaController:", error);

    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
}

export async function desactivarMembresiaController(req, res) {
  try {
    const { pacienteId } = req.params;

    if (!pacienteId) {
      return res.status(400).json({
        ok: false,
        message: "El pacienteId es obligatorio",
      });
    }

    const result = await desactivarMembresia(pacienteId);

    return res.status(200).json({
      ok: true,
      message: "Membresía desactivada correctamente",
      data: result,
    });
  } catch (error) {
    console.error("Error en desactivarMembresiaController:", error);

    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
}
