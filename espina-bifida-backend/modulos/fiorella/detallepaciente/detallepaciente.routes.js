import { Router } from "express";
import { listarPacienteDetalle} from "./detallepaciente.controller.js";

const router = Router();

router.get("/:pacienteId", listarPacienteDetalle);                    // GET /api/medicamentos


export default router;