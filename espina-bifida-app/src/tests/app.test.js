import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { getRol, RutaProtegida } from "../App";

describe("App helpers", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  test("getRol devuelve el rol en mayúsculas", () => {
    localStorage.setItem("usuario", JSON.stringify({ tipoUsuario: "administrador" }));
    expect(getRol()).toBe("ADMINISTRADOR");
  });

  test("getRol retorna null si no hay usuario válido", () => {
    localStorage.setItem("usuario", "no-json");
    expect(getRol()).toBeNull();
  });

  test("RutaProtegida redirige a login si no hay token", () => {
    render(
      <MemoryRouter initialEntries={["/gestion-usuarios"]}>
        <Routes>
          <Route
            path="/gestion-usuarios"
            element={
              <RutaProtegida
                element={<div>Panel privado</div>}
                rolesPermitidos={["ADMINISTRADOR"]}
              />
            }
          />
          <Route path="/login" element={<div>Login</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  test("RutaProtegida redirige a /usuarios si el rol no está permitido", () => {
    localStorage.setItem("token", "test-token");
    localStorage.setItem("usuario", JSON.stringify({ tipoUsuario: "COORDINADOR" }));

    render(
      <MemoryRouter initialEntries={["/gestion-usuarios"]}>
        <Routes>
          <Route
            path="/gestion-usuarios"
            element={
              <RutaProtegida
                element={<div>Panel privado</div>}
                rolesPermitidos={["ADMINISTRADOR"]}
              />
            }
          />
          <Route path="/usuarios" element={<div>Pacientes</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Pacientes")).toBeInTheDocument();
  });

  test("RutaProtegida permite el acceso cuando el rol es válido", () => {
    localStorage.setItem("token", "test-token");
    localStorage.setItem("usuario", JSON.stringify({ tipoUsuario: "ADMINISTRADOR" }));

    render(
      <MemoryRouter initialEntries={["/gestion-usuarios"]}>
        <Routes>
          <Route
            path="/gestion-usuarios"
            element={
              <RutaProtegida
                element={<div>Panel privado</div>}
                rolesPermitidos={["ADMINISTRADOR", "SUPERADMIN"]}
              />
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Panel privado")).toBeInTheDocument();
  });
});
