import { getMedicos, getServiciosByMedico } from "./medicoservice.js";

export async function listarMedicos(req, res) {
  try {
    const data = await getMedicos();
    res.json({ ok: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: "Error al obtener médicos" });
  }
}

export async function listarServiciosPorMedico(req, res) {
  try {
    const { medicoId } = req.params;
    const data = await getServiciosByMedico(medicoId);
    res.json({ ok: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: "Error al obtener servicios" });
  }
}