import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, ".env") });

const { default: app } = await import("./app.js");
import { iniciarJobLimpieza } from "./modulos/notificaciones/notificaciones.job.js";

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor corriendo puerto ${PORT}`);
  iniciarJobLimpieza();
});
