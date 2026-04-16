import { getMedicos, getServiciosByMedico, guardarEventoServicio, getMedicosConServicios } from "./medicoservice.js";

export async function listarMedicos(req, res) {
  try {
    const data = await getMedicosConServicios();
  //  console.log("Medicos con servicios:", data); // 👀 log en terminal
    res.json({ ok: true, data });
  } catch (error) {
    console.error("Error en listarMedicos:", error);
    res.status(500).json({ ok: false, message: "Error al obtener médicos" });
  }
}

export async function listarServiciosPorMedico(req, res) {
  try {
    const { medicoId } = req.params;
    const data = await getServiciosByMedico(req.params.medicoId);
    res.json({ ok: true, data });
  } catch (error) {
    console.error("ERROR REAL:", error); // 👈 AGREGA ESTO
    res.json({ ok: false, message: "Error al obtener servicios" });
  }
}

export async function guardarConsultaServicio(req, res) {
  try {
    const { pacienteId, fechaEvento, cuota, servicioId, horaCita } = req.body;
    const result = await guardarEventoServicio(pacienteId, fechaEvento, cuota, servicioId, horaCita);
    res.json({ ok: true, eventoId: result.eventoId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: error.message });
  }
}

