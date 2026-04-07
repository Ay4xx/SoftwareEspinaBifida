import express from "express";
import pacienteRoutes from "./modulos/paciente/paciente.routes.js";
import medicoRouter from "./src/modules/medico/medico.route.js";

const app = express();

app.use(express.json());

app.use("/api/pacientes", pacienteRoutes); // http://localhost:3000/api/pacientes/cards
app.use("/api/medicos", medicoRouter);

export default app;