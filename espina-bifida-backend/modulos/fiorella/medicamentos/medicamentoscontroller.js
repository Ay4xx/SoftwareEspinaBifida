import { getMedicamentos, getMedicamentosDisponibles } from "./medicamentosservice.js";

export async function listarMedicamentos(req, res) {
    try {
      const data = await getMedicamentos();
      res.json({ ok: true, data });
    } catch (error) {
      console.error("ERROR MEDICAMENTOS:", error.message);
      res.status(500).json({ ok: false, message: error.message });
    }
  }

export async function listarMedicamentosDisponibles(req, res) {
  try {
    // recibe los ids seleccionados como query param: ?ids=1,2,3
    const ids = req.query.ids
      ? req.query.ids.split(",").map(Number)
      : [];
    const data = await getMedicamentosDisponibles(ids);
    res.json({ ok: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: "Error al obtener medicamentos disponibles" });
  }
}