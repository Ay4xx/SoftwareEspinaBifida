import { Router } from "express";

import {
  getEstadisticas,
  descargarReporteMensual,
} from "./estadisticas.controller.js";

const router = Router();

router.get("/", getEstadisticas);

router.post("/reporte", descargarReporteMensual);

export default router;