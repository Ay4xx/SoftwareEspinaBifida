import express from "express";
import pacienteRoutes from "./modulos/paciente/paciente.routes.js";

const app = express();

app.use(express.json());

app.use("/api/pacientes", pacienteRoutes); // http://localhost:3000/api/pacientes/cards

export default app;