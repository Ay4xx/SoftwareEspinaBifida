import { Router } from "express";
import {
  listarPacienteCards,
  obtenerPacientePorId
} from "../paciente/paciente.controller.js";

const router = Router();

router.get("/cards", listarPacienteCards); // http://localhost:3000/api/pacientes/cards
router.get("/:id", obtenerPacientePorId);

export default router;