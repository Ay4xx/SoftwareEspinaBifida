import { iniciarSesionPaciente } from "../login/login.service.js";

export async function loginPaciente(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        ok: false,
        message: "Username y contraseña son obligatorios"
      });
    }

    const data = await iniciarSesionPaciente(username, password);

    if (!data) {
      return res.status(401).json({
        ok: false,
        message: "Credenciales incorrectas"
      });
    }

    res.json({
      ok: true,
      data
    });
  } catch (error) {
    console.error("Error en loginPaciente:", error);
    res.status(500).json({
      ok: false,
      message: "Error al iniciar sesión"
    });
  }
}