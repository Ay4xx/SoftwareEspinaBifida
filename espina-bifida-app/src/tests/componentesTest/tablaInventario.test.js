import { render, screen } from "@testing-library/react";
import TablaInventario from "../../componentes/tablaInventario/TablaInventario";

describe("TablaInventario", () => {
  test("renderiza los artículos y su estado correctamente", () => {
    const articulos = [
      { nombre: "Ibuprofeno", unidad: "Cápsula", precio: 12.5, stock: 10, estado: "Normal" },
      { nombre: "Paracetamol", unidad: "Tableta", precio: 8.75, stock: 2, estado: "Bajo" },
      { nombre: "Guantes", unidad: "Caja", precio: 0, stock: 0, estado: "Agotado" },
    ];

    render(<TablaInventario articulos={articulos} />);

    expect(screen.getByText(/Ibuprofeno/i)).toBeInTheDocument();
    expect(screen.getByText(/Cápsula/i)).toBeInTheDocument();
    expect(screen.getByText(/Paracetamol/i)).toBeInTheDocument();
    expect(screen.getByText(/Bajo/i)).toBeInTheDocument();
    expect(screen.getByText(/Agotado/i)).toBeInTheDocument();
    expect(screen.getByText(/\$\s*12\.5/)).toBeInTheDocument();
  });
});