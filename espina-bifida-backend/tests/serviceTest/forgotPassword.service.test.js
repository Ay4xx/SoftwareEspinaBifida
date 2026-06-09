import { jest, describe, beforeEach, test, expect } from "@jest/globals";

const mockExecute = jest.fn();
const mockCommit = jest.fn();
const mockRollback = jest.fn();
const mockClose = jest.fn();
const mockGetConnection = jest.fn();

const mockHash = jest.fn();
const mockRandomBytes = jest.fn();
const mockEnviarCorreoRecuperacion = jest.fn();

jest.unstable_mockModule("../../config/db.js", () => ({
  getConnection: mockGetConnection,
}));

jest.unstable_mockModule("oracledb", () => ({
  default: {
    OUT_FORMAT_OBJECT: "OUT_FORMAT_OBJECT",
  },
  OUT_FORMAT_OBJECT: "OUT_FORMAT_OBJECT",
}));

jest.unstable_mockModule("bcrypt", () => ({
  default: {
    hash: mockHash,
  },
  hash: mockHash,
}));

jest.unstable_mockModule("crypto", () => ({
  default: {
    randomBytes: mockRandomBytes,
  },
  randomBytes: mockRandomBytes,
}));

jest.unstable_mockModule("../../modulos/email/email.service.js", () => ({
  enviarCorreoRecuperacion: mockEnviarCorreoRecuperacion,
}));

const {
  solicitarRecuperacion,
  validarToken,
  cambiarPasswordConToken,
} = await import("../../modulos/password/forgotPassword.service.js");

function crearMockConnection() {
  return {
    execute: mockExecute,
    commit: mockCommit,
    rollback: mockRollback,
    close: mockClose,
  };
}

describe("forgotPassword.service.js", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    process.env.FRONTEND_URL = "http://localhost:3000";

    mockGetConnection.mockResolvedValue(crearMockConnection());

    mockRandomBytes.mockReturnValue({
      toString: jest.fn().mockReturnValue("token-falso-123"),
    });
  });

  test("solicitarRecuperacion crea token, hace commit y envía correo", async () => {
    mockExecute
      .mockResolvedValueOnce({
        rows: [
          {
            USUARIO_ID: 10,
            NOMBRE: "Ana",
            USERNAME: "ana@test.com",
          },
        ],
      })
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({});

    mockCommit.mockResolvedValue({});
    mockEnviarCorreoRecuperacion.mockResolvedValue({});

    const result = await solicitarRecuperacion(" ana@test.com ");

    expect(mockGetConnection).toHaveBeenCalledTimes(1);

    expect(mockExecute).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("FROM USUARIO"),
      { username: "ana@test.com" },
      { outFormat: "OUT_FORMAT_OBJECT" }
    );

    expect(mockRandomBytes).toHaveBeenCalledWith(32);

    expect(mockExecute).toHaveBeenNthCalledWith(
      2,
      "DELETE FROM PASSWORD_RESET_TOKEN WHERE USUARIO_ID = :id",
      { id: 10 }
    );

    expect(mockExecute).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining("INSERT INTO PASSWORD_RESET_TOKEN"),
      expect.objectContaining({
        id: 10,
        token: "token-falso-123",
        expira: expect.any(Date),
      })
    );

    expect(mockCommit).toHaveBeenCalledTimes(1);

    expect(mockEnviarCorreoRecuperacion).toHaveBeenCalledWith({
      nombre: "Ana",
      correo: "ana@test.com",
      link: "http://localhost:3000/reset-password?token=token-falso-123",
    });

    expect(result).toBe(true);
    expect(mockRollback).not.toHaveBeenCalled();
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("solicitarRecuperacion usa USERNAME como nombre si NOMBRE viene vacío", async () => {
    mockExecute
      .mockResolvedValueOnce({
        rows: [
          {
            USUARIO_ID: 20,
            NOMBRE: null,
            USERNAME: "usuario@test.com",
          },
        ],
      })
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({});

    mockCommit.mockResolvedValue({});
    mockEnviarCorreoRecuperacion.mockResolvedValue({});

    const result = await solicitarRecuperacion("usuario@test.com");

    expect(mockEnviarCorreoRecuperacion).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre: "usuario@test.com",
        correo: "usuario@test.com",
        link: "http://localhost:3000/reset-password?token=token-falso-123",
      })
    );

    expect(result).toBe(true);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("solicitarRecuperacion hace rollback, cierra conexión y lanza error si falla", async () => {
    mockExecute.mockRejectedValueOnce(new Error("Error Oracle"));
    mockRollback.mockResolvedValue({});

    await expect(solicitarRecuperacion("ana@test.com")).rejects.toThrow(
      "Error Oracle"
    );

    expect(mockRollback).toHaveBeenCalledTimes(1);
    expect(mockCommit).not.toHaveBeenCalled();
    expect(mockEnviarCorreoRecuperacion).not.toHaveBeenCalled();
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("solicitarRecuperacion lanza error si no encuentra usuario", async () => {
    mockExecute.mockResolvedValueOnce({
      rows: [],
    });

    mockRollback.mockResolvedValue({});

    await expect(solicitarRecuperacion("noexiste@test.com")).rejects.toThrow();

    expect(mockRollback).toHaveBeenCalledTimes(1);
    expect(mockCommit).not.toHaveBeenCalled();
    expect(mockEnviarCorreoRecuperacion).not.toHaveBeenCalled();
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("validarToken retorna token si existe y no está expirado", async () => {
    const tokenRow = {
      TOKEN_ID: 1,
      USUARIO_ID: 10,
    };

    mockExecute.mockResolvedValue({
      rows: [tokenRow],
    });

    const result = await validarToken("token-valido");

    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("FROM PASSWORD_RESET_TOKEN"),
      { token: "token-valido" },
      { outFormat: "OUT_FORMAT_OBJECT" }
    );

    expect(result).toEqual(tokenRow);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("validarToken retorna null si no existe token válido", async () => {
    mockExecute.mockResolvedValue({
      rows: [],
    });

    const result = await validarToken("token-invalido");

    expect(result).toBeNull();
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("validarToken retorna null si result.rows no existe", async () => {
    mockExecute.mockResolvedValue({});

    const result = await validarToken("token-invalido");

    expect(result).toBeNull();
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("validarToken cierra conexión y lanza error si falla la consulta", async () => {
    mockExecute.mockRejectedValue(new Error("Error validar token"));

    await expect(validarToken("token")).rejects.toThrow("Error validar token");

    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("cambiarPasswordConToken cambia contraseña, marca token usado y hace commit", async () => {
    mockExecute
      .mockResolvedValueOnce({
        rows: [
          {
            TOKEN_ID: 99,
            USUARIO_ID: 10,
          },
        ],
      })
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({});

    mockHash.mockResolvedValue("password-hasheada");
    mockCommit.mockResolvedValue({});

    const result = await cambiarPasswordConToken("token-valido", "NuevaPassword123");

    expect(mockExecute).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("FROM PASSWORD_RESET_TOKEN"),
      { token: "token-valido" },
      { outFormat: "OUT_FORMAT_OBJECT" }
    );

    expect(mockHash).toHaveBeenCalledWith("NuevaPassword123", 10);

    expect(mockExecute).toHaveBeenNthCalledWith(
      2,
      "UPDATE USUARIO SET PASSWORD = :hash WHERE USUARIO_ID = :id",
      {
        hash: "password-hasheada",
        id: 10,
      }
    );

    expect(mockExecute).toHaveBeenNthCalledWith(
      3,
      "UPDATE PASSWORD_RESET_TOKEN SET USADO = 1 WHERE TOKEN_ID = :tokenId",
      {
        tokenId: 99,
      }
    );

    expect(mockCommit).toHaveBeenCalledTimes(1);
    expect(mockRollback).not.toHaveBeenCalled();
    expect(result).toBe(true);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("cambiarPasswordConToken retorna false si token no existe", async () => {
    mockExecute.mockResolvedValueOnce({
      rows: [],
    });

    const result = await cambiarPasswordConToken("token-invalido", "NuevaPassword123");

    expect(result).toBe(false);
    expect(mockHash).not.toHaveBeenCalled();
    expect(mockCommit).not.toHaveBeenCalled();
    expect(mockRollback).not.toHaveBeenCalled();
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("cambiarPasswordConToken retorna false si result.rows no existe", async () => {
    mockExecute.mockResolvedValueOnce({});

    const result = await cambiarPasswordConToken("token-invalido", "NuevaPassword123");

    expect(result).toBe(false);
    expect(mockHash).not.toHaveBeenCalled();
    expect(mockCommit).not.toHaveBeenCalled();
    expect(mockRollback).not.toHaveBeenCalled();
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("cambiarPasswordConToken hace rollback, cierra conexión y lanza error si falla bcrypt.hash", async () => {
    mockExecute.mockResolvedValueOnce({
      rows: [
        {
          TOKEN_ID: 99,
          USUARIO_ID: 10,
        },
      ],
    });

    mockHash.mockRejectedValue(new Error("Error bcrypt"));
    mockRollback.mockResolvedValue({});

    await expect(
      cambiarPasswordConToken("token-valido", "NuevaPassword123")
    ).rejects.toThrow("Error bcrypt");

    expect(mockRollback).toHaveBeenCalledTimes(1);
    expect(mockCommit).not.toHaveBeenCalled();
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("cambiarPasswordConToken hace rollback, cierra conexión y lanza error si falla update", async () => {
    mockExecute
      .mockResolvedValueOnce({
        rows: [
          {
            TOKEN_ID: 99,
            USUARIO_ID: 10,
          },
        ],
      })
      .mockRejectedValueOnce(new Error("Error update"));

    mockHash.mockResolvedValue("password-hasheada");
    mockRollback.mockResolvedValue({});

    await expect(
      cambiarPasswordConToken("token-valido", "NuevaPassword123")
    ).rejects.toThrow("Error update");

    expect(mockRollback).toHaveBeenCalledTimes(1);
    expect(mockCommit).not.toHaveBeenCalled();
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("cambiarPasswordConToken hace rollback si falla commit", async () => {
    mockExecute
      .mockResolvedValueOnce({
        rows: [
          {
            TOKEN_ID: 99,
            USUARIO_ID: 10,
          },
        ],
      })
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({});

    mockHash.mockResolvedValue("password-hasheada");
    mockCommit.mockRejectedValue(new Error("Error commit"));
    mockRollback.mockResolvedValue({});

    await expect(
      cambiarPasswordConToken("token-valido", "NuevaPassword123")
    ).rejects.toThrow("Error commit");

    expect(mockRollback).toHaveBeenCalledTimes(1);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });
});