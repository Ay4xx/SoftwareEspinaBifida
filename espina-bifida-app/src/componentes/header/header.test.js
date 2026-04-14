import { render, screen, fireEvent } from "@testing-library/react";
import Header from "./header";
import { MemoryRouter } from "react-router-dom";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Header", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  test("muestra 'Módulo de Usuarios' en la ruta /", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Módulo de Usuarios"
    );
  });

  test("muestra 'Módulo de Historial' en la ruta /historial", () => {
    render(
      <MemoryRouter initialEntries={["/historial"]}>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Módulo de Historial"
    );
  });

  test("muestra 'Módulo de Inventario' en la ruta /inventario", () => {
    render(
      <MemoryRouter initialEntries={["/inventario"]}>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Módulo de Inventario"
    );
  });

  test("muestra 'Módulo de Estadísticas' en la ruta /estadisticas", () => {
    render(
      <MemoryRouter initialEntries={["/estadisticas"]}>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Módulo de Estadísticas"
    );
  });

  test("muestra 'Módulo de Registro' en la ruta /registro", () => {
    render(
      <MemoryRouter initialEntries={["/registro"]}>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Módulo de Registro"
    );
  });

  test("muestra 'Notificaciones' en la ruta /notificaciones", () => {
    render(
      <MemoryRouter initialEntries={["/notificaciones"]}>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Notificaciones"
    );
  });

  test("muestra 'Sistema' en una ruta desconocida", () => {
    render(
      <MemoryRouter initialEntries={["/ruta-invalida"]}>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Sistema"
    );
  });

  test("renderiza el avatar", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByText("AB")).toBeInTheDocument();
  });

  test("navega a /notificaciones al dar click en el botón de campana", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/"]}>
        <Header />
      </MemoryRouter>
    );

    const bellButton = container.querySelector(".icon-btn");
    fireEvent.click(bellButton);

    expect(mockNavigate).toHaveBeenCalledWith("/notificaciones");
  });
});