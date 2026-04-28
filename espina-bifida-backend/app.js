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
import familiarRoutes from "./modulos/detallefamilia/familia.route.js"


const app = express();

app.use(cors());
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

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

export default app;