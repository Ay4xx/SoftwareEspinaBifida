import express from "express";
import {
  activarMembresiaController,
  desactivarMembresiaController,
} from "./membresia.controller.js";

const router = express.Router();

router.put("/activar/:pacienteId", activarMembresiaController);
router.put("/desactivar/:pacienteId", desactivarMembresiaController);

export default router;