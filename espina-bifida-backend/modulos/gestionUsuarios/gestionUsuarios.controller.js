import multer from "multer";
import {
    listarUsuarios,
    obtenerUsuario,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
} from "./gestionUsuarios.service.js";

// Multer en memoria (guardamos el buffer directo en Oracle)
const upload = multer({ storage: multer.memoryStorage() });
export const uploadFoto = upload.single("foto");


export async function listar(req, res) {
    try {
        const { busqueda = "", pagina = 1, limite = 20 } = req.query;
        const data = await listarUsuarios({
            busqueda,
            pagina: Number(pagina),
            limite: Number(limite),
        });
        res.json({ ok: true, ...data });
    } catch (error) {
        console.error("Error en listar:", error);
        res.status(error.status || 500).json({ ok: false, message: error.message || "Error al obtener usuarios" });
    }
}


export async function obtener(req, res) {
    try {
        const usuario = await obtenerUsuario(Number(req.params.id));
        if (!usuario)
            return res.status(404).json({ ok: false, message: "Usuario no encontrado" });
        res.json({ ok: true, data: usuario });
    } catch (error) {
        console.error("Error en obtener:", error);
        res.status(error.status || 500).json({ ok: false, message: error.message || "Error al obtener usuario" });
    }
}


export async function crear(req, res) {
    try {
        const foto = req.file ? req.file.buffer : undefined;
        const nuevo = await crearUsuario({ ...req.body, foto });
        res.status(201).json({ ok: true, data: nuevo });
    } catch (error) {
        console.error("Error en crear:", error);
        res.status(error.status || 500).json({ ok: false, message: error.message || "Error al crear usuario" });
    }
}


export async function actualizar(req, res) {
    try {
        const foto = req.file ? req.file.buffer : undefined;
        const actualizado = await actualizarUsuario(Number(req.params.id), { ...req.body, foto });
        res.json({ ok: true, data: actualizado });
    } catch (error) {
        console.error("Error en actualizar:", error);
        res.status(error.status || 500).json({ ok: false, message: error.message || "Error al actualizar usuario" });
    }
}


export async function eliminar(req, res) {
    try {
        await eliminarUsuario(Number(req.params.id), req.usuario.id);
        res.json({ ok: true, message: "Usuario eliminado correctamente" });
    } catch (error) {
        console.error("Error en eliminar:", error);
        res.status(error.status || 500).json({ ok: false, message: error.message || "Error al eliminar usuario" });
    }
}