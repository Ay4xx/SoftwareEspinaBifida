import { Router } from "express";
import { requestReset, validateToken, resetPassword } from "./forgotPassword.controller.js";

const router = Router();

router.post("/request",  requestReset);   // solicitar link
router.get("/validate",  validateToken);  // validar token al abrir el link
router.post("/reset",    resetPassword);  // cambiar contraseña

export default router;