import request from "supertest";
import { jest } from "@jest/globals";

jest.unstable_mockModule("../modulos/login/login.service.js", () => ({
  iniciarSesionPaciente: jest.fn(),
}));

const loginService = await import("../modulos/login/login.service.js");
const { default: app } = await import("../app.js");

describe("LOGIN API", () => {
  beforeEach(() => jest.clearAllMocks());

  test("POST /api/login valida campos obligatorios", async () => {
    const res = await request(app).post("/api/login").send({ username: "" });

    expect(res.statusCode).toBe(400);
    expect(res.body.ok).toBe(false);
  });

  test("POST /api/login credenciales incorrectas y correctas", async () => {
    loginService.iniciarSesionPaciente.mockResolvedValue(null);

    const res = await request(app).post("/api/login").send({ username: "u", password: "p" });
    expect(res.statusCode).toBe(401);

    loginService.iniciarSesionPaciente.mockResolvedValue({ id: 1, tipoUsuario: "paciente" });
    const res2 = await request(app).post("/api/login").send({ username: "u", password: "p" });
    expect(res2.statusCode).toBe(200);
    expect(res2.body.ok).toBe(true);
    expect(res2.body.token).toBeDefined();
  });
});
