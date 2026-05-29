import { insertarMedicina, insertarEquipoMedico, verificarDuplicado, actualizarCantidadMedicina, actualizarCantidadEquipo, getInventarioCompleto, eliminarArticulo  } from "./regservicios.service.js";

export async function crearMedicina(req, res) {
  try {
    const { descripcion, unidad, precio, medicion, cantidad_total } = req.body;

    if (!descripcion || !unidad || !precio || !medicion || !cantidad_total) {
      return res.status(400).json({ ok: false, message: "Todos los campos son obligatorios" });
    }

    const duplicado = await verificarDuplicado(descripcion, "medicina");
    if (duplicado) {
      return res.status(400).json({ ok: false, message: "Esta medicina ya existe en el inventario" });
    }

    const result = await insertarMedicina({ descripcion, unidad, precio, medicion, cantidad_total });
    res.status(201).json({ ok: true, message: "Medicina insertada correctamente", data: result });
  } catch (error) {
    console.error("ERROR AL INSERTAR MEDICINA:", error.message);
    res.status(500).json({ ok: false, message: error.message });
  }
}

export async function crearEquipoMedico(req, res) {
  try {
    const { descripcion, precio, cantidad_total } = req.body;

    if (!descripcion || !precio || !cantidad_total) {
      return res.status(400).json({ ok: false, message: "Todos los campos son obligatorios" });
    }

    const duplicado = await verificarDuplicado(descripcion, "equipo");
    if (duplicado) {
      return res.status(400).json({ ok: false, message: "Este equipo ya existe en el inventario" });
    }

    const result = await insertarEquipoMedico({ descripcion, precio, cantidad_total });
    res.status(201).json({ ok: true, message: "Equipo médico insertado correctamente", data: result });
  } catch (error) {
    console.error("ERROR AL INSERTAR EQUIPO:", error.message);
    res.status(500).json({ ok: false, message: error.message });
  }
}


export async function registrarEntradaMedicina(req, res) {
  try {
    const { medicinaId, cantidad } = req.body;

    if (!medicinaId || !cantidad) {
      return res.status(400).json({ ok: false, message: "ID y cantidad son obligatorios" });
    }
    if (cantidad <= 0) {
      return res.status(400).json({ ok: false, message: "La cantidad debe ser mayor a 0" });
    }

    await actualizarCantidadMedicina(medicinaId, cantidad);
    res.json({ ok: true, message: "Cantidad actualizada correctamente" });
  } catch (error) {
    console.error("ERROR AL ACTUALIZAR MEDICINA:", error.message);
    res.status(500).json({ ok: false, message: error.message });
  }
}

export async function registrarEntradaEquipo(req, res) {
  try {
    const { equipoId, cantidad } = req.body;

    if (!equipoId || !cantidad) {
      return res.status(400).json({ ok: false, message: "ID y cantidad son obligatorios" });
    }
    if (cantidad <= 0) {
      return res.status(400).json({ ok: false, message: "La cantidad debe ser mayor a 0" });
    }

    await actualizarCantidadEquipo(equipoId, cantidad);
    res.json({ ok: true, message: "Cantidad actualizada correctamente" });
  } catch (error) {
    console.error("ERROR AL ACTUALIZAR EQUIPO:", error.message);
    res.status(500).json({ ok: false, message: error.message });
  }
}

export async function listarInventario(req, res) {
  try {
    const data = await getInventarioCompleto();
    res.json({ ok: true, data });
  } catch (error) {
    console.error("ERROR AL LISTAR INVENTARIO:", error.message);
    res.status(500).json({ ok: false, message: error.message });
  }
}

export async function eliminarArticuloController(req, res) {
  try {
    const { id, tipo } = req.params;
    if (!id || !tipo) {
      return res.status(400).json({ ok: false, message: "ID y tipo son obligatorios" });
    }
    await eliminarArticulo(id, tipo);
    res.json({ ok: true, message: "Artículo eliminado correctamente" });
  } catch (error) {
    console.error("ERROR AL ELIMINAR:", error.message);
    res.status(500).json({ ok: false, message: error.message });
  }
}