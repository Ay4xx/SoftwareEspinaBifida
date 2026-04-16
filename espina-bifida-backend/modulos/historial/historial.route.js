import express from "express";
import { getHistorial } from "./historial.controller.js";

const router = express.Router();

router.get("/:id", getHistorial);

export default router;