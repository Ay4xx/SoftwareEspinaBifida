import { Router } from "express";
import { listarMedicamentos, listarMedicamentosDisponibles } from "./medicamentoscontroller.js";

const router = Router();

router.get("/", listarMedicamentos);                    // GET /api/medicamentos
router.get("/disponibles", listarMedicamentosDisponibles); // GET /api/medicamentos/disponibles?ids=1,2,3

export default router;