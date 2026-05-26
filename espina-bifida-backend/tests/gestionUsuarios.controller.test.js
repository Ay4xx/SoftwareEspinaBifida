import request from "supertest";
import { jest } from "@jest/globals";

jest.unstable_mockModule("../modulos/gestionUsuarios/gestionUsuarios.service.js", () => ({
  listarUsuarios: jest.fn(),
  obtenerUsuario: jest.fn(),
  crearUsuario: jest.fn(),
  actualizarUsuario: jest.fn(),
  eliminarUsuario: jest.fn(),
}));

const guService = await import("../modulos/gestionUsuarios/gestionUsuarios.service.js");
const { default: app } = await import("../app.js");

describe("GESTION USUARIOS API", () => {
  beforeEach(() => jest.clearAllMocks());

  test("GET /api/gestion-usuarios lista usuarios", async () => {
    guService.listarUsuarios.mockResolvedValue({ data: [], pagina: 1, total: 0 });
    const res = await request(app).get("/api/gestion-usuarios");
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test("GET /api/gestion-usuarios/:id 404 cuando no existe", async () => {
    guService.obtenerUsuario.mockResolvedValue(null);
    const res = await request(app).get("/api/gestion-usuarios/1");
    expect(res.statusCode).toBe(404);
  });
});
