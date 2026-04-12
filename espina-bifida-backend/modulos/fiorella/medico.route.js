import { Router } from "express";
import { listarMedicos, listarServiciosPorMedico } from "./medicocontroller.js";

const router = Router();

router.get("/", listarMedicos);
router.get("/:medicoId/servicios", listarServiciosPorMedico);

export default router;