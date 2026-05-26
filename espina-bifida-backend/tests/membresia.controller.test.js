import request from "supertest";
import { jest } from "@jest/globals";

jest.unstable_mockModule("../modulos/membresia/membresia.service.js", () => ({
  activarMembresia: jest.fn(),
  desactivarMembresia: jest.fn(),
  obtenerMembresiaPorPacienteId: jest.fn(),
}));

const memService = await import("../modulos/membresia/membresia.service.js");
const { default: app } = await import("../app.js");

describe("MEMBRESIA API", () => {
  beforeEach(() => jest.clearAllMocks());

  test("PUT /api/membresia/activar/:pacienteId valida fechaInicio", async () => {
    const res = await request(app).put("/api/membresia/activar/1").send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.ok).toBe(false);

    memService.activarMembresia.mockResolvedValue({ id: 1 });
    const res2 = await request(app).put("/api/membresia/activar/1").send({ fechaInicio: "2026-01-01" });
    expect(res2.statusCode).toBe(200);
    expect(res2.body.ok).toBe(true);
  });

  test("PUT /api/membresia/desactivar/:pacienteId funciona", async () => {
    memService.desactivarMembresia.mockResolvedValue({ id: 1 });
    const res = await request(app).put("/api/membresia/desactivar/1");
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
