import { obtenerHistorialPorPaciente } from "./historial.service.js";

export async function getHistorial(req, res) {
  try {
    const { id } = req.params;

    const data = await obtenerHistorialPorPaciente(id);

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener historial" });
  }
}