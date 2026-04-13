import { getPacienteDetalle } from "./detallepacienteservice.js";

export async function listarPacienteDetalle(req, res) {
    try {
      const data = await getPacienteDetalle();
      res.json({ ok: true, data });
    } catch (error) {
      console.error("ERROR DETALLE PACIENTE:", error.message);
      res.status(500).json({ ok: false, message: error.message });
    }
  }

