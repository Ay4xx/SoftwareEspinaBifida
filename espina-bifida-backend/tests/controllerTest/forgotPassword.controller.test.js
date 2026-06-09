import { jest } from "@jest/globals";

const solicitarRecuperacion = jest.fn();
const validarToken = jest.fn();
const cambiarPasswordConToken = jest.fn();

jest.unstable_mockModule("../../modulos/password/forgotPassword.service.js", () => ({
  solicitarRecuperacion,
  validarToken,
  cambiarPasswordConToken,
}));

const { requestReset, validateToken, resetPassword } = await import(
  "../../modulos/password/forgotPassword.controller.js"
);

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("forgotPassword.controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  describe("requestReset", () => {
    test("responde 400 si falta el correo", async () => {
      const req = { body: {} };
      const res = mockResponse();

      await requestReset(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ ok: false, message: "El correo es obligatorio" });
      expect(solicitarRecuperacion).not.toHaveBeenCalled();
    });

    test("solicita recuperación y responde mensaje genérico", async () => {
      solicitarRecuperacion.mockResolvedValue(true);
      const req = { body: { email: "paciente@email.com" } };
      const res = mockResponse();

      await requestReset(req, res);

      expect(solicitarRecuperacion).toHaveBeenCalledWith("paciente@email.com");
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        message: "Si el correo está registrado, recibirás un enlace en breve",
      });
    });

    test("responde 500 si ocurre error", async () => {
      solicitarRecuperacion.mockRejectedValue(new Error("DB error"));
      const req = { body: { email: "paciente@email.com" } };
      const res = mockResponse();

      await requestReset(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ ok: false, message: "Error interno del servidor" });
    });
  });

  describe("validateToken", () => {
    test("responde 400 si falta token", async () => {
      const req = { query: {} };
      const res = mockResponse();

      await validateToken(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ ok: false, message: "Token requerido" });
    });

    test("responde 400 si token es inválido", async () => {
      validarToken.mockResolvedValue(null);
      const req = { query: { token: "abc" } };
      const res = mockResponse();

      await validateToken(req, res);

      expect(validarToken).toHaveBeenCalledWith("abc");
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ ok: false, message: "El enlace es inválido o ya expiró" });
    });

    test("responde ok si token es válido", async () => {
      validarToken.mockResolvedValue({ RESET_ID: 1 });
      const req = { query: { token: "abc" } };
      const res = mockResponse();

      await validateToken(req, res);

      expect(res.json).toHaveBeenCalledWith({ ok: true });
    });
  });

  describe("resetPassword", () => {
    test("responde 400 si faltan datos", async () => {
      const req = { body: { token: "abc" } };
      const res = mockResponse();

      await resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ ok: false, message: "Faltan datos" });
    });

    test("responde 400 si contraseña tiene menos de 8 caracteres", async () => {
      const req = { body: { token: "abc", newPassword: "123" } };
      const res = mockResponse();

      await resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ ok: false, message: "La contraseña debe tener al menos 8 caracteres" });
    });

    test("responde 400 si token expiró", async () => {
      cambiarPasswordConToken.mockResolvedValue(false);
      const req = { body: { token: "abc", newPassword: "Password123" } };
      const res = mockResponse();

      await resetPassword(req, res);

      expect(cambiarPasswordConToken).toHaveBeenCalledWith("abc", "Password123");
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ ok: false, message: "El enlace es inválido o ya expiró" });
    });

    test("actualiza contraseña correctamente", async () => {
      cambiarPasswordConToken.mockResolvedValue(true);
      const req = { body: { token: "abc", newPassword: "Password123" } };
      const res = mockResponse();

      await resetPassword(req, res);

      expect(res.json).toHaveBeenCalledWith({ ok: true, message: "Contraseña actualizada correctamente" });
    });
  });
});
