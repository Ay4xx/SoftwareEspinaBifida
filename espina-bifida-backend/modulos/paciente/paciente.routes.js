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
} from "../paciente/paciente.controller.js";

const router = Router();

router.get("/cards", listarPacienteCards);
router.get("/credencial/:pacienteId", obtenerPacienteCredencial);
router.get("/detalle/:id", obtenerPacienteDetalle);
router.get("/:id/foto", obtenerFoto);
router.post("/upload/:id", upload.single("foto"), subirFoto);
router.put("/:id", upload.single("foto"), actualizarPaciente);
router.get("/:id", (req, res, next) => {
  console.log("GET /api/pacientes/:id llamado con id:", req.params.id);
  next();
}, obtenerPacientePorId);

export default router;