import { Router } from "express";
import { crearMedicina, crearEquipoMedico } from "./regservicios.controller.js";

const router = Router();

// POST /api/inventario/medicina
router.post("/medicina", crearMedicina);

// POST /api/inventario/equipo
router.post("/equipo", crearEquipoMedico);

export default router;