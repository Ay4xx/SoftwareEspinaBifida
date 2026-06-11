import dotenv from "dotenv";
import app from "./app.js"; // Asegúrate que app.js esté en la misma carpeta
import { iniciarJobLimpieza } from "./modulos/notificaciones/notificaciones.job.js";

// Carga las variables de entorno configuradas en Render o en tu .env local
dotenv.config();

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor corriendo exitosamente en el puerto ${PORT}`);
  // Inicia el job de limpieza solo cuando el servidor esté listo
  if (typeof iniciarJobLimpieza === 'function') {
    iniciarJobLimpieza();
  }
});