import express from "express";
import cors from "cors";
import pacienteRoutes from "./modulos/paciente/paciente.routes.js";
import medicoRouter from "./modulos/fiorella/medico.route.js";

const app = express();

app.use(cors());    
app.use(express.json());

app.use("/api/pacientes", pacienteRoutes); // http://localhost:3000/api/pacientes/cards
app.use("/api/medicos", medicoRouter);

export default app;