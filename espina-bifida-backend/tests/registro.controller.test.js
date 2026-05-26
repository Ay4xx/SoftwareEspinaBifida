import request from "supertest";
import { jest } from "@jest/globals";

jest.unstable_mockModule("../modulos/registro/registro.service.js", () => ({
  crearPacientePaso1: jest.fn(),
  actualizarPaso5: jest.fn(),
  actualizarPaso2: jest.fn(),
  actualizarPaso3: jest.fn(), 
  actualizarPaso4: jest.fn(),
}));

jest.unstable_mockModule("../modulos/email/email.service.js", () => ({
  enviarCorreoPreRegistro: jest.fn(),
  enviarCorreoAltaManual: jest.fn(),
  enviarCorreoAprobacion: jest.fn(),
  enviarCorreoRechazo: jest.fn(),
}));

const registroService = await import("../modulos/registro/registro.service.js");
const { default: app } = await import("../app.js");

describe("REGISTRO API", () => {
  beforeEach(() => jest.clearAllMocks());

  test("POST /api/registro valida campos paso1", async () => {
    const res = await request(app).post("/api/registro").send({ nombre: "", apellido: "" });
    expect(res.statusCode).toBe(400);
    expect(res.body.ok).toBe(false);
  });

  test("POST /api/registro crea paciente y fotografia", async () => {
    registroService.crearPacientePaso1.mockResolvedValue({ id: 10 });

    const res = await request(app)
      .post("/api/registro")
      .send({ nombre: "A", apellido: "B", genero: "M", fechaNacimiento: "2000-01-01", curp: "CURP" });

    expect(res.statusCode).toBe(201);
    expect(res.body.ok).toBe(true);

    registroService.actualizarPaso5.mockResolvedValue();

    const res2 = await request(app)
      .put("/api/registro/1/paso5")
      .attach("foto", Buffer.from("fake"), "test.jpg");

    expect(res2.statusCode).toBe(200);
    expect(res2.body.ok).toBe(true);
  });
});
