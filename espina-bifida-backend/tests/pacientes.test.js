import request from "supertest";
import { jest } from "@jest/globals";

// Mock del service ANTES de importar app
jest.unstable_mockModule("../modulos/paciente/paciente.service.js", () => ({
  getPacienteCards: jest.fn(),
  getPacienteDetail: jest.fn(),
  getPacienteCredencial: jest.fn(),
}));

const pacienteService = await import("../modulos/paciente/paciente.service.js");
const { mapPacienteToCard } = await import("../modulos/paciente/paciente.mapper.js");
const { default: app } = await import("../app.js");

describe("PACIENTES API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Tests para GET /api/pacientes/cards
  describe("GET /api/pacientes/cards", () => {
    test("debe regresar lista de pacientes", async () => {
      pacienteService.getPacienteCards.mockResolvedValue([
        { id: 1, name: "Juan Pérez" },
      ]);

      const res = await request(app).get("/api/pacientes/cards");

      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(pacienteService.getPacienteCards).toHaveBeenCalledWith(undefined);
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

      const res = await request(app).get("/api/pacientes/cards?search=juan");

      expect(res.statusCode).toBe(200);
      expect(pacienteService.getPacienteCards).toHaveBeenCalledWith("juan");
    });
  });

 // Tests para GET /api/pacientes/:id
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

  // Tests para GET /api/pacientes/credencial/:pacienteId
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
});

// Tests para el mapper
describe("PACIENTE MAPPER", () => {
  test("debe mapear correctamente", () => {
    const row = {
      PACIENTE_ID: 1,
      NOMBRE: "Juan Pérez",
      CIUDAD_RESIDENCIA: "Monterrey",
      ESTADO_RESIDENCIA: "NL",
      ESTATUS_MEMBRESIA: "activa",
    };

    const result = mapPacienteToCard(row);

    expect(result.id).toBe(1);
    expect(result.folio).toBe("001");
    expect(result.initials).toBe("JP");
    expect(result.name).toBe("Juan Pérez");
    expect(result.status).toBe("Activo");
    expect(result.location).toBe("Monterrey, NL");
  });

  test("debe poner Inactivo si la membresía no es activa", () => {
    const row = {
      PACIENTE_ID: 2,
      NOMBRE: "María López",
      ESTATUS_MEMBRESIA: "vencida",
    };

    const result = mapPacienteToCard(row);

    expect(result.status).toBe("Inactivo");
  });

  test("debe manejar nombre vacío", () => {
    const row = {
      PACIENTE_ID: 3,
    };

    const result = mapPacienteToCard(row);

    expect(result.name).toBe("Sin nombre");
    expect(result.initials).toBe("SN");
    expect(result.folio).toBe("003");
  });
});