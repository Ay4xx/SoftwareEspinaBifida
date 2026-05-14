import { Router } from "express";
import { listar, obtener, crear, actualizar, eliminar } from "./gestionUsuarios.controller.js";

const router = Router();


function autenticar(req, res, next) {
    const token = req.headers["authorization"]?.split(" ")[1];

    if (!token)
        return res.status(401).json({ ok: false, message: "Token requerido" });


    const match = token.match(/^token-(\d+)-([^-]+)-\d+$/);
        if (!match)
            return res.status(401).json({ ok: false, message: "Token inválido" });

    req.usuario = { id: Number(match[1]), tipoUsuario: match[2] };
    next();
    }


function soloAdmin(req, res, next) {
  const tipo = req.usuario.tipoUsuario?.toUpperCase();
  if (tipo !== "ADMINISTRADOR" && tipo !== "SUPERADMIN")
    return res.status(403).json({ ok: false, message: "Solo los administradores pueden realizar esta acción" });
  next();
}


router.get   ("/",    autenticar,            listar);
router.get   ("/:id", autenticar,            obtener);
router.post  ("/",    autenticar, soloAdmin, crear);
router.put   ("/:id", autenticar, soloAdmin, actualizar);
router.delete("/:id", autenticar, soloAdmin, eliminar);

export default router;