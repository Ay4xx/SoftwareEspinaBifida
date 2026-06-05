import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

jest.mock("../componentes/sidebar/sidebar", () => ({
  __esModule: true,
  default: () => <aside data-testid="sidebar">Sidebar</aside>,
}));

jest.mock("../componentes/header/header", () => ({
  __esModule: true,
  default: () => <header data-testid="header">Header</header>,
}));

jest.mock("../pantallas/usuario/usuario", () => ({
  __esModule: true,
  default: () => <div>Usuarios Page</div>,
}));

jest.mock("../pantallas/historial", () => ({
  __esModule: true,
  default: () => <div>Historial Page</div>,
}));

jest.mock("../pantallas/notificaciones", () => ({
  __esModule: true,
  default: () => <div>Notificaciones Page</div>,
}));

jest.mock("../pantallas/registro", () => ({
  __esModule: true,
  default: () => <div>Registro Page</div>,
}));

jest.mock("../pantallas/login", () => ({
  __esModule: true,
  default: () => <div>Login Page</div>,
}));

jest.mock("../pantallas/regservicios", () => ({
  __esModule: true,
  default: () => <div>Servicios Panel</div>,
}));

jest.mock("../pantallas/inventario", () => ({
  __esModule: true,
  default: () => <div>Inventario Page</div>,
}));

jest.mock("../componentes/credencial/credencial", () => ({
  __esModule: true,
  default: () => <div>Credencial Page</div>,
}));

jest.mock("../pantallas/estadisticas/estadisticas", () => ({
  __esModule: true,
  default: () => <div>Estadisticas Page</div>,
}));

jest.mock("../pantallas/agendacitas", () => ({
  __esModule: true,
  default: () => <div>Agenda Citas Page</div>,
}));

jest.mock("../pantallas/gestionUsuarios", () => ({
  __esModule: true,
  default: () => <div>Gestion Usuarios Page</div>,
}));

jest.mock("../pantallas/notificacionesContext", () => ({
  __esModule: true,
  NotificacionesProvider: ({ children }) => (
    <div data-testid="notificaciones-provider">{children}</div>
  ),
}));

import { getRol, RutaProtegida, AppContent } from "../App";

function setUsuario(tipoUsuario) {
  localStorage.setItem(
    "usuario",
    JSON.stringify({
      tipoUsuario,
    })
  );
}

function renderWithRouter(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppContent />
    </MemoryRouter>
  );
}

describe("App.js", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe("getRol", () => {
    test("debe regresar el rol en mayúsculas si existe usuario", () => {
      setUsuario("coordinador");

      expect(getRol()).toBe("COORDINADOR");
    });

    test("debe regresar null si no hay usuario", () => {
      expect(getRol()).toBeNull();
    });

    test("debe regresar null si el JSON es inválido", () => {
      localStorage.setItem("usuario", "{json-invalido");

      expect(getRol()).toBeNull();
    });

    test("debe regresar null si usuario no tiene tipoUsuario", () => {
      localStorage.setItem("usuario", JSON.stringify({ nombre: "Juan" }));

      expect(getRol()).toBeNull();
    });
  });

  describe("RutaProtegida", () => {
    test("no debe mostrar contenido protegido si no hay token", () => {
      render(
        <MemoryRouter initialEntries={["/usuarios"]}>
          <RutaProtegida
            element={<div>Contenido protegido</div>}
            rolesPermitidos={["COORDINADOR"]}
          />
        </MemoryRouter>
      );

      expect(screen.queryByText("Contenido protegido")).not.toBeInTheDocument();
    });

    test("debe mostrar contenido si tiene token y rol permitido", () => {
      localStorage.setItem("token", "token-test");
      setUsuario("coordinador");

      render(
        <MemoryRouter initialEntries={["/usuarios"]}>
          <RutaProtegida
            element={<div>Contenido protegido</div>}
            rolesPermitidos={["COORDINADOR"]}
          />
        </MemoryRouter>
      );

      expect(screen.getByText("Contenido protegido")).toBeInTheDocument();
    });

    test("no debe mostrar contenido si el rol no está permitido", () => {
      localStorage.setItem("token", "token-test");
      setUsuario("administrador");

      render(
        <MemoryRouter initialEntries={["/registro"]}>
          <RutaProtegida
            element={<div>Registro protegido</div>}
            rolesPermitidos={["COORDINADOR"]}
          />
        </MemoryRouter>
      );

      expect(screen.queryByText("Registro protegido")).not.toBeInTheDocument();
    });
  });

  describe("AppContent", () => {
    test("debe mostrar Login en /login", () => {
      renderWithRouter("/login");

      expect(screen.getByText("Login Page")).toBeInTheDocument();
      expect(screen.queryByTestId("sidebar")).not.toBeInTheDocument();
      expect(screen.queryByTestId("header")).not.toBeInTheDocument();
    });

    test("debe mostrar usuarios si tiene rol coordinador", () => {
      localStorage.setItem("token", "token-test");
      setUsuario("coordinador");

      renderWithRouter("/usuarios");

      expect(screen.getByText("Usuarios Page")).toBeInTheDocument();
      expect(screen.getByTestId("sidebar")).toBeInTheDocument();
      expect(screen.getByTestId("header")).toBeInTheDocument();
    });

    test("debe mostrar historial si tiene rol administrador", () => {
      localStorage.setItem("token", "token-test");
      setUsuario("administrador");

      renderWithRouter("/historial");

      expect(screen.getByText("Historial Page")).toBeInTheDocument();
    });

    test("debe mostrar inventario si tiene rol superadmin", () => {
      localStorage.setItem("token", "token-test");
      setUsuario("superadmin");

      renderWithRouter("/inventario");

      expect(screen.getByText("Inventario Page")).toBeInTheDocument();
    });

    test("debe mostrar estadísticas si tiene rol coordinador", () => {
      localStorage.setItem("token", "token-test");
      setUsuario("coordinador");

      renderWithRouter("/estadisticas");

      expect(screen.getByText("Estadisticas Page")).toBeInTheDocument();
    });

    test("debe mostrar registro si tiene rol coordinador", () => {
      localStorage.setItem("token", "token-test");
      setUsuario("coordinador");

      renderWithRouter("/registro");

      expect(screen.getByText("Registro Page")).toBeInTheDocument();
    });

    test("debe permitir registro como invitado sin barras", () => {
      localStorage.setItem("guest", "true");

      renderWithRouter("/registro");

      expect(screen.getByText("Registro Page")).toBeInTheDocument();
      expect(screen.queryByTestId("sidebar")).not.toBeInTheDocument();
      expect(screen.queryByTestId("header")).not.toBeInTheDocument();
    });

    test("debe mostrar notificaciones si tiene rol coordinador", () => {
      localStorage.setItem("token", "token-test");
      setUsuario("coordinador");

      renderWithRouter("/notificaciones");

      expect(screen.getByText("Notificaciones Page")).toBeInTheDocument();
    });

    test("debe mostrar agenda de citas si tiene rol superadmin", () => {
      localStorage.setItem("token", "token-test");
      setUsuario("superadmin");

      renderWithRouter("/agendacitas");

      expect(screen.getByText("Agenda Citas Page")).toBeInTheDocument();
    });

    test("debe mostrar gestión de usuarios si tiene rol administrador", () => {
      localStorage.setItem("token", "token-test");
      setUsuario("administrador");

      renderWithRouter("/gestion-usuarios");

      expect(screen.getByText("Gestion Usuarios Page")).toBeInTheDocument();
    });

    test("coordinador no debe entrar a gestión de usuarios", () => {
      localStorage.setItem("token", "token-test");
      setUsuario("coordinador");

      renderWithRouter("/gestion-usuarios");

      expect(screen.queryByText("Gestion Usuarios Page")).not.toBeInTheDocument();
      expect(screen.getByText("Usuarios Page")).toBeInTheDocument();
    });

    test("debe mostrar credencial sin validar rol", () => {
      renderWithRouter("/credencial/10");

      expect(screen.getByText("Credencial Page")).toBeInTheDocument();
    });

    test("debe mostrar servicios panel en inventario dinámico", () => {
      localStorage.setItem("token", "token-test");
      setUsuario("administrador");

      renderWithRouter("/inventario/10");

      expect(screen.getByText("Servicios Panel")).toBeInTheDocument();
    });

    test("debe mostrar historial dinámico", () => {
      localStorage.setItem("token", "token-test");
      setUsuario("coordinador");

      renderWithRouter("/historial/10");

      expect(screen.getByText("Historial Page")).toBeInTheDocument();
    });
  });
});