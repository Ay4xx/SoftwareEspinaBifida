import { Router } from "express";
import { listarEquipo, listarEquipoMDisponibles } from "./equipomedicocontroller.js";

const router = Router();

router.get("/", listarEquipo);                    // GET /api/medicamentos
router.get("/disponibles", listarEquipoMDisponibles); // GET /api/medicamentos/disponibles?ids=1,2,3

export default router;