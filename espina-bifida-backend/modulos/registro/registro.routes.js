import { Router } from "express";
import { registrarPaciente, contactoPaciente, historialMedicoPaciente, historialTutorPaciente, fotografiaPaciente } from "./registro.controller.js";
import { uploadPaso5 } from "./registro.multer.js";

const router = Router();

router.post("/",             registrarPaciente);
router.put("/:id/paso2",     contactoPaciente);
router.put("/:id/paso3",     historialMedicoPaciente);
router.put("/:id/paso4",     historialTutorPaciente);
router.put("/:id/paso5",     uploadPaso5, fotografiaPaciente);

export default router;
