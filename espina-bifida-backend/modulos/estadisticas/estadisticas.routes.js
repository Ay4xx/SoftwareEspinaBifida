import { Router } from "express";

import {
  getEstadisticas,
  descargarReporteMensual,
} from "./estadisticas.controller.js";

const router = Router();

router.get("/", getEstadisticas);

router.post("/reporte", (req, res, next) => {
  console.log("ROUTER HIT /reporte");
  next();
}, descargarReporteMensual);

export default router;