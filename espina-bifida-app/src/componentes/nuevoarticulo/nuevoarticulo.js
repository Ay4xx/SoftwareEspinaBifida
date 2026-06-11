import React, { useState } from "react";
import "./nuevoarticulo.css";
import { X } from "lucide-react";
import API_BASE from "../../config.js";


const camposIniciales = {
  categoria: "",
  descripcion: "",
  unidad: "",
  precio: "",
  medicion: "",
  cantidad_total: "",
};

function NuevoArticulo({ onCerrar, onGuardado }) {
  const [form, setForm] = useState(camposIniciales);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [exito, setExito] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleGuardar = async () => {
    const { categoria, descripcion, precio, cantidad_total } = form;

    if (!categoria) { setError("Selecciona una categoría."); return; }
    if (!descripcion) { setError("El nombre es obligatorio."); return; }
    if (!precio) { setError("El precio es obligatorio."); return; }
    if (!cantidad_total) { setError("La cantidad es obligatoria."); return; }
    if (categoria === "medicina" && !form.unidad) { setError("La unidad es obligatoria."); return; }
    if (categoria === "medicina" && !form.medicion) { setError("La medición es obligatoria."); return; }

    setCargando(true);
    try {
      const url = categoria === "medicina"
        ? `${API_BASE}/api/inventario/medicina`
        : `${API_BASE}/api/inventario/equipo`;

      const body = categoria === "medicina"
        ? { descripcion, unidad: form.unidad, precio, medicion: form.medicion, cantidad_total }
        : { descripcion, precio, cantidad_total };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (json.ok) {
        setExito(true);
      } else {
        setError(json.message);
      }
    } catch (err) {
      setError("Error de conexión con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  return (
     <div className="na-overlay" >
      <div className="na-popup">

        <div className="na-header">
          <h4>Nuevo Artículo</h4>
          <button className="na-close" onClick={onCerrar}><X size={18} /></button>
        </div>

        <div className="na-field">
          <label>Categoría</label>
          <select name="categoria" value={form.categoria} onChange={handleChange}>
            <option value="">Seleccionar</option>
            <option value="medicina">Medicina</option>
            <option value="equipo">Comodato</option>
          </select>
        </div>

        <div className="na-field">
          <label>Nombre / Descripción</label>
          <input type="text" name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Ej. Ibuprofeno 400mg" />
        </div>

        <div className="na-row">
          <div className="na-field">
            <label>Precio</label>
            <input type="number" name="precio" value={form.precio} onChange={handleChange} placeholder="0.00" />
          </div>

          <div className="na-field">
            <label>Cantidad Total</label>
            <input type="number" name="cantidad_total" value={form.cantidad_total} onChange={handleChange} placeholder="0" />
          </div>
        </div>

        {form.categoria === "medicina" && (
          <div className="na-row">
            <div className="na-field">
              <label>Unidad</label>
              <input type="text" name="unidad" value={form.unidad} onChange={handleChange} placeholder="Ej. Cápsula" />
            </div>
            <div className="na-field">
              <label>Medición</label>
              <input type="number" name="medicion" value={form.medicion} onChange={handleChange} placeholder="Ej. 400" />
            </div>
          </div>
        )}

        {error && <p className="na-error"> {error}</p>}

        <div className="na-footer">
          <button className="na-cancelar" onClick={onCerrar}>Cancelar</button>
          <button className="na-guardar" onClick={handleGuardar} disabled={cargando}>
            {cargando ? "Guardando..." : "Guardar"}
          </button>
        </div>

      </div>
      {exito && (
        <div className="na-overlay">
            <div className="na-popup-msg" onClick={(e) => e.stopPropagation()}>
            <div className="na-popup-icon"></div>
            <h4>Artículo guardado</h4>
            <p>El artículo fue registrado correctamente.</p>
            <button className="na-guardar" onClick={onGuardado}>Aceptar</button>
            </div>
        </div>
        )}
    </div>
  );
}

export default NuevoArticulo;