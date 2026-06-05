import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import GestionUsuarios from "../../pantallas/gestionUsuarios";

jest.mock("../../pantallas/gestionUsuarios.css", () => ({}));

jest.mock("lucide-react", () => ({
  Search: () => <span data-testid="icon-search">Search</span>,
  Plus: () => <span data-testid="icon-plus">Plus</span>,
  Pencil: () => <span data-testid="icon-pencil">Pencil</span>,
  Trash2: () => <span data-testid="icon-trash">Trash2</span>,
  Camera: () => <span data-testid="icon-camera">Camera</span>,
}));

describe("GestionUsuarios", () => {
  const usuariosMock = [
    {
      id: 1,
      nombre: "Juan Pérez",
      username: "juan@test.com",
      tipoUsuario: "COORDINADOR",
      foto: null,
      fechaRegistro: "2026-06-05T00:00:00.000Z",
    },
    {
      id: 2,
      nombre: "Ana Admin",
      username: "ana@test.com",
      tipoUsuario: "ADMINISTRADOR",
      foto: "http://localhost/foto.png",
      fechaRegistro: "2026-06-01T00:00:00.000Z",
    },
    {
      id: 3,
      nombre: "Root User",
      username: "root@test.com",
      tipoUsuario: "SUPERADMIN",
      foto: null,
      fechaRegistro: null,
    },
  ];

  const mockFetchUsuarios = () => {
    globalThis.fetch.mockResolvedValueOnce({
      json: async () => ({
        ok: true,
        usuarios: usuariosMock,
      }),
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();

    globalThis.fetch = jest.fn();
    globalThis.alert = jest.fn();
    globalThis.confirm = jest.fn();

    Storage.prototype.getItem = jest.fn((key) => {
      if (key === "token") return "token-prueba";

      if (key === "usuario") {
        return JSON.stringify({
          id: 1,
          nombre: "Juan Pérez",
          foto: null,
        });
      }

      return null;
    });

    Storage.prototype.setItem = jest.fn();

    window.dispatchEvent = jest.fn();

    globalThis.URL.createObjectURL = jest.fn(() => "blob:foto-preview");
  });

  test("muestra mensaje de carga inicialmente y luego renderiza usuarios", async () => {
    mockFetchUsuarios();

    render(<GestionUsuarios />);

    expect(screen.getByText("Cargando usuarios...")).toBeInTheDocument();

    expect(await screen.findByText("Juan Pérez")).toBeInTheDocument();
    expect(screen.getByText("Ana Admin")).toBeInTheDocument();
    expect(screen.getByText("Root User")).toBeInTheDocument();

    expect(screen.getByText("Coordinador")).toBeInTheDocument();
    expect(screen.getByText("Administrador")).toBeInTheDocument();
    expect(screen.getByText("Super Admin")).toBeInTheDocument();
  });

  test("llama al endpoint de carga con token", async () => {
    mockFetchUsuarios();

    render(<GestionUsuarios />);

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/gestion-usuarios?busqueda=&limite=50",
        {
          headers: {
            Authorization: "Bearer token-prueba",
          },
        }
      );
    });
  });

  test("muestra error si falla la carga de usuarios", async () => {
    globalThis.fetch.mockResolvedValueOnce({
      json: async () => ({
        ok: false,
        message: "Error",
      }),
    });

    render(<GestionUsuarios />);

    expect(
      await screen.findByText("No se pudieron cargar los usuarios")
    ).toBeInTheDocument();
  });

  test("filtra usuarios por búsqueda", async () => {
    mockFetchUsuarios();

    render(<GestionUsuarios />);

    expect(await screen.findByText("Juan Pérez")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Buscar usuario..."), {
      target: {
        value: "ana",
      },
    });

    expect(screen.getByText("Ana Admin")).toBeInTheDocument();
    expect(screen.queryByText("Juan Pérez")).not.toBeInTheDocument();
  });

  test("muestra mensaje si no encuentra usuarios filtrados", async () => {
    mockFetchUsuarios();

    render(<GestionUsuarios />);

    await screen.findByText("Juan Pérez");

    fireEvent.change(screen.getByPlaceholderText("Buscar usuario..."), {
      target: {
        value: "noexiste",
      },
    });

    expect(screen.getByText("No se encontraron usuarios")).toBeInTheDocument();
  });

  test("abre modal de nuevo usuario", async () => {
    mockFetchUsuarios();

    render(<GestionUsuarios />);

    await screen.findByText("Juan Pérez");

    fireEvent.click(
      screen.getByRole("button", { name: /Nuevo usuario/i })
    );

    expect(
      screen.getByRole("heading", { name: "Nuevo usuario" })
    ).toBeInTheDocument();

    expect(
      screen.getByText("Completa los datos del nuevo usuario")
    ).toBeInTheDocument();

    expect(screen.getByPlaceholderText("Ej. Sofía Ramírez")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("correo@aebnl.mx")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Mínimo 8 caracteres")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Repite la contraseña")).toBeInTheDocument();
  });

  test("cierra modal al presionar cancelar", async () => {
    mockFetchUsuarios();

    render(<GestionUsuarios />);

    await screen.findByText("Juan Pérez");

    fireEvent.click(
      screen.getByRole("button", { name: /Nuevo usuario/i })
    );

    expect(
      screen.getByRole("heading", { name: "Nuevo usuario" })
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Cancelar" })
    );

    expect(
      screen.queryByText("Completa los datos del nuevo usuario")
    ).not.toBeInTheDocument();
  });

  test("valida nombre requerido al crear usuario", async () => {
    mockFetchUsuarios();

    render(<GestionUsuarios />);

    await screen.findByText("Juan Pérez");

    fireEvent.click(
      screen.getByRole("button", { name: /Nuevo usuario/i })
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Crear usuario" })
    );

    expect(screen.getByText("El nombre es requerido")).toBeInTheDocument();
  });

  test("valida correo requerido al crear usuario", async () => {
    mockFetchUsuarios();

    render(<GestionUsuarios />);

    await screen.findByText("Juan Pérez");

    fireEvent.click(
      screen.getByRole("button", { name: /Nuevo usuario/i })
    );

    fireEvent.change(screen.getByPlaceholderText("Ej. Sofía Ramírez"), {
      target: {
        name: "nombre",
        value: "Sofía Ramírez",
      },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Crear usuario" })
    );

    expect(screen.getByText("El correo es requerido")).toBeInTheDocument();
  });

  test("valida contraseña requerida al crear usuario", async () => {
    mockFetchUsuarios();

    render(<GestionUsuarios />);

    await screen.findByText("Juan Pérez");

    fireEvent.click(
      screen.getByRole("button", { name: /Nuevo usuario/i })
    );

    fireEvent.change(screen.getByPlaceholderText("Ej. Sofía Ramírez"), {
      target: {
        name: "nombre",
        value: "Sofía Ramírez",
      },
    });

    fireEvent.change(screen.getByPlaceholderText("correo@aebnl.mx"), {
      target: {
        name: "username",
        value: "sofia@test.com",
      },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Crear usuario" })
    );

    expect(screen.getByText("La contraseña es requerida")).toBeInTheDocument();
  });

  test("valida reglas de contraseña", async () => {
    mockFetchUsuarios();

    render(<GestionUsuarios />);

    await screen.findByText("Juan Pérez");

    fireEvent.click(
      screen.getByRole("button", { name: /Nuevo usuario/i })
    );

    fireEvent.change(screen.getByPlaceholderText("Ej. Sofía Ramírez"), {
      target: {
        name: "nombre",
        value: "Sofía Ramírez",
      },
    });

    fireEvent.change(screen.getByPlaceholderText("correo@aebnl.mx"), {
      target: {
        name: "username",
        value: "sofia@test.com",
      },
    });

    fireEvent.change(screen.getByPlaceholderText("Mínimo 8 caracteres"), {
      target: {
        name: "password",
        value: "abc",
      },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Crear usuario" })
    );

    expect(
      screen.getByText("La contraseña no cumple los requisitos")
    ).toBeInTheDocument();
  });

  test("valida que las contraseñas coincidan", async () => {
    mockFetchUsuarios();

    render(<GestionUsuarios />);

    await screen.findByText("Juan Pérez");

    fireEvent.click(
      screen.getByRole("button", { name: /Nuevo usuario/i })
    );

    fireEvent.change(screen.getByPlaceholderText("Ej. Sofía Ramírez"), {
      target: {
        name: "nombre",
        value: "Sofía Ramírez",
      },
    });

    fireEvent.change(screen.getByPlaceholderText("correo@aebnl.mx"), {
      target: {
        name: "username",
        value: "sofia@test.com",
      },
    });

    fireEvent.change(screen.getByPlaceholderText("Mínimo 8 caracteres"), {
      target: {
        name: "password",
        value: "Password1!",
      },
    });

    fireEvent.change(screen.getByPlaceholderText("Repite la contraseña"), {
      target: {
        name: "confirmarPassword",
        value: "OtraPassword1!",
      },
    });

    expect(
      screen.getAllByText("Las contraseñas no coinciden").length
    ).toBeGreaterThan(0);

    fireEvent.click(
      screen.getByRole("button", { name: "Crear usuario" })
    );

    expect(
      screen.getAllByText("Las contraseñas no coinciden").length
    ).toBeGreaterThan(0);
  });

  test("crea usuario correctamente", async () => {
    globalThis.fetch
      .mockResolvedValueOnce({
        json: async () => ({
          ok: true,
          usuarios: usuariosMock,
        }),
      })
      .mockResolvedValueOnce({
        json: async () => ({
          ok: true,
        }),
      })
      .mockResolvedValueOnce({
        json: async () => ({
          ok: true,
          usuarios: usuariosMock,
        }),
      });

    render(<GestionUsuarios />);

    await screen.findByText("Juan Pérez");

    fireEvent.click(
      screen.getByRole("button", { name: /Nuevo usuario/i })
    );

    fireEvent.change(screen.getByPlaceholderText("Ej. Sofía Ramírez"), {
      target: {
        name: "nombre",
        value: "Sofía Ramírez",
      },
    });

    fireEvent.change(screen.getByPlaceholderText("correo@aebnl.mx"), {
      target: {
        name: "username",
        value: "sofia@test.com",
      },
    });

    fireEvent.change(screen.getByPlaceholderText("Mínimo 8 caracteres"), {
      target: {
        name: "password",
        value: "Password1!",
      },
    });

    fireEvent.change(screen.getByPlaceholderText("Repite la contraseña"), {
      target: {
        name: "confirmarPassword",
        value: "Password1!",
      },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Crear usuario" })
    );

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/gestion-usuarios",
        expect.objectContaining({
          method: "POST",
          headers: {
            Authorization: "Bearer token-prueba",
          },
        })
      );
    });

    const body = globalThis.fetch.mock.calls[1][1].body;

    expect(body).toBeInstanceOf(FormData);
    expect(body.get("nombre")).toBe("Sofía Ramírez");
    expect(body.get("username")).toBe("sofia@test.com");
    expect(body.get("password")).toBe("Password1!");
    expect(body.get("confirmarPassword")).toBe("Password1!");
    expect(body.get("tipoUsuario")).toBe("COORDINADOR");
  });

  test("abre modal de editar usuario", async () => {
    mockFetchUsuarios();

    render(<GestionUsuarios />);

    await screen.findByText("Juan Pérez");

    const botonesEditar = screen.getAllByRole("button", {
      name: /Editar/i,
    });

    fireEvent.click(botonesEditar[0]);

    expect(
      screen.getByRole("heading", { name: "Editar usuario" })
    ).toBeInTheDocument();

    expect(screen.getByDisplayValue("Juan Pérez")).toBeInTheDocument();
    expect(screen.getByDisplayValue("juan@test.com")).toBeInTheDocument();

    expect(
      screen.queryByPlaceholderText("Mínimo 8 caracteres")
    ).not.toBeInTheDocument();
  });

  test("edita usuario correctamente", async () => {
    globalThis.fetch
      .mockResolvedValueOnce({
        json: async () => ({
          ok: true,
          usuarios: usuariosMock,
        }),
      })
      .mockResolvedValueOnce({
        json: async () => ({
          ok: true,
          data: {
            nombre: "Juan Editado",
            foto: "foto-nueva.png",
          },
        }),
      })
      .mockResolvedValueOnce({
        json: async () => ({
          ok: true,
          usuarios: usuariosMock,
        }),
      });

    render(<GestionUsuarios />);

    await screen.findByText("Juan Pérez");

    fireEvent.click(
      screen.getAllByRole("button", { name: /Editar/i })[0]
    );

    const nombreInput = screen.getByDisplayValue("Juan Pérez");

    fireEvent.change(nombreInput, {
      target: {
        name: "nombre",
        value: "Juan Editado",
      },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Guardar cambios" })
    );

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/gestion-usuarios/1",
        expect.objectContaining({
          method: "PUT",
          headers: {
            Authorization: "Bearer token-prueba",
          },
        })
      );
    });

    const body = globalThis.fetch.mock.calls[1][1].body;

    expect(body.get("nombre")).toBe("Juan Editado");
    expect(body.get("username")).toBe("juan@test.com");
    expect(body.get("tipoUsuario")).toBe("COORDINADOR");

    expect(localStorage.setItem).toHaveBeenCalledWith(
      "usuario",
      JSON.stringify({
        id: 1,
        nombre: "Juan Editado",
        foto: "foto-nueva.png",
      })
    );
  });

  test("elimina usuario si confirma", async () => {
    globalThis.fetch
      .mockResolvedValueOnce({
        json: async () => ({
          ok: true,
          usuarios: usuariosMock,
        }),
      })
      .mockResolvedValueOnce({
        json: async () => ({
          ok: true,
        }),
      });

    globalThis.confirm.mockReturnValueOnce(true);

    render(<GestionUsuarios />);

    await screen.findByText("Juan Pérez");

    const botonesBorrar = screen.getAllByRole("button", {
      name: /Borrar/i,
    });

    fireEvent.click(botonesBorrar[0]);

    await waitFor(() => {
      expect(globalThis.confirm).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/gestion-usuarios/1",
        {
          method: "DELETE",
          headers: {
            Authorization: "Bearer token-prueba",
          },
        }
      );
    });
  });

  test("no elimina usuario si cancela confirmación", async () => {
    mockFetchUsuarios();

    globalThis.confirm.mockReturnValueOnce(false);

    render(<GestionUsuarios />);

    await screen.findByText("Juan Pérez");

    fireEvent.click(
      screen.getAllByRole("button", { name: /Borrar/i })[0]
    );

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  test("no muestra editar ni borrar para SUPERADMIN", async () => {
    mockFetchUsuarios();

    render(<GestionUsuarios />);

    await screen.findByText("Root User");

    const filaRoot = screen.getByText("Root User").closest("tr");

    expect(filaRoot).not.toHaveTextContent("Editar");
    expect(filaRoot).not.toHaveTextContent("Borrar");
  });
});