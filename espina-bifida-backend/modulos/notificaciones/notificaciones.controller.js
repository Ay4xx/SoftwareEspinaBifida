import {
  getNotificaciones,
  aprobarNotificacion,
  rechazarNotificacion,
  getNotificacionById,
  eliminarNotificacionesAntiguas,
} from "./notificaciones.service.js";
import { enviarCorreoAprobacion, enviarCorreoRechazo } from "../email/email.service.js";

// ── Helper ────────────────────────────────────────────────────────────────────

async function enviarCorreoSilencioso(fn, label) {
  try {
    await fn();
  } catch (err) {
    console.error(`Error al enviar correo (${label}):`, err);
  }
}

async function notificarPorCorreo(id, fnCorreo, label) {
  const notificacion = await getNotificacionById(id);
  if (notificacion?.EMAIL) {
    await enviarCorreoSilencioso(
      () => fnCorreo({ nombre: notificacion.NOMBRE || "", apellido: notificacion.APELLIDO || "", correo: notificacion.EMAIL }),
      label
    );
  }
}

// ── Controllers ───────────────────────────────────────────────────────────────

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
    const actualizado = await aprobarNotificacion(id);
    if (!actualizado)
      return res.status(404).json({ ok: false, message: "Notificación no encontrada o ya fue resuelta" });

    await notificarPorCorreo(id, enviarCorreoAprobacion, "aprobación");
    res.json({ ok: true, message: "Notificación aprobada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: "Error al aprobar la notificación" });
  }
}

export async function rechazarNotificacionController(req, res) {
  try {
    const { id } = req.params;
    const actualizado = await rechazarNotificacion(id);
    if (!actualizado)
      return res.status(404).json({ ok: false, message: "Notificación no encontrada o ya fue resuelta" });

    await notificarPorCorreo(id, enviarCorreoRechazo, "rechazo");
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
    if (!data)
      return res.status(404).json({ ok: false, message: "Notificación no encontrada" });

    const safeData = JSON.parse(JSON.stringify(data, (key, value) => {
      if (value && typeof value === "object" && value.constructor &&
          !["Object", "Array", "String", "Number", "Boolean", "Date"].includes(value.constructor.name))
        return String(value);
      return value;
    }));
    res.json({ ok: true, data: safeData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: "Error al obtener la notificación" });
  }
}

export async function limpiarNotificacionesAntiguasController(req, res) {
  try {
    const eliminadas = await eliminarNotificacionesAntiguas();
    res.json({ ok: true, eliminadas });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: "Error al limpiar notificaciones antiguas" });
  }
}
