import { jest, describe, beforeEach, afterEach, test, expect } from "@jest/globals";

const mockExecute = jest.fn();
const mockClose = jest.fn();
const mockGetConnection = jest.fn();

const mockCompare = jest.fn();
const mockMapPacienteLogin = jest.fn();

jest.unstable_mockModule("../../config/db.js", () => ({
  getConnection: mockGetConnection,
}));

jest.unstable_mockModule("oracledb", () => ({
  default: {
    OUT_FORMAT_OBJECT: "OUT_FORMAT_OBJECT",
    BUFFER: "BUFFER",
  },
  OUT_FORMAT_OBJECT: "OUT_FORMAT_OBJECT",
  BUFFER: "BUFFER",
}));

jest.unstable_mockModule("bcrypt", () => ({
  default: {
    compare: mockCompare,
  },
  compare: mockCompare,
}));

jest.unstable_mockModule("../../modulos/login/login.mapper.js", () => ({
  mapPacienteLogin: mockMapPacienteLogin,
}));

const { iniciarSesionPaciente } = await import("../../modulos/login/login.service.js");

function crearMockConnection() {
  return {
    execute: mockExecute,
    close: mockClose,
  };
}

describe("login.service.js", () => {
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();

    mockGetConnection.mockResolvedValue(crearMockConnection());

    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test("debe iniciar sesión correctamente sin foto", async () => {
    const usuarioDB = {
      USUARIO_ID: 1,
      USERNAME: "paciente1",
      PASSWORD: "$2b$10$hash",
      TIPO_USUARIO: "paciente",
      NOMBRE: "Juan Pérez",
      FOTO: null,
    };

    const usuarioMapeado = {
      id: 1,
      username: "paciente1",
      tipoUsuario: "paciente",
      nombre: "Juan Pérez",
      foto: null,
    };

    mockExecute.mockResolvedValue({
      rows: [usuarioDB],
    });

    mockCompare.mockResolvedValue(true);
    mockMapPacienteLogin.mockReturnValue(usuarioMapeado);

    const result = await iniciarSesionPaciente(" paciente1 ", "123456");

    expect(mockGetConnection).toHaveBeenCalled();

    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("FROM USUARIO u"),
      { username: "paciente1" },
      {
        outFormat: "OUT_FORMAT_OBJECT",
        fetchInfo: {
          FOTO: {
            type: "BUFFER",
          },
        },
      }
    );

    expect(mockCompare).toHaveBeenCalledWith("123456", "$2b$10$hash");
    expect(mockMapPacienteLogin).toHaveBeenCalledWith(usuarioDB);
    expect(result).toEqual(usuarioMapeado);
    expect(mockClose).toHaveBeenCalled();
  });

  test("debe iniciar sesión correctamente con foto y convertirla a base64", async () => {
    const bufferFoto = Buffer.from("foto-test");

    const usuarioDB = {
      USUARIO_ID: 2,
      USERNAME: "paciente2",
      PASSWORD: "$2b$10$hash",
      TIPO_USUARIO: "paciente",
      NOMBRE: "Ana López",
      FOTO: bufferFoto,
    };

    const usuarioMapeado = {
      id: 2,
      username: "paciente2",
      tipoUsuario: "paciente",
      nombre: "Ana López",
      foto: `data:image/jpeg;base64,${bufferFoto.toString("base64")}`,
    };

    mockExecute.mockResolvedValue({
      rows: [usuarioDB],
    });

    mockCompare.mockResolvedValue(true);
    mockMapPacienteLogin.mockImplementation((usuario) => ({
      id: usuario.USUARIO_ID,
      username: usuario.USERNAME,
      tipoUsuario: usuario.TIPO_USUARIO,
      nombre: usuario.NOMBRE,
      foto: usuario.FOTO,
    }));

    const result = await iniciarSesionPaciente("paciente2", "123456");

    expect(mockCompare).toHaveBeenCalledWith("123456", "$2b$10$hash");

    expect(mockMapPacienteLogin).toHaveBeenCalledWith({
      ...usuarioDB,
      FOTO: `data:image/jpeg;base64,${bufferFoto.toString("base64")}`,
    });

    expect(result).toEqual(usuarioMapeado);
    expect(mockClose).toHaveBeenCalled();
  });

  test("debe regresar null si no encuentra usuario", async () => {
    mockExecute.mockResolvedValue({
      rows: [],
    });

    const result = await iniciarSesionPaciente("noexiste", "123456");

    expect(result).toBeNull();
    expect(mockCompare).not.toHaveBeenCalled();
    expect(mockMapPacienteLogin).not.toHaveBeenCalled();
    expect(mockClose).toHaveBeenCalled();
  });

  test("debe regresar null si result.rows no existe", async () => {
    mockExecute.mockResolvedValue({});

    const result = await iniciarSesionPaciente("usuario", "123456");

    expect(result).toBeNull();
    expect(mockCompare).not.toHaveBeenCalled();
    expect(mockClose).toHaveBeenCalled();
  });

  test("debe regresar null si PASSWORD no existe", async () => {
    mockExecute.mockResolvedValue({
      rows: [
        {
          USUARIO_ID: 3,
          USERNAME: "paciente3",
          PASSWORD: null,
          TIPO_USUARIO: "paciente",
          NOMBRE: "Paciente Sin Password",
          FOTO: null,
        },
      ],
    });

    const result = await iniciarSesionPaciente("paciente3", "123456");

    expect(result).toBeNull();
    expect(mockCompare).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "PASSWORD inválido para usuario:",
      3
    );
    expect(mockClose).toHaveBeenCalled();
  });

  test("debe regresar null si PASSWORD no es string", async () => {
    mockExecute.mockResolvedValue({
      rows: [
        {
          USUARIO_ID: 4,
          USERNAME: "paciente4",
          PASSWORD: 12345,
          TIPO_USUARIO: "paciente",
          NOMBRE: "Paciente Password Inválido",
          FOTO: null,
        },
      ],
    });

    const result = await iniciarSesionPaciente("paciente4", "123456");

    expect(result).toBeNull();
    expect(mockCompare).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "PASSWORD inválido para usuario:",
      4
    );
    expect(mockClose).toHaveBeenCalled();
  });

  test("debe regresar null si contraseña es incorrecta", async () => {
    mockExecute.mockResolvedValue({
      rows: [
        {
          USUARIO_ID: 5,
          USERNAME: "paciente5",
          PASSWORD: "$2b$10$hash",
          TIPO_USUARIO: "paciente",
          NOMBRE: "Paciente",
          FOTO: null,
        },
      ],
    });

    mockCompare.mockResolvedValue(false);

    const result = await iniciarSesionPaciente("paciente5", "incorrecta");

    expect(result).toBeNull();
    expect(mockCompare).toHaveBeenCalledWith("incorrecta", "$2b$10$hash");
    expect(mockMapPacienteLogin).not.toHaveBeenCalled();
    expect(mockClose).toHaveBeenCalled();
  });

  test("debe convertir username y password a string", async () => {
    mockExecute.mockResolvedValue({
      rows: [
        {
          USUARIO_ID: 6,
          USERNAME: "123",
          PASSWORD: "$2b$10$hash",
          TIPO_USUARIO: "paciente",
          NOMBRE: "Usuario Numérico",
          FOTO: null,
        },
      ],
    });

    mockCompare.mockResolvedValue(true);
    mockMapPacienteLogin.mockReturnValue({
      id: 6,
      username: "123",
      tipoUsuario: "paciente",
      nombre: "Usuario Numérico",
      foto: null,
    });

    const result = await iniciarSesionPaciente(123, 456);

    expect(mockExecute).toHaveBeenCalledWith(
      expect.any(String),
      { username: "123" },
      expect.any(Object)
    );

    expect(mockCompare).toHaveBeenCalledWith("456", "$2b$10$hash");
    expect(result).toEqual({
      id: 6,
      username: "123",
      tipoUsuario: "paciente",
      nombre: "Usuario Numérico",
      foto: null,
    });
  });

  test("debe cerrar conexión y lanzar error si falla Oracle", async () => {
    mockExecute.mockRejectedValue(new Error("Error Oracle"));

    await expect(iniciarSesionPaciente("paciente1", "123456")).rejects.toThrow(
      "Error Oracle"
    );

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error en iniciarSesionPaciente:",
      expect.any(Error)
    );
    expect(mockClose).toHaveBeenCalled();
  });

  test("debe lanzar error si falla bcrypt.compare", async () => {
    mockExecute.mockResolvedValue({
      rows: [
        {
          USUARIO_ID: 7,
          USERNAME: "paciente7",
          PASSWORD: "$2b$10$hash",
          TIPO_USUARIO: "paciente",
          NOMBRE: "Paciente 7",
          FOTO: null,
        },
      ],
    });

    mockCompare.mockRejectedValue(new Error("Error bcrypt"));

    await expect(iniciarSesionPaciente("paciente7", "123456")).rejects.toThrow(
      "Error bcrypt"
    );

    expect(mockClose).toHaveBeenCalled();
  });
});