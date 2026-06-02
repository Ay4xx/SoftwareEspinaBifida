import React, { useState, useEffect } from "react";
import "./eliminararticulo.css";
import { X } from "lucide-react";

function EliminarArticulo({ onCerrar, onGuardado }) {
  const [categoria, setCategoria] = useState("");
  const [articulos, setArticulos] = useState([]);
  const [seleccionado, setSeleccionado] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [exito, setExito] = useState(false);

  useEffect(() => {
    if (!categoria) return;

    fetch("http://localhost:3001/api/inventario/")
      .then((r) => r.json())
      .then((res) => {
        const todos = res.data || [];
        const filtrados = todos.filter((a) => a.TIPO === categoria);
        setArticulos(filtrados);
        setSeleccionado("");
      })
      .catch(console.error);
  }, [categoria]);

  const handleEliminar = async () => {
    if (!categoria) { setError("Selecciona una categoría."); return; }
    if (!seleccionado) { setError("Selecciona un artículo."); return; }

    setCargando(true);
    try {
      const res = await fetch(
        `http://localhost:3001/api/inventario/${categoria}/${seleccionado}`,
        { method: "DELETE" }
      );

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
      <div className="el-overlay">
        <div className="el-popup-msg">
          <div className="el-popup-icon"></div>
          <h4>Artículo eliminado</h4>
          <p>El artículo fue eliminado correctamente.</p>
          <button className="el-guardar" onClick={() => { setExito(false); onGuardado(); }}>Aceptar</button>
        </div>
      </div>
    );
  }

  return (
            <div 
        className="el-overlay" 
        >
      <div className="el-popup" >

        <div className="el-header">
          <h4>Eliminar Artículo</h4>
          <button className="el-close" onClick={onCerrar}><X size={18} /></button>
        </div>

        <div className="el-field">
          <label>Categoría</label>
          <select value={categoria} onChange={(e) => { setCategoria(e.target.value); setError(""); }}>
            <option value="">Seleccionar</option>
            <option value="medicina">Medicina</option>
            <option value="equipo">Equipo Médico</option>
          </select>
        </div>

        {categoria && (
          <div className="el-field">
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

        {error && <p className="el-error"> {error}</p>}

        <div className="el-footer">
          <button className="el-cancelar" onClick={onCerrar}>Cancelar</button>
          <button className="el-eliminar" onClick={handleEliminar} disabled={cargando}>
            {cargando ? "Eliminando..." : "Eliminar"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default EliminarArticulo;