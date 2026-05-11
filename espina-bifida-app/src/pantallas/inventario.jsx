import React, { useState } from "react";
import TablaInventario from "../componentes/tablaInventario/TablaInventario";
import "./inventario.css";

const articulosIniciales = [
  { nombre: "Catéter nelaton CH12", unidad: "PZA", precio: 200, stock: 150, estado: "Normal" },
  { nombre: "Silla de ruedas infantil", unidad: "PZA", precio: 1000, stock: 3, estado: "Bajo" },
  { nombre: "Vendaje elástico", unidad: "ROLLO", precio: 45, stock: 25, estado: "Normal" },
  { nombre: "Muletas de aluminio", unidad: "PAR", precio: 350, stock: 8, estado: "Normal" },
  { nombre: "Collarín cervical", unidad: "PZA", precio: 280, stock: 0, estado: "Agotado" },
];

function ModuloInventario() {
  const [articulos] = useState(articulosIniciales);

  return (
    <div className="modulo-inventario">
      <h1 className="modulo-inventario-titulo">Módulo de Inventario</h1>

      {/* Área de botones — pendiente compañera */}

      <TablaInventario articulos={articulos} />
    </div>
  );
}

export default ModuloInventario;
