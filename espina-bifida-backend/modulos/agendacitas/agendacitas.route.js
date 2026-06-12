import express from "express";

import {
  obtenerCitasPorFecha,
  obtenerCitaPorId,
  obtenerCargaMes,
  crearNuevaCita,
  actualizarEstatus,
  eliminarCitaController,
} from "./agendacitas.controller.js";

const router = express.Router();

// IMPORTANTE: antes de "/:id"
router.get("/carga-mes", obtenerCargaMes);

router.get("/", obtenerCitasPorFecha);

router.get("/:id", obtenerCitaPorId);

router.post("/", crearNuevaCita);

router.put("/:id/estatus", actualizarEstatus);

router.delete("/:id", eliminarCitaController);

export default router;