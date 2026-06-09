import { Router } from "express";
import upload from "../middlewares/upload.js";
import {
  listarPacienteCards,
  obtenerPacientePorId,
  obtenerPacienteCredencial,
  obtenerPacienteDetalle,
  subirFoto,
  obtenerFoto,
  actualizarPaciente,
  borrarPaciente,
} from "../paciente/paciente.controller.js";

const router = Router();

router.get("/cards", listarPacienteCards);
router.get("/credencial/:pacienteId", obtenerPacienteCredencial);
router.get("/detalle/:id", obtenerPacienteDetalle);
router.get("/:id/foto", obtenerFoto);
router.delete("/:id", borrarPaciente);
router.post("/upload/:id", upload.single("foto"), subirFoto);
router.put("/:id", upload.single("foto"), actualizarPaciente);
router.get("/:id", obtenerPacientePorId);

export default router;