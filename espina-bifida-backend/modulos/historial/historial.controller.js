import { obtenerHistorialPorPaciente, eliminarEvento } from "./historial.service.js";

export async function getHistorial(req, res) {
  try {
    const data = await obtenerHistorialPorPaciente(req.params.id);
    res.json(data);
  } catch (error) {
    console.error("Error en getHistorial:", error);
    res.status(500).json({ error: "Error al obtener historial" });
  }
}

export async function deleteEvento(req, res) {
  try {
    await eliminarEvento(req.params.eventoId);
    res.json({ ok: true, message: "Evento eliminado y stock restaurado correctamente" });
  } catch (error) {
    console.error("Error en deleteEvento:", error);
    res.status(500).json({ error: "Error al eliminar evento" });
  }
}
