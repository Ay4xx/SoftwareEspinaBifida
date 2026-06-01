import { jest, describe, beforeEach, afterEach, test, expect } from "@jest/globals";

const mockActivarMembresia = jest.fn();
const mockDesactivarMembresia = jest.fn();

jest.unstable_mockModule("../../modulos/membresia/membresia.service.js", () => ({
  activarMembresia: mockActivarMembresia,
  desactivarMembresia: mockDesactivarMembresia,
}));

const {
  activarMembresiaController,
  desactivarMembresiaController,
} = await import("../../modulos/membresia/membresia.controller.js");

function crearMockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("membresia.controller.js", () => {
  let consoleSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe("activarMembresiaController", () => {
    test("debe activar membresía correctamente", async () => {
      const req = {
        params: { pacienteId: "1" },
        body: { fechaInicio: "2026-05-29" },
      };
      const res = crearMockRes();

      const resultadoService = {
        ok: true,
        message: "Membresía activada correctamente",
      };

      mockActivarMembresia.mockResolvedValue(resultadoService);

      await activarMembresiaController(req, res);

      expect(mockActivarMembresia).toHaveBeenCalledWith("1", "2026-05-29");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        message: "Membresía activada correctamente",
        data: resultadoService,
      });
    });

    test("debe responder 400 si falta pacienteId", async () => {
      const req = {
        params: {},
        body: { fechaInicio: "2026-05-29" },
      };
      const res = crearMockRes();

      await activarMembresiaController(req, res);

      expect(mockActivarMembresia).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "El pacienteId es obligatorio",
      });
    });

    test("debe responder 400 si falta fechaInicio", async () => {
      const req = {
        params: { pacienteId: "1" },
        body: {},
      };
      const res = crearMockRes();

      await activarMembresiaController(req, res);

      expect(mockActivarMembresia).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "La fecha de inicio es obligatoria",
      });
    });

    test("debe responder 500 si el service falla", async () => {
      const req = {
        params: { pacienteId: "1" },
        body: { fechaInicio: "2026-05-29" },
      };
      const res = crearMockRes();

      mockActivarMembresia.mockRejectedValue(new Error("Error de base de datos"));

      await activarMembresiaController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Error interno del servidor",
        error: "Error de base de datos",
      });
    });
  });

  describe("desactivarMembresiaController", () => {
    test("debe desactivar membresía correctamente", async () => {
      const req = {
        params: { pacienteId: "1" },
      };
      const res = crearMockRes();

      const resultadoService = {
        ok: true,
        message: "Membresía desactivada correctamente",
      };

      mockDesactivarMembresia.mockResolvedValue(resultadoService);

      await desactivarMembresiaController(req, res);

      expect(mockDesactivarMembresia).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        message: "Membresía desactivada correctamente",
        data: resultadoService,
      });
    });

    test("debe responder 400 si falta pacienteId", async () => {
      const req = {
        params: {},
      };
      const res = crearMockRes();

      await desactivarMembresiaController(req, res);

      expect(mockDesactivarMembresia).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "El pacienteId es obligatorio",
      });
    });

    test("debe responder 500 si el service falla", async () => {
      const req = {
        params: { pacienteId: "1" },
      };
      const res = crearMockRes();

      mockDesactivarMembresia.mockRejectedValue(
        new Error("No se pudo desactivar")
      );

      await desactivarMembresiaController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Error interno del servidor",
        error: "No se pudo desactivar",
      });
    });
  });
});