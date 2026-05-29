import { eliminarNotificacionesAntiguas } from "./notificaciones.service.js";

const UN_DIA_MS = 24 * 60 * 60 * 1000;

export function iniciarJobLimpieza() {
  // Ejecutar al arrancar el servidor
  eliminarNotificacionesAntiguas().catch((err) =>
    console.error(" Error en limpieza inicial:", err)
  );

  // Repetir cada 24 horas
  setInterval(() => {
    eliminarNotificacionesAntiguas().catch((err) =>
      console.error("Error en limpieza periódica:", err)
    );
  }, UN_DIA_MS);

  console.log("Limpieza automática de notificaciones iniciada");
}