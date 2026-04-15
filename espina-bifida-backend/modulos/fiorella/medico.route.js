import { Router } from "express";
import { listarMedicos, listarServiciosPorMedico, guardarConsultaServicio } from "./medicocontroller.js";

const router = Router();

router.get("/", listarMedicos);
router.get("/:medicoId/servicios", listarServiciosPorMedico);
router.post("/guardar", guardarConsultaServicio);

export default router;