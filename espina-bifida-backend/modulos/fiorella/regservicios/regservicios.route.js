import { Router } from "express";
import { crearMedicina, crearEquipoMedico,   registrarEntradaMedicina, registrarEntradaEquipo } from "./regservicios.controller.js";

const router = Router();

// POST /api/inventario/medicina
router.post("/medicina", crearMedicina);

// POST /api/inventario/equipo
router.post("/equipo", crearEquipoMedico);
router.put("/medicina/cantidad", registrarEntradaMedicina);
router.put("/equipo/cantidad", registrarEntradaEquipo);

export default router;