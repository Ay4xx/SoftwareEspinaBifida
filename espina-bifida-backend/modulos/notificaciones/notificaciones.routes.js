import { Router } from "express";
import {
  listarNotificaciones,
  aprobarNotificacionController,
  rechazarNotificacionController,
  getNotificacionByIdController,
} from "./notificaciones.controller.js";

const router = Router();

router.get("/", listarNotificaciones);
router.get("/:id", getNotificacionByIdController);
router.put("/:id/aprobar", aprobarNotificacionController);
router.put("/:id/rechazar", rechazarNotificacionController);

export default router;