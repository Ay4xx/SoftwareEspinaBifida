import { Router } from "express";
import { loginPaciente } from "./login.controller.js";

const router = Router();

router.post("/", loginPaciente);

export default router;