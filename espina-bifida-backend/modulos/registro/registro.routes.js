import { Router } from "express";
import multer from "multer";
import { registrarPaciente, contactoPaciente, historialMedicoPaciente, historialTutorPaciente, fotografiaPaciente } from "./registro.controller.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post("/", registrarPaciente);
router.put("/:id/paso2", contactoPaciente);
router.put("/:id/paso3", historialMedicoPaciente);
router.put("/:id/paso4", historialTutorPaciente);
router.put("/:id/paso5", upload.single("foto"), fotografiaPaciente);

export default router;
