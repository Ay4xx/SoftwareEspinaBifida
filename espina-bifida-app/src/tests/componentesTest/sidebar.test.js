import { render, screen } from "@testing-library/react";
import Sidebar from "../../componentes/sidebar/sidebar";
import { MemoryRouter } from "react-router-dom";

describe("Sidebar", () => {
  beforeEach(() => {
    localStorage.setItem("token", "test-token");
    localStorage.setItem("guest", "false");
    localStorage.setItem(
      "usuario",
      JSON.stringify({ username: "AB", tipoUsuario: "SUPERADMIN" })
    );
  });

  afterEach(() => {
    localStorage.clear();
  });

  test("renderiza el encabezado del sidebar", () => {
    render(
      <MemoryRouter initialEntries={["/usuarios"]}>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.getByText("AEBNL")).toBeInTheDocument();
    expect(screen.getByText("Espina Bífida NL")).toBeInTheDocument();
  });

  test("renderiza el título del menú principal", () => {
    render(
      <MemoryRouter initialEntries={["/usuarios"]}>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.getByText("Menú Principal")).toBeInTheDocument();
  });

  test("renderiza todas las opciones del menú para SUPERADMIN", () => {
    render(
      <MemoryRouter initialEntries={["/usuarios"]}>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.getByText("Pacientes")).toBeInTheDocument();
    expect(screen.getByText("Registro")).toBeInTheDocument();
    expect(screen.getByText("Inventario")).toBeInTheDocument();
    expect(screen.getByText("Estadísticas")).toBeInTheDocument();
    expect(screen.getByText("Gestión de usuarios")).toBeInTheDocument();
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

  test("marca Pacientes como activo cuando la ruta es /usuarios", () => {
    render(
      <MemoryRouter initialEntries={["/usuarios"]}>
        <Sidebar />
      </MemoryRouter>
    );

    const pacientesLink = screen.getByRole("link", { name: /pacientes/i });
    expect(pacientesLink).toHaveClass("active");
  });

  test("marca Gestión de usuarios como activo cuando la ruta es /gestion-usuarios", () => {
    render(
      <MemoryRouter initialEntries={["/gestion-usuarios"]}>
        <Sidebar />
      </MemoryRouter>
    );

    const gestionUsuariosLink = screen.getByRole("link", { name: /gesti[oó]n de usuarios/i });
    expect(gestionUsuariosLink).toHaveClass("active");
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

  test("marca Estadísticas como activo cuando la ruta es /estadisticas", () => {
    render(
      <MemoryRouter initialEntries={["/estadisticas"]}>
        <Sidebar />
      </MemoryRouter>
    );

    const estadisticasLink = screen.getByRole("link", {
      name: /estad/i,
    });
    expect(estadisticasLink).toHaveClass("active");
  });

  test("cada link tiene la ruta correcta", () => {
    render(
      <MemoryRouter initialEntries={["/usuarios"]}>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: /pacientes/i })).toHaveAttribute(
      "href",
      "/usuarios"
    );
    expect(screen.getByRole("link", { name: /registro/i })).toHaveAttribute(
      "href",
      "/registro"
    );
    expect(screen.getByRole("link", { name: /inventario/i })).toHaveAttribute(
      "href",
      "/inventario"
    );
    expect(screen.getByRole("link", { name: /estad/i })).toHaveAttribute(
      "href",
      "/estadisticas"
    );
    expect(screen.getByRole("link", { name: /gesti[oó]n de usuarios/i })).toHaveAttribute(
      "href",
      "/gestion-usuarios"
    );
  });
});