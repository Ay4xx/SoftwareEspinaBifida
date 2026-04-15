import { getPacienteDetalle } from "./detallepaciente.service.js";

export async function listarPacienteDetalle(req, res) {
    try {
      const { pacienteId } = req.params;

      const data = await getPacienteDetalle(pacienteId);

      if (!data) {
        return res.status(404).json({ 
          ok: false, 
          message: "Paciente no encontrado" });
      }

      res.json({ ok: true, data });
      
    } catch (error) {
      console.error("ERROR DETALLE PACIENTE:", error.message);
      res.status(500).json({ ok: false, message: error.message });
    }
  }

