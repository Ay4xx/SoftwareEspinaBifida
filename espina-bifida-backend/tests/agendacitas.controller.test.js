import request from "supertest";
import { jest } from "@jest/globals";

jest.unstable_mockModule("../modulos/agendacitas/agendacitas.service.js", () => ({
  getCitasByFecha: jest.fn(),
  getCitaById: jest.fn(),
  crearCita: jest.fn(),
  actualizarEstatusCita: jest.fn(),
  eliminarCita: jest.fn(),
}));

const agendacitasService = await import("../modulos/agendacitas/agendacitas.service.js");
const { default: app } = await import("../app.js");

describe("AGENDACITAS API", () => {
  beforeEach(() => jest.clearAllMocks());

  test("GET /api/citas?fecha debe devolver citas", async () => {
    agendacitasService.getCitasByFecha.mockResolvedValue([{ id: 1 }]);

    const res = await request(app).get("/api/citas?fecha=2026-01-01");

    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.citas.length).toBe(1);
  });

  test("GET /api/citas sin fecha debe retornar 400", async () => {
    const res = await request(app).get("/api/citas");

    expect(res.statusCode).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.message).toBe("La fecha es requerida");
  });

  test("POST /api/citas crea nueva cita y maneja error", async () => {
    agendacitasService.crearCita.mockResolvedValue({ id: 5 });

    const res = await request(app)
      .post("/api/citas")
      .send({ id_paciente: 1, fecha_cita: "2026-06-01", hora_cita: "10:00" });

    expect(res.statusCode).toBe(201);
    expect(res.body.ok).toBe(true);

    agendacitasService.crearCita.mockRejectedValue(new Error("DB"));

    const res2 = await request(app)
      .post("/api/citas")
      .send({ id_paciente: 1, fecha_cita: "2026-06-01", hora_cita: "10:00" });

    expect(res2.statusCode).toBe(500);
    expect(res2.body.ok).toBe(false);
  });
});
