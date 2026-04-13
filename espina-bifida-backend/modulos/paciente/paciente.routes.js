import { Router } from "express";
import {
  listarPacienteCards,
  obtenerPacientePorId,
  obtenerPacienteCredencial,
  obtenerPacienteDetalle
} from "../paciente/paciente.controller.js";

const router = Router();

router.get("/cards", listarPacienteCards); // http://localhost:3000/api/pacientes/cards
router.get("/:id", obtenerPacientePorId);
router.get("/credencial/:pacienteId", obtenerPacienteCredencial);
router.get("/detalle/:id", obtenerPacienteDetalle); 
export default router;