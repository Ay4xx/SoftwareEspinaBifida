import React, { useState, useEffect } from "react";
import TablaInventario from "../componentes/tablaInventario/TablaInventario";
import NuevoArticulo from "../componentes/nuevoarticulo/nuevoarticulo";
import RegistrarEntrada from "../componentes/nuevoarticulo/registrararticulo";
import EliminarArticulo from "../componentes/nuevoarticulo/eliminararticulo";
import { Trash2 } from "lucide-react";
import "./inventario.css";
import { Plus, RefreshCw, Search } from "lucide-react";

function calcularEstado(cantidad) {
  if (cantidad === 0) return "Agotado";
  if (cantidad <= 5) return "Bajo";
  return "Normal";
}

function ModuloInventario() {
  const [articulos, setArticulos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [showNuevo, setShowNuevo] = useState(false);
  const [showEntrada, setShowEntrada] = useState(false);
  const [showEliminar, setShowEliminar] = useState(false);

  const cargarInventario = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/inventario/");
      const data = await res.json();
      const filas = (data.data || data).map((item) => ({
        nombre: item.DESCRIPCION,
        unidad: item.UNIDAD || "—",
        precio: item.PRECIO,
        stock: item.CANTIDAD_TOTAL,
        estado: calcularEstado(item.CANTIDAD_TOTAL),
      }));
      setArticulos(filas);
    } catch (err) {
      console.error("Error cargando inventario:", err);
    }
  };

  useEffect(() => {
    cargarInventario();
  }, []);

  const handleGuardado = () => {
    setShowNuevo(false);
    setShowEntrada(false);
    cargarInventario();
    setShowEliminar(false);
  };

  return (
    <div className="modulo-inventario">
            <div className="modulo-buscador">
        <Search size={16} className="buscador-icono" />
        <input
          type="text"
          placeholder="Buscar artículo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>
      <div className="modulo-botones">
        <button className="btn-nuevo" onClick={() => setShowNuevo(true)}>
          <Plus size={16} /> Nuevo Artículo
        </button>
        <button className="btn-entrada" onClick={() => setShowEntrada(true)}>
          <RefreshCw size={16} /> Registrar Entrada
        </button>
        <button className="btn-eliminar" onClick={() => setShowEliminar(true)}>
            <Trash2 size={16} /> Eliminar Artículo
          </button>
      </div>


      <TablaInventario articulos={articulos.filter((a) => {
        const normalizar = (str) => str.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
        return normalizar(a.nombre).includes(normalizar(busqueda));
      })} />

      {showNuevo && (
        <NuevoArticulo
          onCerrar={() => setShowNuevo(false)}
          onGuardado={handleGuardado}
        />
      )}

      {showEntrada && (
        <RegistrarEntrada
          onCerrar={() => setShowEntrada(false)}
          onGuardado={handleGuardado}
        />
      )}
      {showEliminar && (
        <EliminarArticulo
          onCerrar={() => setShowEliminar(false)}
          onGuardado={handleGuardado}
        />
      )}
    </div>
  );
}

export default ModuloInventario;
