import express from "express";

import {
  obtenerCitasPorFecha,
  obtenerCitaPorId,
  crearNuevaCita,
  actualizarEstatus,
  eliminarCitaController,
} from "./agendacitas.controller.js";

const router = express.Router();

router.get("/", obtenerCitasPorFecha);

router.get("/:id", obtenerCitaPorId);

router.post("/", crearNuevaCita);

router.put("/:id/estatus", actualizarEstatus);

router.delete("/:id", eliminarCitaController);

export default router;