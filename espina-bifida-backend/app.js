import express from "express";
import cors from "cors";
import pacienteRoutes from "./modulos/paciente/paciente.routes.js";
import registroRoutes from "./modulos/registro/registro.routes.js";
import medicoRouter from "./modulos/fiorella/medico.route.js";
import medicamentoRouter from "./modulos/fiorella/medicamentos/medicamentos.route.js";
import equipoRouter from "./modulos/fiorella/equipomedico/equipomedico.route.js";
import notificacionesRoutes from "./modulos/notificaciones/notificaciones.routes.js";
import detallePaRouter from "./modulos/fiorella/detallepaciente/detallepaciente.routes.js";
import loginRoutes from "./modulos/login/login.routes.js";
import historialRoutes from "./modulos/historial/historial.route.js";
import agendacitasRoutes from "./modulos/agendacitas/agendacitas.route.js";
import familiarRoutes from "./modulos/detallefamilia/familia.route.js";
import inventarioRouter from "./modulos/fiorella/regservicios/regservicios.route.js";
import gestionUsuarioRoutes from "./modulos/gestionUsuarios/gestionUsuarios.routes.js";
import estadisticasRoutes from "./modulos/estadisticas/estadisticas.routes.js";
import membresiaRoutes from "./modulos/membresia/membresia.routes.js";

const app = express();

export const sseClients = new Set();

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

app.get("/api/notificaciones-sse", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  sseClients.add(res);

  req.on("close", () => {
    sseClients.delete(res);
  });
});

app.use("/api/login", loginRoutes);
app.use("/api/registro", registroRoutes);
app.use("/api/pacientes", pacienteRoutes);
app.use("/api/medicos", medicoRouter);
app.use("/api/medicamentos", medicamentoRouter);
app.use("/api/equipomedico", equipoRouter);
app.use("/api/detallepaciente", detallePaRouter);
app.use("/api/notificaciones", notificacionesRoutes);
app.use("/api/historial", historialRoutes);
app.use("/api/familiar", familiarRoutes);
app.use("/api/citas", agendacitasRoutes);
app.use("/api/inventario", inventarioRouter);
app.use("/api/gestion-usuarios", gestionUsuarioRoutes);
app.use("/api/estadisticas", estadisticasRoutes);
app.use("/api/membresia", membresiaRoutes);
export default app;