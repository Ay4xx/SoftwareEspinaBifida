import React, { useState, useEffect } from "react";
import "./registrararticulo.css";
import { X } from "lucide-react";



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

    const url = categoria === "medicina"
      ? "http://localhost:3001/api/medicamentos"
      : "http://localhost:3001/api/equipo";

    fetch(url)
      .then((r) => r.json())
      .then((res) => {
        setArticulos(res.data || []);
        setSeleccionado("");
      })
      .catch(console.error);
  }, [categoria]);

  const articuloSeleccionado = articulos.find(
    (a) => String(categoria === "medicina" ? a.MEDICINA_ID : a.EQUIPO_M_ID) === String(seleccionado)
  );

  const handleGuardar = async () => {
    if (!categoria) { setError("Selecciona una categoría."); return; }
    if (!seleccionado) { setError("Selecciona un artículo."); return; }
    if (!cantidad || parseInt(cantidad) <= 0) { setError("La cantidad debe ser mayor a 0."); return; }

    setCargando(true);
    try {
      const url = categoria === "medicina"
        ? "http://localhost:3001/api/inventario/medicina/cantidad"
        : "http://localhost:3001/api/inventario/equipo/cantidad";

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

  return (
    <div className="re-overlay" onClick={onCerrar}>
      <div className="re-popup" onClick={(e) => e.stopPropagation()}>

        <div className="re-header">
          <h4>Registrar Entrada</h4>
          <button className="re-close" onClick={onCerrar}><X size={18} /></button>
        </div>

        <div className="re-field">
          <label>Categoría</label>
          <select value={categoria} onChange={(e) => { setCategoria(e.target.value); setError(""); }}>
            <option value="">Seleccionar</option>
            <option value="medicina">Medicina</option>
            <option value="equipo">Equipo Médico</option>
          </select>
        </div>

        {categoria && (
          <div className="re-field">
            <label>Artículo</label>
            <select value={seleccionado} onChange={(e) => { setSeleccionado(e.target.value); setError(""); }}>
              <option value="">Seleccionar</option>
              {articulos.map((a) => {
                const id = categoria === "medicina" ? a.MEDICINA_ID : a.EQUIPO_M_ID;
                return (
                  <option key={id} value={id}>
                    {a.DESCRIPCION} — Cantidad: {a.CANTIDAD_TOTAL}
                  </option>
                );
              })}
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
      {exito && (
        <div className="re-overlay">
            <div className="re-popup-msg" onClick={(e) => e.stopPropagation()}>
            <div className="re-popup-icon"></div>
            <h4>Entrada registrada</h4>
            <p>La cantidad fue actualizada correctamente.</p>
            <button className="re-guardar" onClick={onGuardado}>Aceptar</button>
            </div>
        </div>
        )}
    </div>
  );
}

export default RegistrarEntrada;