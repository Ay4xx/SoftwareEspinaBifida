import { Router } from "express";
import { listarPacienteDetalle} from "./detallepacientecontroller.js";

const router = Router();

router.get("/", listarPacienteDetalle);                    // GET /api/medicamentos


export default router;