import { getEquipoMedico, getEquipoDisponibles, guardarEventoEquipoMedico } from "./equipomedicoservice.js";

export async function listarEquipo(req, res) {
    try {
      const data = await getEquipoMedico();
      res.json({ ok: true, data });
    } catch (error) {
      console.error("ERROR EQUIPO MEDICO:", error.message);
      res.status(500).json({ ok: false, message: error.message });
    }
  }

export async function listarEquipoMDisponibles(req, res) {
  try {
    // recibe los ids seleccionados como query param: ?ids=1,2,3
    const ids = req.query.ids
      ? req.query.ids.split(",").map(Number)
      : [];
    const data = await getEquipoDisponibles(ids);
    res.json({ ok: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: "Error al obtener equipo medico disponibles" });
  }
}

export async function guardarConsultaEquipo(req, res) {
  try {
    const { pacienteId, equipos } = req.body;
    const result = await guardarEventoEquipoMedico(pacienteId, equipos);
    res.json({ ok: true, eventoId: result.eventoId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: error.message });
  }
}
