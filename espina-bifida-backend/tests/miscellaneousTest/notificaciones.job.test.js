import { jest, describe, beforeEach, afterEach, test, expect } from "@jest/globals";

const mockGetNotificaciones = jest.fn();
const mockAprobarNotificacion = jest.fn();
const mockRechazarNotificacion = jest.fn();
const mockGetNotificacionById = jest.fn();
const mockEliminarNotificacionesAntiguas = jest.fn();

const mockEnviarCorreoAprobacion = jest.fn();
const mockEnviarCorreoRechazo = jest.fn();

jest.unstable_mockModule("../../modulos/notificaciones/notificaciones.service.js", () => ({
  getNotificaciones: mockGetNotificaciones,
  aprobarNotificacion: mockAprobarNotificacion,
  rechazarNotificacion: mockRechazarNotificacion,
  getNotificacionById: mockGetNotificacionById,
  eliminarNotificacionesAntiguas: mockEliminarNotificacionesAntiguas,
}));

jest.unstable_mockModule("../../modulos/email/email.service.js", () => ({
  enviarCorreoAprobacion: mockEnviarCorreoAprobacion,
  enviarCorreoRechazo: mockEnviarCorreoRechazo,
}));

const {
  listarNotificaciones,
  aprobarNotificacionController,
  rechazarNotificacionController,
  getNotificacionByIdController,
  limpiarNotificacionesAntiguasController,
} = await import("../../modulos/notificaciones/notificaciones.controller.js");

function crearMockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("notificaciones.controller.js", () => {
  let consoleSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe("listarNotificaciones", () => {
    test("debe listar notificaciones correctamente", async () => {
      const req = { query: { estado: "pendiente" } };
      const res = crearMockRes();

      const data = [{ id: 1, estado: "pendiente" }];
      mockGetNotificaciones.mockResolvedValue(data);

      await listarNotificaciones(req, res);

      expect(mockGetNotificaciones).toHaveBeenCalledWith("pendiente");
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        data,
      });
    });

    test("debe responder 500 si falla", async () => {
      const req = { query: {} };
      const res = crearMockRes();

      mockGetNotificaciones.mockRejectedValue(new Error("DB error"));

      await listarNotificaciones(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Error al obtener notificaciones",
      });
    });
  });

  describe("aprobarNotificacionController", () => {
    test("debe aprobar notificación y enviar correo si tiene email", async () => {
      const req = {
        params: { id: "1" },
        body: { usuarioId: "7" },
      };
      const res = crearMockRes();

      mockAprobarNotificacion.mockResolvedValue(true);
      mockGetNotificacionById.mockResolvedValue({
        NOMBRE: "Juan",
        APELLIDO: "Pérez",
        EMAIL: "juan@test.com",
      });
      mockEnviarCorreoAprobacion.mockResolvedValue();

      await aprobarNotificacionController(req, res);

      expect(mockAprobarNotificacion).toHaveBeenCalledWith("1", "7");
      expect(mockGetNotificacionById).toHaveBeenCalledWith("1");
      expect(mockEnviarCorreoAprobacion).toHaveBeenCalledWith({
        nombre: "Juan",
        apellido: "Pérez",
        correo: "juan@test.com",
      });
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        message: "Notificación aprobada correctamente",
      });
    });

    test("debe aprobar aunque falle el correo", async () => {
      const req = {
        params: { id: "1" },
        body: { usuarioId: "7" },
      };
      const res = crearMockRes();

      mockAprobarNotificacion.mockResolvedValue(true);
      mockGetNotificacionById.mockResolvedValue({
        NOMBRE: "Juan",
        APELLIDO: "Pérez",
        EMAIL: "juan@test.com",
      });
      mockEnviarCorreoAprobacion.mockRejectedValue(new Error("Error correo"));

      await aprobarNotificacionController(req, res);

      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        message: "Notificación aprobada correctamente",
      });
    });

    test("debe aprobar sin enviar correo si no tiene email", async () => {
      const req = {
        params: { id: "1" },
        body: { usuarioId: "7" },
      };
      const res = crearMockRes();

      mockAprobarNotificacion.mockResolvedValue(true);
      mockGetNotificacionById.mockResolvedValue({
        NOMBRE: "Juan",
        APELLIDO: "Pérez",
        EMAIL: null,
      });

      await aprobarNotificacionController(req, res);

      expect(mockEnviarCorreoAprobacion).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        message: "Notificación aprobada correctamente",
      });
    });

    test("debe responder 404 si no se actualizó", async () => {
      const req = {
        params: { id: "99" },
        body: { usuarioId: "7" },
      };
      const res = crearMockRes();

      mockAprobarNotificacion.mockResolvedValue(false);

      await aprobarNotificacionController(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Notificación no encontrada o ya fue resuelta",
      });
    });

    test("debe responder 500 si falla aprobarNotificacion", async () => {
      const req = {
        params: { id: "1" },
        body: { usuarioId: "7" },
      };
      const res = crearMockRes();

      mockAprobarNotificacion.mockRejectedValue(new Error("DB error"));

      await aprobarNotificacionController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Error al aprobar la notificación",
      });
    });
  });

  describe("rechazarNotificacionController", () => {
    test("debe rechazar notificación y enviar correo si tiene email", async () => {
      const req = {
        params: { id: "2" },
        body: { usuarioId: "9" },
      };
      const res = crearMockRes();

      mockRechazarNotificacion.mockResolvedValue(true);
      mockGetNotificacionById.mockResolvedValue({
        NOMBRE: "Ana",
        APELLIDO: "López",
        EMAIL: "ana@test.com",
      });
      mockEnviarCorreoRechazo.mockResolvedValue();

      await rechazarNotificacionController(req, res);

      expect(mockRechazarNotificacion).toHaveBeenCalledWith("2", "9");
      expect(mockEnviarCorreoRechazo).toHaveBeenCalledWith({
        nombre: "Ana",
        apellido: "López",
        correo: "ana@test.com",
      });
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        message: "Notificación rechazada correctamente",
      });
    });

    test("debe rechazar aunque falle el correo", async () => {
      const req = {
        params: { id: "2" },
        body: { usuarioId: "9" },
      };
      const res = crearMockRes();

      mockRechazarNotificacion.mockResolvedValue(true);
      mockGetNotificacionById.mockResolvedValue({
        NOMBRE: "Ana",
        APELLIDO: "López",
        EMAIL: "ana@test.com",
      });
      mockEnviarCorreoRechazo.mockRejectedValue(new Error("Error correo"));

      await rechazarNotificacionController(req, res);

      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        message: "Notificación rechazada correctamente",
      });
    });

    test("debe responder 404 si no se actualizó", async () => {
      const req = {
        params: { id: "99" },
        body: { usuarioId: "9" },
      };
      const res = crearMockRes();

      mockRechazarNotificacion.mockResolvedValue(false);

      await rechazarNotificacionController(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Notificación no encontrada o ya fue resuelta",
      });
    });

    test("debe responder 500 si falla rechazarNotificacion", async () => {
      const req = {
        params: { id: "2" },
        body: { usuarioId: "9" },
      };
      const res = crearMockRes();

      mockRechazarNotificacion.mockRejectedValue(new Error("DB error"));

      await rechazarNotificacionController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Error al rechazar la notificación",
      });
    });
  });

  describe("getNotificacionByIdController", () => {
    test("debe obtener notificación por id", async () => {
      const req = { params: { id: "1" } };
      const res = crearMockRes();

      const data = {
        NOTIFICACION_ID: 1,
        NOMBRE: "Juan",
        EMAIL: "juan@test.com",
      };

      mockGetNotificacionById.mockResolvedValue(data);

      await getNotificacionByIdController(req, res);

      expect(mockGetNotificacionById).toHaveBeenCalledWith("1");
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        data,
      });
    });

    test("debe responder 404 si no encuentra notificación", async () => {
      const req = { params: { id: "99" } };
      const res = crearMockRes();

      mockGetNotificacionById.mockResolvedValue(null);

      await getNotificacionByIdController(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Notificación no encontrada",
      });
    });

    test("debe convertir objetos raros a string para evitar circular/json error", async () => {
      const req = { params: { id: "1" } };
      const res = crearMockRes();

      class WeirdObject {
        toString() {
          return "weird-value";
        }
      }

      mockGetNotificacionById.mockResolvedValue({
        NOTIFICACION_ID: 1,
        CAMPO_RARO: new WeirdObject(),
      });

      await getNotificacionByIdController(req, res);

      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        data: {
          NOTIFICACION_ID: 1,
          CAMPO_RARO: "weird-value",
        },
      });
    });

    test("debe responder 500 si falla", async () => {
      const req = { params: { id: "1" } };
      const res = crearMockRes();

      mockGetNotificacionById.mockRejectedValue(new Error("DB error"));

      await getNotificacionByIdController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Error al obtener la notificación",
      });
    });
  });

  describe("limpiarNotificacionesAntiguasController", () => {
    test("debe limpiar notificaciones antiguas", async () => {
      const req = {};
      const res = crearMockRes();

      mockEliminarNotificacionesAntiguas.mockResolvedValue(3);

      await limpiarNotificacionesAntiguasController(req, res);

      expect(mockEliminarNotificacionesAntiguas).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        eliminadas: 3,
      });
    });

    test("debe responder 500 si falla limpieza", async () => {
      const req = {};
      const res = crearMockRes();

      mockEliminarNotificacionesAntiguas.mockRejectedValue(new Error("DB error"));

      await limpiarNotificacionesAntiguasController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Error al limpiar notificaciones antiguas",
      });
    });
  });
});