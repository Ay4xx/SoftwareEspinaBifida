// controllers/agendacitas/agendacitas.controller.js

import {
  getCitasByFecha,
  getCargaMes,
  crearCita,
  actualizarEstatusCita,
  eliminarCita,
  getCitaById,
} from "./agendacitas.service.js";

/*
========================================
OBTENER CITAS POR FECHA
========================================
*/
export async function obtenerCitasPorFecha(
  req,
  res
) {
  try {
    const { fecha } = req.query;

    if (!fecha) {
      return res.status(400).json({
        ok: false,
        message: "La fecha es requerida",
      });
    }

    console.log("fecha query:");
    console.log(fecha);
    const citas = await getCitasByFecha(fecha);

    res.json({
      ok: true,
      citas,
    });
  } catch (error) {
    console.error(
      "Error obteniendo citas:",
      error
    );

    res.status(500).json({
      ok: false,
      message: "Error obteniendo citas",
    });
  }
}

/*
========================================
OBTENER CITA POR ID
========================================
*/
export async function obtenerCitaPorId(
  req,
  res
) {
  try {
    const { id } = req.params;

    const cita = await getCitaById(id);

    if (!cita) {
      return res.status(404).json({
        ok: false,
        message: "Cita no encontrada",
      });
    }

    res.json({
      ok: true,
      cita,
    });
  } catch (error) {
    console.error(
      "Error obteniendo cita:",
      error
    );

    res.status(500).json({
      ok: false,
      message: "Error obteniendo cita",
    });
  }
}

/*
========================================
CREAR CITA
========================================
*/
export async function crearNuevaCita(req, res) {
  try {
    const {
      id_paciente,
      fecha_cita,
      hora_cita,
    } = req.body;

    // VALIDACIONES BÁSICAS
    if (
      !id_paciente ||
      !fecha_cita ||
      !hora_cita
    ) {
      return res.status(400).json({
        ok: false,
        message:
          "id_paciente, fecha_cita y hora_cita son requeridos",
      });
    }

    const nuevaCita = await crearCita(req.body);

    res.status(201).json({
      ok: true,
      message: "Cita creada correctamente",
      ...nuevaCita,
    });
  } catch (error) {
    console.error(
      "Error creando cita:",
      error
    );

    res.status(500).json({
      ok: false,
      message: "Error creando cita",
    });
  }
}

/*
========================================
ACTUALIZAR ESTATUS
========================================
*/
export async function actualizarEstatus(
  req,
  res
) {
  try {
    const { id } = req.params;

    const { estatus_cita } = req.body;

    if (!estatus_cita) {
      return res.status(400).json({
        ok: false,
        message:
          "El estatus de la cita es requerido",
      });
    }

    await actualizarEstatusCita(
      id,
      estatus_cita
    );

    res.json({
      ok: true,
      message:
        "Estatus actualizado correctamente",
    });
  } catch (error) {
    console.error(
      "Error actualizando estatus:",
      error
    );

    res.status(500).json({
      ok: false,
      message:
        "Error actualizando estatus",
    });
  }
}

/*
========================================
OBTENER CARGA DEL MES
========================================
*/
export async function obtenerCargaMes(req, res) {
  try {
    const { anio, mes } = req.query;

    const dias = await getCargaMes(
      Number(anio),
      Number(mes)
    );

    res.json({
      ok: true,
      dias,
    });
  } catch (error) {
    console.error(
      "Error obteniendo carga del mes:",
      error
    );

    res.status(500).json({
      ok: false,
      message: "Error obteniendo carga del mes",
    });
  }
}

/*
========================================
ELIMINAR CITA
========================================
*/
export async function eliminarCitaController(
  req,
  res
) {
  try {
    const { id } = req.params;

    await eliminarCita(id);

    res.json({
      ok: true,
      message: "Cita eliminada correctamente",
    });
  } catch (error) {
    console.error(
      "Error eliminando cita:",
      error
    );

    res.status(500).json({
      ok: false,
      message: "Error eliminando cita",
    });
  }
}