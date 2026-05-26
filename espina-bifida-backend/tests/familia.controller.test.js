import request from "supertest";
import { jest } from "@jest/globals";

jest.unstable_mockModule("../modulos/detallefamilia/familia.service.js", () => ({
  obtenerHistorialFamiliar: jest.fn(),
}));

const famService = await import("../modulos/detallefamilia/familia.service.js");
const { default: app } = await import("../app.js");

describe("FAMILIA API", () => {
  beforeEach(() => jest.clearAllMocks());

  test("GET /api/familiar/:id devuelve datos", async () => {
    famService.obtenerHistorialFamiliar.mockResolvedValue({ fam: [] });
    const res = await request(app).get("/api/familiar/1");
    expect(res.statusCode).toBe(200);
  });

  test("GET /api/familiar maneja error", async () => {
    famService.obtenerHistorialFamiliar.mockRejectedValue(new Error("DB"));
    const res = await request(app).get("/api/familiar/1");
    expect(res.statusCode).toBe(500);
  });
});
