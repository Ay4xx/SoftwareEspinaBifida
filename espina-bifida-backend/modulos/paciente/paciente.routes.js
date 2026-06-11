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
  verDocumento,
  listarDocumentos,
} from "../paciente/paciente.controller.js";

const router = Router();

router.get("/cards", listarPacienteCards);
router.get("/credencial/:pacienteId", obtenerPacienteCredencial);
router.get("/detalle/:id", obtenerPacienteDetalle);
router.get("/:id/foto", obtenerFoto);
router.get("/:id/documentos", listarDocumentos);
router.get("/:id/documento/:tipo", verDocumento);
router.delete("/:id", borrarPaciente);
router.post("/upload/:id", upload.single("foto"), subirFoto);
router.put(
  "/:id",
  upload.fields([
    { name: "foto",                    maxCount: 1 },
    { name: "docPreregistro",          maxCount: 1 },
    { name: "docActaNacimiento",       maxCount: 1 },
    { name: "docCurp",                 maxCount: 1 },
    { name: "docComprobanteDomicilio", maxCount: 1 },
    { name: "docIneFamilia",           maxCount: 1 },
  ]),
  actualizarPaciente
);
router.get("/:id", obtenerPacientePorId);

export default router;