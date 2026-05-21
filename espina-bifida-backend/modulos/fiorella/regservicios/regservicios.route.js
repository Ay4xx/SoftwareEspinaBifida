import { Router } from "express";
import { crearMedicina, crearEquipoMedico,   registrarEntradaMedicina, registrarEntradaEquipo, listarInventario, eliminarArticuloController  } from "./regservicios.controller.js";

const router = Router();

// POST /api/inventario/medicina
router.post("/medicina", crearMedicina);

// POST /api/inventario/equipo
router.post("/equipo", crearEquipoMedico);
router.put("/medicina/cantidad", registrarEntradaMedicina);
router.put("/equipo/cantidad", registrarEntradaEquipo);
router.get("/", listarInventario);
router.delete("/:tipo/:id", eliminarArticuloController);

export default router;