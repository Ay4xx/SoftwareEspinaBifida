import { Router } from "express";
import multer from "multer";
import { registrarPaciente, contactoPaciente, historialMedicoPaciente, historialTutorPaciente, fotografiaPaciente } from "./registro.controller.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const uploadPaso5 = upload.fields([
  { name: "foto",                    maxCount: 1 },
  { name: "docPreregistro",          maxCount: 1 },
  { name: "docActaNacimiento",       maxCount: 1 },
  { name: "docCurp",                 maxCount: 1 },
  { name: "docComprobanteDomicilio", maxCount: 1 },
  { name: "docIneFamilia",           maxCount: 1 },
]);

router.post("/", registrarPaciente);
router.put("/:id/paso2", contactoPaciente);
router.put("/:id/paso3", historialMedicoPaciente);
router.put("/:id/paso4", historialTutorPaciente);
router.put("/:id/paso5", uploadPaso5, fotografiaPaciente);

export default router;
