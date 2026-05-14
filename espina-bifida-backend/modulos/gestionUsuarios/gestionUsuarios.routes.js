import express from "express";
import { listar, obtener, crear, actualizar, eliminar, uploadFoto } from "./gestionUsuarios.controller.js";

const router = express.Router();

router.get("/",       listar);
router.get("/:id",    obtener);
router.post("/",      uploadFoto, crear);
router.put("/:id",    uploadFoto, actualizar);
router.delete("/:id", eliminar);

export default router;