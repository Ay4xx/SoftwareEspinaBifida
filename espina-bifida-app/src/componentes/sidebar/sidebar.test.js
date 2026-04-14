import { render, screen } from "@testing-library/react";
import Sidebar from "./sidebar";
import { MemoryRouter } from "react-router-dom";

describe("Sidebar", () => {
  test("renderiza el encabezado del sidebar", () => {
    render(
      <MemoryRouter initialEntries={["/usuarios"]}>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.getByText("AEBNL")).toBeInTheDocument();
    expect(screen.getByText("Espina Bífida NL")).toBeInTheDocument();
    expect(screen.getByText("AE")).toBeInTheDocument();
  });

  test("renderiza el título del menú principal", () => {
    render(
      <MemoryRouter initialEntries={["/usuarios"]}>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.getByText("Menú Principal")).toBeInTheDocument();
  });

  test("renderiza todas las opciones del menú", () => {
    render(
      <MemoryRouter initialEntries={["/usuarios"]}>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.getByText("Usuarios")).toBeInTheDocument();
    expect(screen.getByText("Historial")).toBeInTheDocument();
    expect(screen.getByText("Registro")).toBeInTheDocument();
    expect(screen.getByText("Inventario")).toBeInTheDocument();
    expect(screen.getByText("Estadisticas")).toBeInTheDocument();
  });

  test("renderiza la sección de sistema", () => {
    render(
      <MemoryRouter initialEntries={["/usuarios"]}>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.getByText("Sistema")).toBeInTheDocument();
    expect(screen.getByText("Cerrar sesión")).toBeInTheDocument();
  });

  test("marca Usuarios como activo cuando la ruta es /usuarios", () => {
    render(
      <MemoryRouter initialEntries={["/usuarios"]}>
        <Sidebar />
      </MemoryRouter>
    );

    const usuariosLink = screen.getByRole("link", { name: /usuarios/i });
    expect(usuariosLink).toHaveClass("active");
  });

  test("marca Historial como activo cuando la ruta es /historial", () => {
    render(
      <MemoryRouter initialEntries={["/historial"]}>
        <Sidebar />
      </MemoryRouter>
    );

    const historialLink = screen.getByRole("link", { name: /historial/i });
    expect(historialLink).toHaveClass("active");
  });

  test("marca Registro como activo cuando la ruta es /registro", () => {
    render(
      <MemoryRouter initialEntries={["/registro"]}>
        <Sidebar />
      </MemoryRouter>
    );

    const registroLink = screen.getByRole("link", { name: /registro/i });
    expect(registroLink).toHaveClass("active");
  });

  test("marca Inventario como activo cuando la ruta es /inventario", () => {
    render(
      <MemoryRouter initialEntries={["/inventario"]}>
        <Sidebar />
      </MemoryRouter>
    );

    const inventarioLink = screen.getByRole("link", { name: /inventario/i });
    expect(inventarioLink).toHaveClass("active");
  });

  test("marca Estadisticas como activo cuando la ruta es /estadisticas", () => {
    render(
      <MemoryRouter initialEntries={["/estadisticas"]}>
        <Sidebar />
      </MemoryRouter>
    );

    const estadisticasLink = screen.getByRole("link", {
      name: /estadisticas/i,
    });
    expect(estadisticasLink).toHaveClass("active");
  });

  test("cada link tiene la ruta correcta", () => {
    render(
      <MemoryRouter initialEntries={["/usuarios"]}>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: /usuarios/i })).toHaveAttribute(
      "href",
      "/usuarios"
    );
    expect(screen.getByRole("link", { name: /historial/i })).toHaveAttribute(
      "href",
      "/historial"
    );
    expect(screen.getByRole("link", { name: /registro/i })).toHaveAttribute(
      "href",
      "/registro"
    );
    expect(screen.getByRole("link", { name: /inventario/i })).toHaveAttribute(
      "href",
      "/inventario"
    );
    expect(screen.getByRole("link", { name: /estadisticas/i })).toHaveAttribute(
      "href",
      "/estadisticas"
    );
  });
});