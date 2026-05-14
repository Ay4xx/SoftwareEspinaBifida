import { Router } from "express";
import { getEstadisticas } from "./estadisticas.controller.js";

const router = Router();

router.get("/", getEstadisticas);

export default router;