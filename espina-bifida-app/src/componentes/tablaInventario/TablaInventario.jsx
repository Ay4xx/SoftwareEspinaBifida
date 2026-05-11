import React from "react";
import "./TablaInventario.css";

const estadoBadge = (estado) => {
  if (estado === "Normal") return <span className="badge badge-normal">✓ Normal</span>;
  if (estado === "Bajo") return <span className="badge badge-bajo">⚠ Bajo</span>;
  if (estado === "Agotado") return <span className="badge badge-agotado">✗ Agotado</span>;
  return <span className="badge">{estado}</span>;
};

function TablaInventario({ articulos }) {
  return (
    <div className="tabla-inventario-wrapper">
      <table className="tabla-inventario">
        <thead>
          <tr>
            <th>Medicamento</th>
            <th>Unidad</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {articulos.map((articulo, index) => (
            <tr key={index}>
              <td>{articulo.nombre}</td>
              <td>{articulo.unidad}</td>
              <td>${articulo.precio.toLocaleString()}</td>
              <td>{articulo.stock}</td>
              <td>{estadoBadge(articulo.estado)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TablaInventario;
