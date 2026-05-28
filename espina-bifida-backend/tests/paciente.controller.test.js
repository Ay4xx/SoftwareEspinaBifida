import request from "supertest";
import { jest } from "@jest/globals";

// Mock completo del service
jest.unstable_mockModule("../modulos/paciente/paciente.service.js", () => ({
  getPacienteCards: jest.fn(),
  getPacienteDetail: jest.fn(),
  getPacienteCredencial: jest.fn(),
  getPacienteDetalle: jest.fn(),
  getPacienteCompleto: jest.fn(),
  guardarFoto: jest.fn(),
  obtenerFoto: jest.fn(),
  updatePaciente: jest.fn(),
  updateHistorialMadre: jest.fn(),
}));

const pacienteService = await import("../modulos/paciente/paciente.service.js");
const { default: app } = await import("../app.js");

describe("PACIENTES API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/pacientes/cards", () => {
    test("debe regresar lista de pacientes", async () => {
      pacienteService.getPacienteCards.mockResolvedValue([
        { id: 1, name: "Juan Pérez" },
      ]);

      const res = await request(app).get("/api/pacientes/cards");

      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.length).toBe(1);
    });

    test("debe manejar error", async () => {
      pacienteService.getPacienteCards.mockRejectedValue(new Error("DB error"));

      const res = await request(app).get("/api/pacientes/cards");

      expect(res.statusCode).toBe(500);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe("Error al obtener pacientes");
    });

    test("debe enviar search al service", async () => {
      pacienteService.getPacienteCards.mockResolvedValue([]);

      await request(app).get("/api/pacientes/cards?search=juan");

      expect(pacienteService.getPacienteCards).toHaveBeenCalledWith("juan");
    });
  });

  describe("GET /api/pacientes/:id", () => {
    test("debe regresar paciente por id", async () => {
      pacienteService.getPacienteDetail.mockResolvedValue({
        id: 1,
        name: "Juan Pérez",
      });

      const res = await request(app).get("/api/pacientes/1");

      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.name).toBe("Juan Pérez");
      expect(pacienteService.getPacienteDetail).toHaveBeenCalledWith("1");
    });

    test("debe regresar 404 si no existe", async () => {
      pacienteService.getPacienteDetail.mockResolvedValue(null);

      const res = await request(app).get("/api/pacientes/1");

      expect(res.statusCode).toBe(404);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe("Paciente no encontrado");
    });

    test("debe manejar error interno", async () => {
      pacienteService.getPacienteDetail.mockRejectedValue(new Error("DB error"));

      const res = await request(app).get("/api/pacientes/1");

      expect(res.statusCode).toBe(500);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe("Error al obtener el paciente");
    });
  });

  describe("GET /api/pacientes/credencial/:pacienteId", () => {
    test("debe regresar credencial", async () => {
      pacienteService.getPacienteCredencial.mockResolvedValue({
        nombre: "Juan Pérez",
      });

      const res = await request(app).get("/api/pacientes/credencial/1");

      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.nombre).toBe("Juan Pérez");
      expect(pacienteService.getPacienteCredencial).toHaveBeenCalledWith(1);
    });

    test("debe regresar 404 si no existe", async () => {
      pacienteService.getPacienteCredencial.mockResolvedValue(null);

      const res = await request(app).get("/api/pacientes/credencial/1");

      expect(res.statusCode).toBe(404);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe("Paciente no encontrado");
    });

    test("debe manejar error interno", async () => {
      pacienteService.getPacienteCredencial.mockRejectedValue(new Error("DB error"));

      const res = await request(app).get("/api/pacientes/credencial/1");

      expect(res.statusCode).toBe(500);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe("Error interno del servidor");
      expect(res.body.error).toBe("DB error");
    });
  });

  describe("GET /api/pacientes/detalle/:id", () => {
    test("debe regresar detalle", async () => {
      pacienteService.getPacienteDetalle.mockResolvedValue({
        NOMBRE: "Juan",
      });

      const res = await request(app).get("/api/pacientes/detalle/1");

      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.NOMBRE).toBe("Juan");
      expect(pacienteService.getPacienteDetalle).toHaveBeenCalledWith("1");
    });

    test("debe regresar 404 si no existe", async () => {
      pacienteService.getPacienteDetalle.mockResolvedValue(null);

      const res = await request(app).get("/api/pacientes/detalle/1");

      expect(res.statusCode).toBe(404);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe("Paciente no encontrado");
    });

    test("debe manejar error interno", async () => {
      pacienteService.getPacienteDetalle.mockRejectedValue(new Error("DB error"));

      const res = await request(app).get("/api/pacientes/detalle/1");

      expect(res.statusCode).toBe(500);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe("DB error");
    });
  });

  describe("POST /api/pacientes/upload/:id", () => {
    test("debe subir foto correctamente", async () => {
      pacienteService.guardarFoto.mockResolvedValue();

      const res = await request(app)
        .post("/api/pacientes/upload/1")
        .attach("foto", Buffer.from("fake"), "test.jpg");

      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.message).toBe("Foto guardada correctamente");
      expect(pacienteService.guardarFoto).toHaveBeenCalled();
    });

    test("debe fallar si no hay archivo", async () => {
      const res = await request(app).post("/api/pacientes/upload/1");

      expect(res.statusCode).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe("No se recibió ninguna imagen");
    });

    test("debe manejar error al guardar foto", async () => {
      pacienteService.guardarFoto.mockRejectedValue(new Error("Error guardando"));

      const res = await request(app)
        .post("/api/pacientes/upload/1")
        .attach("foto", Buffer.from("fake"), "test.jpg");

      expect(res.statusCode).toBe(500);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe("Error al guardar la foto");
      expect(res.body.error).toBe("Error guardando");
    });
  });

  describe("GET /api/pacientes/:id/foto", () => {
    test("debe regresar foto", async () => {
      pacienteService.obtenerFoto.mockResolvedValue(Buffer.from("img"));

      const res = await request(app).get("/api/pacientes/1/foto");

      expect(res.statusCode).toBe(200);
      expect(res.headers["content-type"]).toContain("image/jpeg");
    });

    test("debe regresar 404 si no hay foto", async () => {
      pacienteService.obtenerFoto.mockResolvedValue(null);

      const res = await request(app).get("/api/pacientes/1/foto");

      expect(res.statusCode).toBe(404);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe("Foto no encontrada");
    });

    test("debe manejar error al obtener foto", async () => {
      pacienteService.obtenerFoto.mockRejectedValue(new Error("Error foto"));

      const res = await request(app).get("/api/pacientes/1/foto");

      expect(res.statusCode).toBe(500);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe("Error al obtener la foto");
      expect(res.body.error).toBe("Error foto");
    });
  });
});