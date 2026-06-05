import { jest, describe, beforeEach, afterEach, test, expect } from "@jest/globals";

const mockListarUsuarios = jest.fn();
const mockObtenerUsuario = jest.fn();
const mockCrearUsuario = jest.fn();
const mockActualizarUsuario = jest.fn();
const mockEliminarUsuario = jest.fn();

jest.unstable_mockModule("multer", () => {
  const memoryStorage = jest.fn(() => "memory-storage");
  const single = jest.fn(() => "middleware-single-foto");
  const multerMock = jest.fn(() => ({ single }));

  multerMock.memoryStorage = memoryStorage;

  return {
    default: multerMock,
  };
});

jest.unstable_mockModule("../../modulos/gestionUsuarios/gestionUsuarios.service.js", () => ({
  listarUsuarios: mockListarUsuarios,
  obtenerUsuario: mockObtenerUsuario,
  crearUsuario: mockCrearUsuario,
  actualizarUsuario: mockActualizarUsuario,
  eliminarUsuario: mockEliminarUsuario,
}));

const {
  listar,
  obtener,
  crear,
  actualizar,
  eliminar,
  uploadFoto,
} = await import("../../modulos/gestionUsuarios/gestionUsuarios.controller.js");

function crearMockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("gestionUsuarios.controller.js", () => {
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test("uploadFoto debe existir", () => {
    expect(uploadFoto).toBe("middleware-single-foto");
  });

  describe("listar", () => {
    test("debe listar usuarios correctamente con query", async () => {
      const req = {
        query: {
          busqueda: "juan",
          pagina: "2",
          limite: "10",
        },
      };
      const res = crearMockRes();

      const data = {
        usuarios: [{ id: 1, nombre: "Juan" }],
        total: 1,
        pagina: 2,
        limite: 10,
      };

      mockListarUsuarios.mockResolvedValue(data);

      await listar(req, res);

      expect(mockListarUsuarios).toHaveBeenCalledWith({
        busqueda: "juan",
        pagina: 2,
        limite: 10,
      });

      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        ...data,
      });
    });

    test("debe listar usuarios con valores por defecto", async () => {
      const req = { query: {} };
      const res = crearMockRes();

      const data = {
        usuarios: [],
        total: 0,
        pagina: 1,
        limite: 20,
      };

      mockListarUsuarios.mockResolvedValue(data);

      await listar(req, res);

      expect(mockListarUsuarios).toHaveBeenCalledWith({
        busqueda: "",
        pagina: 1,
        limite: 20,
      });

      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        ...data,
      });
    });

    test("debe responder error con status personalizado", async () => {
      const req = { query: {} };
      const res = crearMockRes();

      mockListarUsuarios.mockRejectedValue({
        status: 400,
        message: "Parámetros inválidos",
      });

      await listar(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Parámetros inválidos",
      });
    });

    test("debe responder 500 si falla sin status", async () => {
      const req = { query: {} };
      const res = crearMockRes();

      mockListarUsuarios.mockRejectedValue(new Error("DB error"));

      await listar(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "DB error",
      });
    });
  });

  describe("obtener", () => {
    test("debe obtener usuario por id", async () => {
      const req = {
        params: { id: "5" },
      };
      const res = crearMockRes();

      const usuario = {
        id: 5,
        nombre: "Ana López",
      };

      mockObtenerUsuario.mockResolvedValue(usuario);

      await obtener(req, res);

      expect(mockObtenerUsuario).toHaveBeenCalledWith(5);
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        data: usuario,
      });
    });

    test("debe responder 404 si usuario no existe", async () => {
      const req = {
        params: { id: "99" },
      };
      const res = crearMockRes();

      mockObtenerUsuario.mockResolvedValue(null);

      await obtener(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Usuario no encontrado",
      });
    });

    test("debe responder error si obtenerUsuario falla", async () => {
      const req = {
        params: { id: "5" },
      };
      const res = crearMockRes();

      mockObtenerUsuario.mockRejectedValue({
        status: 500,
        message: "Error Oracle",
      });

      await obtener(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Error Oracle",
      });
    });
  });

  describe("crear", () => {
    test("debe crear usuario con foto", async () => {
      const buffer = Buffer.from("foto");

      const req = {
        body: {
          nombre: "Juan Pérez",
          username: "juan@test.com",
          password: "12345678",
          confirmarPassword: "12345678",
          tipoUsuario: "ADMINISTRADOR",
        },
        file: {
          buffer,
        },
      };
      const res = crearMockRes();

      const nuevo = {
        id: 1,
        nombre: "Juan Pérez",
      };

      mockCrearUsuario.mockResolvedValue(nuevo);

      await crear(req, res);

      expect(mockCrearUsuario).toHaveBeenCalledWith({
        ...req.body,
        foto: buffer,
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        data: nuevo,
      });
    });

    test("debe crear usuario sin foto", async () => {
      const req = {
        body: {
          nombre: "Ana López",
          username: "ana@test.com",
          password: "12345678",
          confirmarPassword: "12345678",
          tipoUsuario: "COORDINADOR",
        },
      };
      const res = crearMockRes();

      const nuevo = {
        id: 2,
        nombre: "Ana López",
      };

      mockCrearUsuario.mockResolvedValue(nuevo);

      await crear(req, res);

      expect(mockCrearUsuario).toHaveBeenCalledWith({
        ...req.body,
        foto: undefined,
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        data: nuevo,
      });
    });

    test("debe responder error si crearUsuario falla", async () => {
      const req = {
        body: {},
      };
      const res = crearMockRes();

      mockCrearUsuario.mockRejectedValue({
        status: 400,
        message: "El nombre es requerido",
      });

      await crear(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "El nombre es requerido",
      });
    });
  });

  describe("actualizar", () => {
    test("debe actualizar usuario con foto", async () => {
      const buffer = Buffer.from("foto");

      const req = {
        params: { id: "7" },
        body: {
          nombre: "Nuevo Nombre",
          username: "nuevo@test.com",
          tipoUsuario: "COORDINADOR",
        },
        file: {
          buffer,
        },
      };
      const res = crearMockRes();

      const actualizado = {
        id: 7,
        nombre: "Nuevo Nombre",
      };

      mockActualizarUsuario.mockResolvedValue(actualizado);

      await actualizar(req, res);

      expect(mockActualizarUsuario).toHaveBeenCalledWith(7, {
        ...req.body,
        foto: buffer,
      });

      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        data: actualizado,
      });
    });

    test("debe actualizar usuario sin foto", async () => {
      const req = {
        params: { id: "7" },
        body: {
          nombre: "Nuevo Nombre",
        },
      };
      const res = crearMockRes();

      const actualizado = {
        id: 7,
        nombre: "Nuevo Nombre",
      };

      mockActualizarUsuario.mockResolvedValue(actualizado);

      await actualizar(req, res);

      expect(mockActualizarUsuario).toHaveBeenCalledWith(7, {
        ...req.body,
        foto: undefined,
      });

      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        data: actualizado,
      });
    });

    test("debe responder error si actualizarUsuario falla", async () => {
      const req = {
        params: { id: "7" },
        body: {},
      };
      const res = crearMockRes();

      mockActualizarUsuario.mockRejectedValue({
        status: 404,
        message: "Usuario no encontrado",
      });

      await actualizar(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Usuario no encontrado",
      });
    });
  });

  describe("eliminar", () => {
    test("debe eliminar usuario correctamente", async () => {
      const req = {
        params: { id: "8" },
        usuario: { id: 1 },
      };
      const res = crearMockRes();

      mockEliminarUsuario.mockResolvedValue();

      await eliminar(req, res);

      expect(mockEliminarUsuario).toHaveBeenCalledWith(8, 1);
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        message: "Usuario eliminado correctamente",
      });
    });

    test("debe responder error si eliminarUsuario falla", async () => {
      const req = {
        params: { id: "8" },
        usuario: { id: 8 },
      };
      const res = crearMockRes();

      mockEliminarUsuario.mockRejectedValue({
        status: 400,
        message: "No puedes eliminar tu propia cuenta",
      });

      await eliminar(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "No puedes eliminar tu propia cuenta",
      });
    });
  });
});