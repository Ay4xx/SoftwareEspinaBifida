import {
  getPacienteCards,
  getPacienteDetail,
  getPacienteCredencial,
  getPacienteDetalle,
  getPacienteCompleto,
  guardarFoto,
  obtenerFoto as obtenerFotoService,
  updatePaciente,
  updateHistorialMadre,
  borrarPacienteService,
  obtenerDocumento,
  getDocumentosDisponibles,
  guardarDocumentos,
} from "../paciente/paciente.service.js";

export async function listarPacienteCards(req, res) {
  try {
    const { search } = req.query;
    const data = await getPacienteCards(search);
    res.json({ ok: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: "Error al obtener pacientes" });
  }
}

export async function obtenerPacientePorId(req, res) {
  try {
    const { id } = req.params;
    const paciente = await getPacienteCompleto(id);
    if (!paciente) return res.status(404).json({ ok: false, message: "Paciente no encontrado" });
    res.json({ ok: true, data: paciente });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: "Error al obtener el paciente" });
  }
}

export async function obtenerPacienteCredencial(req, res) {
  try {
    const { pacienteId } = req.params;
    const credencial = await getPacienteCredencial(Number(pacienteId));
    if (!credencial) return res.status(404).json({ ok: false, message: "Paciente no encontrado" });
    res.json({ ok: true, data: credencial });
  } catch (error) {
    console.error("Error al obtener credencial:", error);
    res.status(500).json({ ok: false, message: "Error interno del servidor", error: error.message });
  }
}

export async function obtenerPacienteDetalle(req, res) {
  try {
    const { id } = req.params;
    const paciente = await getPacienteDetalle(id);
    if (!paciente) return res.status(404).json({ ok: false, message: "Paciente no encontrado" });
    res.json({ ok: true, data: paciente });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: error.message });
  }
}

export async function subirFoto(req, res) {
  try {
    const { id } = req.params;
    if (!req.file) return res.status(400).json({ ok: false, message: "No se recibió ninguna imagen" });
    await guardarFoto(id, req.file.buffer);
    res.json({ ok: true, message: "Foto guardada correctamente" });
  } catch (error) {
    console.error("Error en subirFoto:", error);
    res.status(500).json({ ok: false, message: "Error al guardar la foto", error: error.message });
  }
}

export async function obtenerFoto(req, res) {
  try {
    const { id } = req.params;
    const foto = await obtenerFotoService(id);
    if (!foto) return res.status(404).json({ ok: false, message: "Foto no encontrada" });
    res.set("Content-Type", "image/jpeg");
    res.send(foto);
  } catch (error) {
    console.error("Error en obtenerFoto:", error);
    res.status(500).json({ ok: false, message: "Error al obtener la foto", error: error.message });
  }
}

export async function actualizarPaciente(req, res) {
  try {
    const { id } = req.params;
    const datos = req.body;

    if (datos.tutores && typeof datos.tutores === "string") {
      datos.tutores = JSON.parse(datos.tutores);
    }

    // upload.fields() guarda los archivos en req.files (objeto)
    // upload.single() los guarda en req.file — soportamos ambos
    const fotoFile = req.files?.foto?.[0] ?? req.file ?? null;

    await updatePaciente(Number(id), datos, fotoFile);
    await updateHistorialMadre(Number(id), datos);

    // Guardar documentos si vienen en la petición
    if (req.files) {
      await guardarDocumentos(Number(id), req.files);
    }

    res.json({ ok: true, message: "Paciente actualizado correctamente" });
  } catch (error) {
    console.error("Error en actualizarPaciente:", error);
    res.status(500).json({ ok: false, message: error.message || "Error al actualizar paciente" });
  }
}

export async function borrarPaciente(req, res) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ ok: false, message: "Falta el id del paciente" });

    const borrado = await borrarPacienteService(id);
    if (!borrado)
      return res.status(404).json({ ok: false, message: "No se encontró el paciente" });

    return res.json({ ok: true, message: "Paciente eliminado correctamente" });
  } catch (error) {
    console.error("Error en borrarPaciente:", error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
}

// ── Documentos ────────────────────────────────────────────────────────────────

const NOMBRES_DESCARGA = {
  preregistro:          "preregistro",
  actaNacimiento:       "acta_nacimiento",
  curp:                 "curp",
  comprobanteDomicilio: "comprobante_domicilio",
  ineFamilia:           "ine_familia",
};

// GET /api/pacientes/:id/documento/:tipo?descargar=1
export async function verDocumento(req, res) {
  try {
    const { id, tipo } = req.params;
    const descargar = req.query.descargar === "1" || req.query.descargar === "true";
    const doc = await obtenerDocumento(id, tipo);
    if (!doc) return res.status(404).json({ ok: false, message: "Documento no encontrado" });
    const nombreBase = NOMBRES_DESCARGA[tipo] || "documento";
    const filename = `${nombreBase}_${id}.${doc.extension}`;
    res.set("Content-Type", doc.mime);
    res.set(
      "Content-Disposition",
      `${descargar ? "attachment" : "inline"}; filename="${filename}"`
    );
    res.send(doc.buffer);
  } catch (error) {
    console.error("Error en verDocumento:", error);
    res.status(500).json({ ok: false, message: "Error al obtener el documento" });
  }
}

// GET /api/pacientes/:id/documentos
export async function listarDocumentos(req, res) {
  try {
    const { id } = req.params;
    const disponibles = await getDocumentosDisponibles(id);
    res.json({ ok: true, data: disponibles });
  } catch (error) {
    console.error("Error en listarDocumentos:", error);
    res.status(500).json({ ok: false, message: "Error al listar documentos" });
  }
}