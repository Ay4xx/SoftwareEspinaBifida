import { obtenerHistorialFamiliar } from "./familia.service.js";

export async function getHistorialFamiliar(req, res) {
  try {
    const { id } = req.params;

    const data = await obtenerHistorialFamiliar(id);

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener información familiar" });
  }
}