import React, { useState, useEffect } from "react";
import "./registrararticulo.css";
import { X } from "lucide-react";
import API_BASE from "../../config.js";

function RegistrarEntrada({ onCerrar, onGuardado }) {
  const [categoria, setCategoria] = useState("");
  const [articulos, setArticulos] = useState([]);
  const [seleccionado, setSeleccionado] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [exito, setExito] = useState(false);

  useEffect(() => {
    if (!categoria) return;

    fetch(`${API_BASE}/api/inventario`)
      .then((r) => r.json())
      .then((res) => {
        const todos = res.data || [];
        const filtrados = todos.filter((a) => a.TIPO === categoria);
        setArticulos(filtrados);
        setSeleccionado("");
      })
      .catch(console.error);
  }, [categoria]);

  const handleGuardar = async () => {
    if (!categoria) { setError("Selecciona una categoría."); return; }
    if (!seleccionado) { setError("Selecciona un artículo."); return; }
    if (!cantidad || parseInt(cantidad) <= 0) { setError("La cantidad debe ser mayor a 0."); return; }

    setCargando(true);
    try {
      const url = categoria === "medicina"
        ? `${API_BASE}/api/inventario/medicina/cantidad`
        : `${API_BASE}/api/inventario/equipo/cantidad`;

      const body = categoria === "medicina"
        ? { medicinaId: seleccionado, cantidad: parseInt(cantidad) }
        : { equipoId: seleccionado, cantidad: parseInt(cantidad) };

      const res = await fetch(url, {
        method: "PUT",
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

  if (exito) {
    return (
      <div className="re-overlay">
        <div className="re-popup-msg">
          <div className="re-popup-icon"></div>
          <h4>Entrada registrada</h4>
          <p>La cantidad fue actualizada correctamente.</p>
          <button className="re-guardar" onClick={onGuardado}>Aceptar</button>
        </div>
      </div>
    );
  }

  return (
     <div className="re-overlay">
      <div className="re-popup" >

        <div className="re-header">
          <h4>Registrar Entrada</h4>
          <button className="re-close" onClick={onCerrar}><X size={18} /></button>
        </div>

        <div className="re-field">
          <label>Categoría</label>
          <select value={categoria} onChange={(e) => { setCategoria(e.target.value); setError(""); }}>
            <option value="">Seleccionar</option>
            <option value="medicina">Medicina</option>
            <option value="equipo">Comodato</option>
          </select>
        </div>

        {categoria && (
          <div className="re-field">
            <label>Artículo</label>
            <select value={seleccionado} onChange={(e) => { setSeleccionado(e.target.value); setError(""); }}>
              <option value="">Seleccionar</option>
              {articulos.map((a) => (
                <option key={a.ID} value={a.ID}>
                  {a.DESCRIPCION} — Cantidad: {a.CANTIDAD_TOTAL}
                </option>
              ))}
            </select>
          </div>
        )}

        {seleccionado && (
          <div className="re-field">
            <label>Cantidad a agregar</label>
            <input
              type="number"
              min={1}
              value={cantidad}
              onChange={(e) => { setCantidad(e.target.value); setError(""); }}
              placeholder="0"
            />
          </div>
        )}

        {error && <p className="re-error"> {error}</p>}

        <div className="re-footer">
          <button className="re-cancelar" onClick={onCerrar}>Cancelar</button>
          <button className="re-guardar" onClick={handleGuardar} disabled={cargando}>
            {cargando ? "Guardando..." : "Guardar"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default RegistrarEntrada;