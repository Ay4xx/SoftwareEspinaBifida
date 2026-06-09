import express from "express";
import { getHistorial, deleteEvento } from "./historial.controller.js";

const router = express.Router();

router.get("/:id", getHistorial);
router.delete("/:id/:eventoId", deleteEvento);

export default router;