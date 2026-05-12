import { insertarMedicina, insertarEquipoMedico, verificarDuplicado } from "./regservicios.service.js";

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