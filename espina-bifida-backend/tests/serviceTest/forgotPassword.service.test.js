import { jest } from "@jest/globals";

const executeMock = jest.fn();
const commitMock = jest.fn();
const rollbackMock = jest.fn();
const closeMock = jest.fn();
const getConnection = jest.fn();
const hashMock = jest.fn();
const enviarCorreoRecuperacion = jest.fn();

jest.unstable_mockModule("../../config/db.js", () => ({
  getConnection,
  oracledb: { OUT_FORMAT_OBJECT: 4002 },
}));

jest.unstable_mockModule("bcrypt", () => ({
  default: { hash: hashMock },
}));

jest.unstable_mockModule("../../modulos/email/email.service.js", () => ({
  enviarCorreoRecuperacion,
}));

const { solicitarRecuperacion, validarToken, cambiarPasswordConToken } = await import(
  "../../modulos/password/forgotPassword.service.js"
);

const makeConnection = () => ({
  execute: executeMock,
  commit: commitMock,
  rollback: rollbackMock,
  close: closeMock,
});

describe("forgotPassword.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.FRONTEND_URL = "http://localhost:3000";
    getConnection.mockResolvedValue(makeConnection());
  });

  describe("solicitarRecuperacion", () => {
    test("crea token, guarda registro y envía correo de recuperación", async () => {
      executeMock
        .mockResolvedValueOnce({ rows: [{ USUARIO_ID: 10, USERNAME: "paciente@email.com", NOMBRE: "Ana" }] })
        .mockResolvedValueOnce({ rowsAffected: 1 })
        .mockResolvedValueOnce({ rowsAffected: 1 });

      const result = await solicitarRecuperacion("paciente@email.com");

      expect(result).toBe(true);
      expect(executeMock).toHaveBeenCalledTimes(3);
      expect(commitMock).toHaveBeenCalledTimes(1);
      expect(enviarCorreoRecuperacion).toHaveBeenCalledWith(
        expect.objectContaining({
          nombre: "Ana",
          correo: "paciente@email.com",
          link: expect.stringContaining("http://localhost:3000/reset-password?token="),
        })
      );
      expect(closeMock).toHaveBeenCalledTimes(1);
    });

    test("cierra conexión si ocurre error", async () => {
      executeMock.mockRejectedValueOnce(new Error("DB error"));

      await expect(solicitarRecuperacion("paciente@email.com")).rejects.toThrow("DB error");
      expect(closeMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("validarToken", () => {
    test("devuelve null si no encuentra token", async () => {
      executeMock.mockResolvedValueOnce({ rows: [] });

      const result = await validarToken("token-invalido");

      expect(result).toBeNull();
      expect(closeMock).toHaveBeenCalledTimes(1);
    });

    test("devuelve el registro si el token existe", async () => {
      const tokenRow = { RESET_ID: 1, USUARIO_ID: 10 };
      executeMock.mockResolvedValueOnce({ rows: [tokenRow] });

      const result = await validarToken("token-valido");

      expect(result).toEqual(tokenRow);
      expect(closeMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("cambiarPasswordConToken", () => {
    test("devuelve false si no existe token", async () => {
      executeMock.mockResolvedValueOnce({ rows: [] });

      const result = await cambiarPasswordConToken("token-invalido", "Password123");

      expect(result).toBe(false);
      expect(hashMock).not.toHaveBeenCalled();
      expect(closeMock).toHaveBeenCalledTimes(1);
    });

    test("actualiza contraseña, marca token usado y hace commit", async () => {
      executeMock
        .mockResolvedValueOnce({ rows: [{ RESET_ID: 1, USUARIO_ID: 10 }] })
        .mockResolvedValueOnce({ rowsAffected: 1 })
        .mockResolvedValueOnce({ rowsAffected: 1 });
      hashMock.mockResolvedValueOnce("hashed-password");

      const result = await cambiarPasswordConToken("token-valido", "Password123");

      expect(result).toBe(true);
      expect(hashMock).toHaveBeenCalledWith("Password123", 10);
      expect(executeMock).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("UPDATE USUARIO"),
        { password: "hashed-password", usuarioId: 10 }
      );
      expect(executeMock).toHaveBeenNthCalledWith(
        3,
        expect.stringContaining("UPDATE PASSWORD_RESET_TOKEN"),
        { resetId: 1 }
      );
      expect(commitMock).toHaveBeenCalledTimes(1);
      expect(closeMock).toHaveBeenCalledTimes(1);
    });

    test("hace rollback cuando ocurre error al actualizar", async () => {
      executeMock
        .mockResolvedValueOnce({ rows: [{ RESET_ID: 1, USUARIO_ID: 10 }] })
        .mockRejectedValueOnce(new Error("Update error"));
      hashMock.mockResolvedValueOnce("hashed-password");

      await expect(cambiarPasswordConToken("token-valido", "Password123")).rejects.toThrow("Update error");

      expect(rollbackMock).toHaveBeenCalledTimes(1);
      expect(closeMock).toHaveBeenCalledTimes(1);
    });
  });
});
