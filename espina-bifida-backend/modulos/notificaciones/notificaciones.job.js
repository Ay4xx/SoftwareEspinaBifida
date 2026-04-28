import { eliminarNotificacionesAntiguas } from "./notificaciones.service.js";

const UN_DIA_MS = 24 * 60 * 60 * 1000;

export function iniciarJobLimpieza() {
  // Ejecutar al arrancar el servidor
  eliminarNotificacionesAntiguas().catch((err) =>
    console.error("[Job] Error en limpieza inicial:", err)
  );

  // Repetir cada 24 horas
  setInterval(() => {
    eliminarNotificacionesAntiguas().catch((err) =>
      console.error("[Job] Error en limpieza periódica:", err)
    );
  }, UN_DIA_MS);

  console.log("[Job] Limpieza automática de notificaciones iniciada");
}