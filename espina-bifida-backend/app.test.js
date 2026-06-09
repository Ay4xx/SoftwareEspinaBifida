import { jest, describe, test, expect, beforeEach, afterEach } from "@jest/globals";
import request from "supertest";
import express from "express";

const createMockRouter = (name) => {
  const router = express.Router();

  router.get("/test", (req, res) => {
    res.json({ ok: true, route: name });
  });

  return router;
};

const mockCors = jest.fn(() => (req, res, next) => next());

jest.unstable_mockModule("cors", () => ({
  default: mockCors,
}));

jest.unstable_mockModule("./modulos/paciente/paciente.routes.js", () => ({
  default: createMockRouter("pacientes"),
}));

jest.unstable_mockModule("./modulos/registro/registro.routes.js", () => ({
  default: createMockRouter("registro"),
}));

jest.unstable_mockModule("./modulos/fiorella/medico.route.js", () => ({
  default: createMockRouter("medicos"),
}));

jest.unstable_mockModule("./modulos/fiorella/medicamentos/medicamentos.route.js", () => ({
  default: createMockRouter("medicamentos"),
}));

jest.unstable_mockModule("./modulos/fiorella/equipomedico/equipomedico.route.js", () => ({
  default: createMockRouter("equipomedico"),
}));

jest.unstable_mockModule("./modulos/notificaciones/notificaciones.routes.js", () => ({
  default: createMockRouter("notificaciones"),
}));

jest.unstable_mockModule("./modulos/fiorella/detallepaciente/detallepaciente.routes.js", () => ({
  default: createMockRouter("detallepaciente"),
}));

jest.unstable_mockModule("./modulos/login/login.routes.js", () => ({
  default: createMockRouter("login"),
}));

jest.unstable_mockModule("./modulos/historial/historial.route.js", () => ({
  default: createMockRouter("historial"),
}));

jest.unstable_mockModule("./modulos/agendacitas/agendacitas.route.js", () => ({
  default: createMockRouter("citas"),
}));

jest.unstable_mockModule("./modulos/detallefamilia/familia.route.js", () => ({
  default: createMockRouter("familiar"),
}));

jest.unstable_mockModule("./modulos/fiorella/regservicios/regservicios.route.js", () => ({
  default: createMockRouter("inventario"),
}));

jest.unstable_mockModule("./modulos/gestionUsuarios/gestionUsuarios.routes.js", () => ({
  default: createMockRouter("gestion-usuarios"),
}));

jest.unstable_mockModule("./modulos/estadisticas/estadisticas.routes.js", () => ({
  default: createMockRouter("estadisticas"),
}));

jest.unstable_mockModule("./modulos/membresia/membresia.routes.js", () => ({
  default: createMockRouter("membresia"),
}));

jest.unstable_mockModule("./modulos/pagorecibo/pagorebico.route.js", () => ({
  default: createMockRouter("pagos"),
}));

jest.unstable_mockModule("./modulos/password/forgotPassword.router.js", () => ({
  default: createMockRouter("forgot-password"),
}));

describe("app.js", () => {
  let app;
  let sseClients;

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.FRONTEND_URL = "http://localhost:3000";

    const module = await import("./app.js");
    app = module.default;
    sseClients = module.sseClients;
  });

  afterEach(() => {
    sseClients.clear();
    delete process.env.FRONTEND_URL;
  });

  test("configura cors con FRONTEND_URL", () => {
    expect(mockCors).toHaveBeenCalledWith({
      origin: "http://localhost:3000",
    });
  });

  test("responde JSON correctamente", async () => {
    const res = await request(app)
      .post("/api/login/test")
      .send({ correo: "test@test.com" });

    expect(res.statusCode).toBe(404);
  });

  test("monta ruta /api/login", async () => {
    const res = await request(app).get("/api/login/test");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      ok: true,
      route: "login",
    });
  });

  test("monta ruta /api/forgot-password", async () => {
    const res = await request(app).get("/api/forgot-password/test");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      ok: true,
      route: "forgot-password",
    });
  });

  test("monta ruta /api/registro", async () => {
    const res = await request(app).get("/api/registro/test");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      ok: true,
      route: "registro",
    });
  });

  test("monta ruta /api/pacientes", async () => {
    const res = await request(app).get("/api/pacientes/test");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      ok: true,
      route: "pacientes",
    });
  });

  test("monta ruta /api/medicos", async () => {
    const res = await request(app).get("/api/medicos/test");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      ok: true,
      route: "medicos",
    });
  });

  test("monta ruta /api/medicamentos", async () => {
    const res = await request(app).get("/api/medicamentos/test");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      ok: true,
      route: "medicamentos",
    });
  });

  test("monta ruta /api/equipomedico", async () => {
    const res = await request(app).get("/api/equipomedico/test");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      ok: true,
      route: "equipomedico",
    });
  });

  test("monta ruta /api/detallepaciente", async () => {
    const res = await request(app).get("/api/detallepaciente/test");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      ok: true,
      route: "detallepaciente",
    });
  });

  test("monta ruta /api/notificaciones", async () => {
    const res = await request(app).get("/api/notificaciones/test");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      ok: true,
      route: "notificaciones",
    });
  });

  test("monta ruta /api/historial", async () => {
    const res = await request(app).get("/api/historial/test");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      ok: true,
      route: "historial",
    });
  });

  test("monta ruta /api/familiar", async () => {
    const res = await request(app).get("/api/familiar/test");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      ok: true,
      route: "familiar",
    });
  });

  test("monta ruta /api/citas", async () => {
    const res = await request(app).get("/api/citas/test");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      ok: true,
      route: "citas",
    });
  });

  test("monta ruta /api/inventario", async () => {
    const res = await request(app).get("/api/inventario/test");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      ok: true,
      route: "inventario",
    });
  });

  test("monta ruta /api/gestion-usuarios", async () => {
    const res = await request(app).get("/api/gestion-usuarios/test");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      ok: true,
      route: "gestion-usuarios",
    });
  });

  test("monta ruta /api/estadisticas", async () => {
    const res = await request(app).get("/api/estadisticas/test");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      ok: true,
      route: "estadisticas",
    });
  });

  test("monta ruta /api/membresia", async () => {
    const res = await request(app).get("/api/membresia/test");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      ok: true,
      route: "membresia",
    });
  });

  test("monta ruta /api/pagos", async () => {
    const res = await request(app).get("/api/pagos/test");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      ok: true,
      route: "pagos",
    });
  });

  test("endpoint SSE registra cliente y manda headers correctos", () => {
    const req = {
      on: jest.fn((event, callback) => {
        if (event === "close") {
          req.closeCallback = callback;
        }
      }),
    };

    const res = {
      setHeader: jest.fn(),
      flushHeaders: jest.fn(),
    };

    const stack = app._router?.stack || app.router?.stack || [];

    const sseLayer = stack.find((layer) => {
      return layer.route?.path === "/api/notificaciones-sse";
    });

    expect(sseLayer).toBeDefined();

    const handler = sseLayer.route.stack[0].handle;

    handler(req, res);

    expect(res.setHeader).toHaveBeenCalledWith(
      "Content-Type",
      "text/event-stream"
    );
    expect(res.setHeader).toHaveBeenCalledWith("Cache-Control", "no-cache");
    expect(res.setHeader).toHaveBeenCalledWith("Connection", "keep-alive");
    expect(res.flushHeaders).toHaveBeenCalled();

    expect(sseClients.has(res)).toBe(true);
  });

  test("endpoint SSE elimina cliente al cerrar conexión", () => {
    const req = {
      on: jest.fn((event, callback) => {
        if (event === "close") {
          req.closeCallback = callback;
        }
      }),
    };

    const res = {
      setHeader: jest.fn(),
      flushHeaders: jest.fn(),
    };

    const stack = app._router?.stack || app.router?.stack || [];

    const sseLayer = stack.find((layer) => {
      return layer.route?.path === "/api/notificaciones-sse";
    });

    expect(sseLayer).toBeDefined();

    const handler = sseLayer.route.stack[0].handle;

    handler(req, res);

    expect(sseClients.has(res)).toBe(true);

    req.closeCallback();

    expect(sseClients.has(res)).toBe(false);
  });
});