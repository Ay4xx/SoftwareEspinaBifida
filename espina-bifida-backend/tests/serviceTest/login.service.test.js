import { jest, describe, beforeEach, test, expect } from "@jest/globals";

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

const { iniciarSesionPaciente } = await import(
  "../../modulos/login/login.service.js"
);

function crearMockConnection() {
  return {
    execute: mockExecute,
    close: mockClose,
  };
}

describe("login.service.js", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetConnection.mockResolvedValue(crearMockConnection());
  });

  test("iniciarSesionPaciente retorna usuario mapeado si las credenciales son correctas", async () => {
    const fotoBuffer = Buffer.from("foto-test");

    const usuarioDB = {
      USUARIO_ID: 1,
      USERNAME: "ana",
      PASSWORD: "hash-password",
      TIPO_USUARIO: "paciente",
      NOMBRE: "Ana López",
      FOTO: fotoBuffer,
    };

    const usuarioMapeado = {
      id: 1,
      username: "ana",
      nombre: "Ana López",
      tipoUsuario: "paciente",
      foto: "data:image/jpeg;base64,Zm90by10ZXN0",
    };

    mockExecute.mockResolvedValue({
      rows: [usuarioDB],
    });

    mockCompare.mockResolvedValue(true);
    mockMapPacienteLogin.mockReturnValue(usuarioMapeado);

    const result = await iniciarSesionPaciente(" ana ", "123456");

    expect(mockGetConnection).toHaveBeenCalledTimes(1);

    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("FROM USUARIO"),
      { username: "ana" },
      {
        outFormat: "OUT_FORMAT_OBJECT",
        fetchInfo: {
          FOTO: {
            type: "BUFFER",
          },
        },
      }
    );

    expect(mockCompare).toHaveBeenCalledWith("123456", "hash-password");

    expect(mockMapPacienteLogin).toHaveBeenCalledWith(
      expect.objectContaining({
        USUARIO_ID: 1,
        USERNAME: "ana",
        PASSWORD: "hash-password",
        TIPO_USUARIO: "paciente",
        NOMBRE: "Ana López",
        FOTO: "data:image/jpeg;base64,Zm90by10ZXN0",
      })
    );

    expect(result).toEqual(usuarioMapeado);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("iniciarSesionPaciente retorna null si no encuentra usuario", async () => {
    mockExecute.mockResolvedValue({
      rows: [],
    });

    const result = await iniciarSesionPaciente("noexiste", "123456");

    expect(result).toBeNull();
    expect(mockCompare).not.toHaveBeenCalled();
    expect(mockMapPacienteLogin).not.toHaveBeenCalled();
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("iniciarSesionPaciente retorna null si result.rows no existe", async () => {
    mockExecute.mockResolvedValue({});

    const result = await iniciarSesionPaciente("ana", "123456");

    expect(result).toBeNull();
    expect(mockCompare).not.toHaveBeenCalled();
    expect(mockMapPacienteLogin).not.toHaveBeenCalled();
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("iniciarSesionPaciente retorna null si PASSWORD no existe", async () => {
    mockExecute.mockResolvedValue({
      rows: [
        {
          USUARIO_ID: 1,
          USERNAME: "ana",
          PASSWORD: null,
          TIPO_USUARIO: "paciente",
          NOMBRE: "Ana López",
          FOTO: null,
        },
      ],
    });

    const result = await iniciarSesionPaciente("ana", "123456");

    expect(result).toBeNull();
    expect(mockCompare).not.toHaveBeenCalled();
    expect(mockMapPacienteLogin).not.toHaveBeenCalled();
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("iniciarSesionPaciente retorna null si PASSWORD no es string", async () => {
    mockExecute.mockResolvedValue({
      rows: [
        {
          USUARIO_ID: 1,
          USERNAME: "ana",
          PASSWORD: 12345,
          TIPO_USUARIO: "paciente",
          NOMBRE: "Ana López",
          FOTO: null,
        },
      ],
    });

    const result = await iniciarSesionPaciente("ana", "123456");

    expect(result).toBeNull();
    expect(mockCompare).not.toHaveBeenCalled();
    expect(mockMapPacienteLogin).not.toHaveBeenCalled();
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("iniciarSesionPaciente retorna null si la contraseña es incorrecta", async () => {
    mockExecute.mockResolvedValue({
      rows: [
        {
          USUARIO_ID: 1,
          USERNAME: "ana",
          PASSWORD: "hash-password",
          TIPO_USUARIO: "paciente",
          NOMBRE: "Ana López",
          FOTO: null,
        },
      ],
    });

    mockCompare.mockResolvedValue(false);

    const result = await iniciarSesionPaciente("ana", "wrong-password");

    expect(mockCompare).toHaveBeenCalledWith("wrong-password", "hash-password");
    expect(result).toBeNull();
    expect(mockMapPacienteLogin).not.toHaveBeenCalled();
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("iniciarSesionPaciente funciona aunque FOTO venga null", async () => {
    const usuarioDB = {
      USUARIO_ID: 2,
      USERNAME: "juan",
      PASSWORD: "hash-password",
      TIPO_USUARIO: "paciente",
      NOMBRE: "Juan Pérez",
      FOTO: null,
    };

    const usuarioMapeado = {
      id: 2,
      username: "juan",
      nombre: "Juan Pérez",
      tipoUsuario: "paciente",
      foto: null,
    };

    mockExecute.mockResolvedValue({
      rows: [usuarioDB],
    });

    mockCompare.mockResolvedValue(true);
    mockMapPacienteLogin.mockReturnValue(usuarioMapeado);

    const result = await iniciarSesionPaciente("juan", "123456");

    expect(mockMapPacienteLogin).toHaveBeenCalledWith(
      expect.objectContaining({
        FOTO: null,
      })
    );

    expect(result).toEqual(usuarioMapeado);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("iniciarSesionPaciente cierra conexión y lanza error si falla la consulta", async () => {
    mockExecute.mockRejectedValue(new Error("Error Oracle"));

    await expect(iniciarSesionPaciente("ana", "123456")).rejects.toThrow(
      "Error Oracle"
    );

    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("iniciarSesionPaciente cierra conexión y lanza error si falla bcrypt.compare", async () => {
    mockExecute.mockResolvedValue({
      rows: [
        {
          USUARIO_ID: 1,
          USERNAME: "ana",
          PASSWORD: "hash-password",
          TIPO_USUARIO: "paciente",
          NOMBRE: "Ana López",
          FOTO: null,
        },
      ],
    });

    mockCompare.mockRejectedValue(new Error("Error bcrypt"));

    await expect(iniciarSesionPaciente("ana", "123456")).rejects.toThrow(
      "Error bcrypt"
    );

    expect(mockClose).toHaveBeenCalledTimes(1);
  });
});