import { getPacienteCards } from "../paciente/paciente.service.js";

export async function listarPacienteCards(req, res) {
  try {
    const { search } = req.query;
    const data = await getPacienteCards(search);

    res.json({
      ok: true,
      data
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      message: "Error al obtener pacientes"
    });
  }
}

export async function obtenerPacientePorId(req, res) {
  try {
    const { id } = req.params;
    const paciente = await getPacienteDetail(id);

    if (!paciente) {
      return res.status(404).json({
        ok: false,
        message: "Paciente no encontrado"
      });
    }

    res.json({
      ok: true,
      data: paciente
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      message: "Error al obtener el paciente"
    });
  }
}