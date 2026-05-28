import express from "express";
import { guardarPago } from "./pagorecibo.controller.js";

const router = express.Router();

router.post("/guardar", guardarPago);

export default router;