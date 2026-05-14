import React, { useState } from "react";
import TablaInventario from "../componentes/tablaInventario/TablaInventario";
import NuevoArticulo from "../componentes/nuevoarticulo/nuevoarticulo";
import RegistrarEntrada from "../componentes/nuevoarticulo/registrararticulo";
import "./inventario.css";
import { Plus, RefreshCw } from "lucide-react";

const articulosIniciales = [
  { nombre: "Catéter nelaton CH12", unidad: "PZA", precio: 200, stock: 150, estado: "Normal" },
  { nombre: "Silla de ruedas infantil", unidad: "PZA", precio: 1000, stock: 3, estado: "Bajo" },
  { nombre: "Vendaje elástico", unidad: "ROLLO", precio: 45, stock: 25, estado: "Normal" },
  { nombre: "Muletas de aluminio", unidad: "PAR", precio: 350, stock: 8, estado: "Normal" },
  { nombre: "Collarín cervical", unidad: "PZA", precio: 280, stock: 0, estado: "Agotado" },
];

function ModuloInventario() {
  const [articulos] = useState(articulosIniciales);
  const [showNuevo, setShowNuevo] = useState(false);
  const [showEntrada, setShowEntrada] = useState(false);

  return (
    <div className="modulo-inventario">
      <div className="modulo-botones">
        <button className="btn-nuevo" onClick={() => setShowNuevo(true)}>
          <Plus size={16} /> Nuevo Artículo
        </button>
        <button className="btn-entrada" onClick={() => setShowEntrada(true)}>
          <RefreshCw size={16} /> Registrar Entrada
        </button>
      </div>

      <TablaInventario articulos={articulos} />

      {showNuevo && (
        <NuevoArticulo
          onCerrar={() => setShowNuevo(false)}
          onGuardado={() => setShowNuevo(false)}
        />
      )}

      {showEntrada && (
        <RegistrarEntrada
          onCerrar={() => setShowEntrada(false)}
          onGuardado={() => setShowEntrada(false)}
        />
      )}
    </div>
  );
}

export default ModuloInventario;