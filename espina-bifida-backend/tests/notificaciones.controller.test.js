import request from "supertest";
import { jest } from "@jest/globals";

jest.unstable_mockModule("../modulos/notificaciones/notificaciones.service.js", () => ({
  getNotificaciones: jest.fn(),
  aprobarNotificacion: jest.fn(),
  getNotificacionById: jest.fn(),
  rechazarNotificacion: jest.fn(),
  eliminarNotificacionesAntiguas: jest.fn(),
}));

jest.unstable_mockModule("../modulos/email/email.service.js", () => ({
    enviarCorreoAprobacion: jest.fn(),
    enviarCorreoRechazo: jest.fn(),
    enviarCorreoAltaManual: jest.fn(),
    enviarCorreoAprobacion: jest.fn(),
    enviarCorreoPreRegistro: jest.fn(),
}));

const notiService = await import("../modulos/notificaciones/notificaciones.service.js");
const { default: app } = await import("../app.js");

describe("NOTIFICACIONES API", () => {
  beforeEach(() => jest.clearAllMocks());

  test("GET /api/notificaciones lista notificaciones", async () => {
    notiService.getNotificaciones.mockResolvedValue([{ id: 1 }]);
    const res = await request(app).get("/api/notificaciones");
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test("PUT /api/notificaciones/:id/aprobar maneja not found", async () => {
    notiService.aprobarNotificacion.mockResolvedValue(false);
    const res = await request(app).put("/api/notificaciones/1/aprobar").send({ usuarioId: 1 });
    expect(res.statusCode).toBe(404);
  });
});
