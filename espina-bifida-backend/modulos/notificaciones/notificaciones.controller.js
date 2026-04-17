import {
  getNotificaciones,
  aprobarNotificacion,
  rechazarNotificacion,
  getNotificacionById,
} from "./notificaciones.service.js";

export async function listarNotificaciones(req, res) {
  try {
    const { estado } = req.query;
    const data = await getNotificaciones(estado);
    res.json({ ok: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: "Error al obtener notificaciones" });
  }
}

export async function aprobarNotificacionController(req, res) {
  try {
    const { id } = req.params;
    const { usuarioId } = req.body;
    const actualizado = await aprobarNotificacion(id, usuarioId);
    if (!actualizado) {
      return res.status(404).json({ ok: false, message: "Notificación no encontrada o ya fue resuelta" });
    }
    res.json({ ok: true, message: "Notificación aprobada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: "Error al aprobar la notificación" });
  }
}

export async function rechazarNotificacionController(req, res) {
  try {
    const { id } = req.params;
    const { usuarioId } = req.body;
    const actualizado = await rechazarNotificacion(id, usuarioId);
    if (!actualizado) {
      return res.status(404).json({ ok: false, message: "Notificación no encontrada o ya fue resuelta" });
    }
    res.json({ ok: true, message: "Notificación rechazada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: "Error al rechazar la notificación" });
  }
}

export async function getNotificacionByIdController(req, res) {
  try {
    const { id } = req.params;
    const data = await getNotificacionById(id);
    if (!data) {
      return res.status(404).json({ ok: false, message: "Notificación no encontrada" });
    }
    const safeData = JSON.parse(JSON.stringify(data, (key, value) => {
      if (
        value &&
        typeof value === "object" &&
        value.constructor &&
        !["Object", "Array", "String", "Number", "Boolean", "Date"].includes(value.constructor.name)
      ) {
        return String(value);
      }
      return value;
    }));
    res.json({ ok: true, data: safeData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: "Error al obtener la notificación" });
  }
}