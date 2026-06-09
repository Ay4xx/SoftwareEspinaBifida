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

function mockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

describe("notificaciones.controller.js", () => {
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test("listarNotificaciones responde con data", async () => {
    const req = { query: { estado: "pendiente" } };
    const res = mockRes();

    const data = [{ id: 1, titulo: "Solicitud" }];
    mockGetNotificaciones.mockResolvedValue(data);

    await listarNotificaciones(req, res);

    expect(mockGetNotificaciones).toHaveBeenCalledWith("pendiente");
    expect(res.json).toHaveBeenCalledWith({ ok: true, data });
  });

  test("listarNotificaciones responde 500 si falla", async () => {
    const req = { query: {} };
    const res = mockRes();

    mockGetNotificaciones.mockRejectedValue(new Error("Error DB"));

    await listarNotificaciones(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      message: "Error al obtener notificaciones",
    });
  });

  test("aprobarNotificacionController aprueba y envía correo si hay email", async () => {
    const req = { params: { id: "5" } };
    const res = mockRes();

    mockAprobarNotificacion.mockResolvedValue(true);
    mockGetNotificacionById.mockResolvedValue({
      NOMBRE: "Ana",
      APELLIDO: "López",
      EMAIL: "ana@test.com",
    });
    mockEnviarCorreoAprobacion.mockResolvedValue();

    await aprobarNotificacionController(req, res);

    expect(mockAprobarNotificacion).toHaveBeenCalledWith("5");
    expect(mockGetNotificacionById).toHaveBeenCalledWith("5");

    expect(mockEnviarCorreoAprobacion).toHaveBeenCalledWith({
      nombre: "Ana",
      apellido: "López",
      correo: "ana@test.com",
    });

    expect(res.json).toHaveBeenCalledWith({
      ok: true,
      message: "Notificación aprobada correctamente",
    });
  });

  test("aprobarNotificacionController no envía correo si no hay email", async () => {
    const req = { params: { id: "5" } };
    const res = mockRes();

    mockAprobarNotificacion.mockResolvedValue(true);
    mockGetNotificacionById.mockResolvedValue({
      NOMBRE: "Ana",
      APELLIDO: "López",
      EMAIL: null,
    });

    await aprobarNotificacionController(req, res);

    expect(mockEnviarCorreoAprobacion).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      ok: true,
      message: "Notificación aprobada correctamente",
    });
  });

  test("aprobarNotificacionController no falla si correo de aprobación falla", async () => {
    const req = { params: { id: "5" } };
    const res = mockRes();

    mockAprobarNotificacion.mockResolvedValue(true);
    mockGetNotificacionById.mockResolvedValue({
      NOMBRE: "Ana",
      APELLIDO: "López",
      EMAIL: "ana@test.com",
    });
    mockEnviarCorreoAprobacion.mockRejectedValue(new Error("Error correo"));

    await aprobarNotificacionController(req, res);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error al enviar correo (aprobación):",
      expect.any(Error)
    );

    expect(res.json).toHaveBeenCalledWith({
      ok: true,
      message: "Notificación aprobada correctamente",
    });
  });

  test("aprobarNotificacionController responde 404 si no actualizó", async () => {
    const req = { params: { id: "5" } };
    const res = mockRes();

    mockAprobarNotificacion.mockResolvedValue(false);

    await aprobarNotificacionController(req, res);

    expect(mockGetNotificacionById).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      message: "Notificación no encontrada o ya fue resuelta",
    });
  });

  test("aprobarNotificacionController responde 500 si falla", async () => {
    const req = { params: { id: "5" } };
    const res = mockRes();

    mockAprobarNotificacion.mockRejectedValue(new Error("Error aprobar"));

    await aprobarNotificacionController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      message: "Error al aprobar la notificación",
    });
  });

  test("rechazarNotificacionController rechaza y envía correo", async () => {
    const req = { params: { id: "6" } };
    const res = mockRes();

    mockRechazarNotificacion.mockResolvedValue(true);
    mockGetNotificacionById.mockResolvedValue({
      NOMBRE: "Juan",
      APELLIDO: "Pérez",
      EMAIL: "juan@test.com",
    });
    mockEnviarCorreoRechazo.mockResolvedValue();

    await rechazarNotificacionController(req, res);

    expect(mockRechazarNotificacion).toHaveBeenCalledWith("6");
    expect(mockEnviarCorreoRechazo).toHaveBeenCalledWith({
      nombre: "Juan",
      apellido: "Pérez",
      correo: "juan@test.com",
    });

    expect(res.json).toHaveBeenCalledWith({
      ok: true,
      message: "Notificación rechazada correctamente",
    });
  });

  test("rechazarNotificacionController responde 404 si no actualizó", async () => {
    const req = { params: { id: "6" } };
    const res = mockRes();

    mockRechazarNotificacion.mockResolvedValue(false);

    await rechazarNotificacionController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      message: "Notificación no encontrada o ya fue resuelta",
    });
  });

  test("rechazarNotificacionController no falla si correo de rechazo falla", async () => {
    const req = { params: { id: "6" } };
    const res = mockRes();

    mockRechazarNotificacion.mockResolvedValue(true);
    mockGetNotificacionById.mockResolvedValue({
      NOMBRE: "Juan",
      APELLIDO: "Pérez",
      EMAIL: "juan@test.com",
    });
    mockEnviarCorreoRechazo.mockRejectedValue(new Error("Error correo"));

    await rechazarNotificacionController(req, res);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error al enviar correo (rechazo):",
      expect.any(Error)
    );

    expect(res.json).toHaveBeenCalledWith({
      ok: true,
      message: "Notificación rechazada correctamente",
    });
  });

  test("rechazarNotificacionController responde 500 si falla", async () => {
    const req = { params: { id: "6" } };
    const res = mockRes();

    mockRechazarNotificacion.mockRejectedValue(new Error("Error rechazo"));

    await rechazarNotificacionController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      message: "Error al rechazar la notificación",
    });
  });

  test("getNotificacionByIdController responde con data sanitizada", async () => {
    const req = { params: { id: "1" } };
    const res = mockRes();

    class CustomValue {
      toString() {
        return "custom-value";
      }
    }

    mockGetNotificacionById.mockResolvedValue({
      NOTIFICACION_ID: 1,
      NOMBRE: "Ana",
      EXTRA: new CustomValue(),
    });

    await getNotificacionByIdController(req, res);

    expect(mockGetNotificacionById).toHaveBeenCalledWith("1");
    expect(res.json).toHaveBeenCalledWith({
      ok: true,
      data: {
        NOTIFICACION_ID: 1,
        NOMBRE: "Ana",
        EXTRA: "custom-value",
      },
    });
  });

  test("getNotificacionByIdController responde 404 si no existe", async () => {
    const req = { params: { id: "1" } };
    const res = mockRes();

    mockGetNotificacionById.mockResolvedValue(null);

    await getNotificacionByIdController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      message: "Notificación no encontrada",
    });
  });

  test("getNotificacionByIdController responde 500 si falla", async () => {
    const req = { params: { id: "1" } };
    const res = mockRes();

    mockGetNotificacionById.mockRejectedValue(new Error("Error detalle"));

    await getNotificacionByIdController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      message: "Error al obtener la notificación",
    });
  });

  test("limpiarNotificacionesAntiguasController responde cantidad eliminada", async () => {
    const req = {};
    const res = mockRes();

    mockEliminarNotificacionesAntiguas.mockResolvedValue(3);

    await limpiarNotificacionesAntiguasController(req, res);

    expect(mockEliminarNotificacionesAntiguas).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      ok: true,
      eliminadas: 3,
    });
  });

  test("limpiarNotificacionesAntiguasController responde 500 si falla", async () => {
    const req = {};
    const res = mockRes();

    mockEliminarNotificacionesAntiguas.mockRejectedValue(new Error("Error limpiar"));

    await limpiarNotificacionesAntiguasController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      message: "Error al limpiar notificaciones antiguas",
    });
  });
});