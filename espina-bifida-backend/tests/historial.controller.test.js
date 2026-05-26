import request from "supertest";
import { jest } from "@jest/globals";

jest.unstable_mockModule("../modulos/historial/historial.service.js", () => ({
  obtenerHistorialPorPaciente: jest.fn(),
}));

const historialService = await import("../modulos/historial/historial.service.js");
const { default: app } = await import("../app.js");

describe("HISTORIAL API", () => {
  beforeEach(() => jest.clearAllMocks());

  test("GET /api/historial/:id devuelve datos", async () => {
    historialService.obtenerHistorialPorPaciente.mockResolvedValue({ items: [] });
    const res = await request(app).get("/api/historial/1");
    expect(res.statusCode).toBe(200);
    expect(res.body.items).toBeDefined();
  });

  test("GET /api/historial maneja error", async () => {
    historialService.obtenerHistorialPorPaciente.mockRejectedValue(new Error("DB"));
    const res = await request(app).get("/api/historial/1");
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe("Error al obtener historial");
  });
});
