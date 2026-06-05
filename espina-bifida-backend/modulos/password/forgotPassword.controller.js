import {
    solicitarRecuperacion,
    validarToken,
    cambiarPasswordConToken,
} from "./forgotPassword.service.js";


export async function requestReset(req, res) {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ ok: false, message: "El correo es obligatorio" });

        await solicitarRecuperacion(email);
        
        return res.json({ ok: true, message: "Si el correo está registrado, recibirás un enlace en breve" });
    } catch (error) {
        console.error("Error en requestReset:", error);
        res.status(500).json({ ok: false, message: "Error interno del servidor" });
    }
}


export async function validateToken(req, res) {
    try {
        const { token } = req.query;
        if (!token) return res.status(400).json({ ok: false, message: "Token requerido" });

        const data = await validarToken(token);
        if (!data) return res.status(400).json({ ok: false, message: "El enlace es inválido o ya expiró" });

        return res.json({ ok: true });
    } catch (error) {
        console.error("Error en validateToken:", error);
        res.status(500).json({ ok: false, message: "Error interno del servidor" });
    }
}


export async function resetPassword(req, res) {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword)
        return res.status(400).json({ ok: false, message: "Faltan datos" });

        if (newPassword.length < 8)
        return res.status(400).json({ ok: false, message: "La contraseña debe tener al menos 8 caracteres" });

        const updated = await cambiarPasswordConToken(token, newPassword);
        if (!updated)
        return res.status(400).json({ ok: false, message: "El enlace es inválido o ya expiró" });

        return res.json({ ok: true, message: "Contraseña actualizada correctamente" });
    } catch (error) {
        console.error("Error en resetPassword:", error);
        res.status(500).json({ ok: false, message: "Error interno del servidor" });
    }
}