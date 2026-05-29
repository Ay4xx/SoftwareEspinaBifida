import { jest, describe, beforeEach, afterEach, test, expect } from "@jest/globals";

const mockIniciarSesionPaciente = jest.fn();

jest.unstable_mockModule("../../modulos/login/login.service.js", () => ({
  iniciarSesionPaciente: mockIniciarSesionPaciente,
}));

const { loginPaciente } = await import("../../modulos/login/login.controller.js");

function crearMockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("login.controller.js", () => {
  let consoleSpy;
  let dateNowSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    dateNowSpy = jest.spyOn(Date, "now").mockReturnValue(1717000000000);
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    dateNowSpy.mockRestore();
  });

  test("debe iniciar sesión correctamente y regresar token", async () => {
    const req = {
      body: {
        username: "paciente1",
        password: "123456",
      },
    };
    const res = crearMockRes();

    const data = {
      id: 10,
      username: "paciente1",
      tipoUsuario: "paciente",
      nombre: "Juan Pérez",
      foto: null,
    };

    mockIniciarSesionPaciente.mockResolvedValue(data);

    await loginPaciente(req, res);

    expect(mockIniciarSesionPaciente).toHaveBeenCalledWith("paciente1", "123456");
    expect(res.json).toHaveBeenCalledWith({
      ok: true,
      token: "token-10-paciente-1717000000000",
      data,
    });
  });

  test("debe responder 400 si falta username", async () => {
    const req = {
      body: {
        password: "123456",
      },
    };
    const res = crearMockRes();

    await loginPaciente(req, res);

    expect(mockIniciarSesionPaciente).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      message: "Username y contraseña son obligatorios",
    });
  });

  test("debe responder 400 si falta password", async () => {
    const req = {
      body: {
        username: "paciente1",
      },
    };
    const res = crearMockRes();

    await loginPaciente(req, res);

    expect(mockIniciarSesionPaciente).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      message: "Username y contraseña son obligatorios",
    });
  });

  test("debe responder 401 si las credenciales son incorrectas", async () => {
    const req = {
      body: {
        username: "paciente1",
        password: "incorrecta",
      },
    };
    const res = crearMockRes();

    mockIniciarSesionPaciente.mockResolvedValue(null);

    await loginPaciente(req, res);

    expect(mockIniciarSesionPaciente).toHaveBeenCalledWith("paciente1", "incorrecta");
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      message: "Credenciales incorrectas",
    });
  });

  test("debe responder 500 si ocurre un error en el service", async () => {
    const req = {
      body: {
        username: "paciente1",
        password: "123456",
      },
    };
    const res = crearMockRes();

    mockIniciarSesionPaciente.mockRejectedValue(new Error("DB error"));

    await loginPaciente(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      message: "Error al iniciar sesión",
    });
  });
});