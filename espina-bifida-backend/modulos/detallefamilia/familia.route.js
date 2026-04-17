import express from "express";
import { getHistorialFamiliar } from "./familia.controller.js";

const router = express.Router();

router.get("/:id", getHistorialFamiliar);

export default router;