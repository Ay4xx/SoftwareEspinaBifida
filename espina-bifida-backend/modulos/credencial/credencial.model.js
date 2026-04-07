import express from "express";
import {
  crearCredencial,
  obtenerInfoCredenciales,
  obtenerCredencialPorId
} from "./credencial.controller.js";

const router = express.Router();

router.get("/", obtenerInfoCredenciales);

export default router;