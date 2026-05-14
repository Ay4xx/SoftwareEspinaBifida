import { getEstadisticasService } from "./estadisticas.service.js";

export async function getEstadisticas(req, res) {
  try {
    const data = await getEstadisticasService();

    return res.status(200).json({
      ok: true,
      data,
    });
  } catch (error) {
    console.error("Error en getEstadisticas controller:", error);

    return res.status(500).json({
      ok: false,
      message: "Error al obtener las estadísticas",
      error: error.message,
    });
  }
}