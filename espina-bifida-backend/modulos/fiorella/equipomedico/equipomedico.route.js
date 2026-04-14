import { Router } from "express";
import { listarEquipo, listarEquipoMDisponibles, guardarConsultaEquipo } from "./equipomedicocontroller.js";

const router = Router();

router.get("/", listarEquipo);                    // GET /api/medicamentos
router.get("/disponibles", listarEquipoMDisponibles); // GET /api/medicamentos/disponibles?ids=1,2,3
router.post("/guardar", guardarConsultaEquipo);

export default router;