import request from "supertest";
import { jest } from "@jest/globals";

jest.unstable_mockModule("../modulos/estadisticas/estadisticas.service.js", () => ({
  getEstadisticasService: jest.fn(),
  descargarReporteMensualService: jest.fn(),
}));

const estadisticasService = await import("../modulos/estadisticas/estadisticas.service.js");
const { default: app } = await import("../app.js");

describe("ESTADISTICAS API", () => {
  beforeEach(() => jest.clearAllMocks());

  test("GET /api/estadisticas devuelve datos", async () => {
    estadisticasService.getEstadisticasService.mockResolvedValue({ total: 1 });
    const res = await request(app).get("/api/estadisticas");
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test("POST /api/estadisticas/reporte descarga CSV", async () => {
    estadisticasService.descargarReporteMensualService.mockResolvedValue("a,b,c\n1,2,3\n");

    const res = await request(app)
      .post("/api/estadisticas/reporte")
      .send({ tipoArchivo: "csv" });

    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toContain("text/csv");
  });
});
