import { jest, describe, beforeEach, afterEach, test, expect } from "@jest/globals";

const mockGetPacienteCards = jest.fn();
const mockGetPacienteCompleto = jest.fn();
const mockGetPacienteCredencial = jest.fn();
const mockGetPacienteDetalle = jest.fn();
const mockGuardarFoto = jest.fn();
const mockObtenerFotoService = jest.fn();
const mockUpdatePaciente = jest.fn();
const mockUpdateHistorialMadre = jest.fn();

jest.unstable_mockModule("../../modulos/paciente/paciente.service.js", () => ({
  getPacienteCards: mockGetPacienteCards,
  getPacienteDetail: jest.fn(),
  getPacienteCredencial: mockGetPacienteCredencial,
  getPacienteDetalle: mockGetPacienteDetalle,
  getPacienteCompleto: mockGetPacienteCompleto,
  guardarFoto: mockGuardarFoto,
  obtenerFoto: mockObtenerFotoService,
  updatePaciente: mockUpdatePaciente,
  updateHistorialMadre: mockUpdateHistorialMadre,
}));

const {
  listarPacienteCards,
  obtenerPacientePorId,
  obtenerPacienteCredencial,
  obtenerPacienteDetalle,
  subirFoto,
  obtenerFoto,
  actualizarPaciente,
} = await import("../../modulos/paciente/paciente.controller.js");

function createMockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.set = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
}

describe("paciente.controller.js", () => {
  let consoleSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe("listarPacienteCards", () => {
    test("debe listar pacientes correctamente", async () => {
      const req = { query: { search: "juan" } };
      const res = createMockRes();

      const data = [{ id: 1, name: "Juan Pérez" }];
      mockGetPacienteCards.mockResolvedValue(data);

      await listarPacienteCards(req, res);

      expect(mockGetPacienteCards).toHaveBeenCalledWith("juan");
      expect(res.json).toHaveBeenCalledWith({ ok: true, data });
    });

    test("debe responder 500 si ocurre error", async () => {
      const req = { query: { search: "" } };
      const res = createMockRes();

      mockGetPacienteCards.mockRejectedValue(new Error("DB error"));

      await listarPacienteCards(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Error al obtener pacientes",
      });
    });
  });

  describe("obtenerPacientePorId", () => {
    test("debe obtener paciente por id", async () => {
      const req = { params: { id: "5" } };
      const res = createMockRes();

      const paciente = { PACIENTE_ID: 5, NOMBRE: "Ana" };
      mockGetPacienteCompleto.mockResolvedValue(paciente);

      await obtenerPacientePorId(req, res);

      expect(mockGetPacienteCompleto).toHaveBeenCalledWith("5");
      expect(res.json).toHaveBeenCalledWith({ ok: true, data: paciente });
    });

    test("debe responder 404 si no encuentra paciente", async () => {
      const req = { params: { id: "99" } };
      const res = createMockRes();

      mockGetPacienteCompleto.mockResolvedValue(null);

      await obtenerPacientePorId(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Paciente no encontrado",
      });
    });

    test("debe responder 500 si ocurre error", async () => {
      const req = { params: { id: "5" } };
      const res = createMockRes();

      mockGetPacienteCompleto.mockRejectedValue(new Error("Error"));

      await obtenerPacientePorId(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Error al obtener el paciente",
      });
    });
  });

  describe("obtenerPacienteCredencial", () => {
    test("debe obtener credencial del paciente", async () => {
      const req = { params: { pacienteId: "10" } };
      const res = createMockRes();

      const credencial = { folio: "010", nombre: "Luis" };
      mockGetPacienteCredencial.mockResolvedValue(credencial);

      await obtenerPacienteCredencial(req, res);

      expect(mockGetPacienteCredencial).toHaveBeenCalledWith(10);
      expect(res.json).toHaveBeenCalledWith({ ok: true, data: credencial });
    });

    test("debe responder 404 si no existe credencial", async () => {
      const req = { params: { pacienteId: "10" } };
      const res = createMockRes();

      mockGetPacienteCredencial.mockResolvedValue(null);

      await obtenerPacienteCredencial(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Paciente no encontrado",
      });
    });

    test("debe responder 500 si ocurre error", async () => {
      const req = { params: { pacienteId: "10" } };
      const res = createMockRes();

      mockGetPacienteCredencial.mockRejectedValue(new Error("Fallo"));

      await obtenerPacienteCredencial(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Error interno del servidor",
        error: "Fallo",
      });
    });
  });

  describe("obtenerPacienteDetalle", () => {
    test("debe obtener detalle del paciente", async () => {
      const req = { params: { id: "3" } };
      const res = createMockRes();

      const paciente = { PACIENTE_ID: 3, NOMBRE: "María" };
      mockGetPacienteDetalle.mockResolvedValue(paciente);

      await obtenerPacienteDetalle(req, res);

      expect(mockGetPacienteDetalle).toHaveBeenCalledWith("3");
      expect(res.json).toHaveBeenCalledWith({ ok: true, data: paciente });
    });

    test("debe responder 404 si no existe detalle", async () => {
      const req = { params: { id: "3" } };
      const res = createMockRes();

      mockGetPacienteDetalle.mockResolvedValue(null);

      await obtenerPacienteDetalle(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Paciente no encontrado",
      });
    });
  });

  describe("subirFoto", () => {
    test("debe subir foto correctamente", async () => {
      const buffer = Buffer.from("imagen");
      const req = {
        params: { id: "8" },
        file: { buffer },
      };
      const res = createMockRes();

      mockGuardarFoto.mockResolvedValue();

      await subirFoto(req, res);

      expect(mockGuardarFoto).toHaveBeenCalledWith("8", buffer);
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        message: "Foto guardada correctamente",
      });
    });

    test("debe responder 400 si no se manda imagen", async () => {
      const req = {
        params: { id: "8" },
        file: null,
      };
      const res = createMockRes();

      await subirFoto(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "No se recibió ninguna imagen",
      });
    });
  });

  describe("obtenerFoto", () => {
    test("debe obtener foto y enviarla como jpeg", async () => {
      const foto = Buffer.from("imagen");
      const req = { params: { id: "4" } };
      const res = createMockRes();

      mockObtenerFotoService.mockResolvedValue(foto);

      await obtenerFoto(req, res);

      expect(mockObtenerFotoService).toHaveBeenCalledWith("4");
      expect(res.set).toHaveBeenCalledWith("Content-Type", "image/jpeg");
      expect(res.send).toHaveBeenCalledWith(foto);
    });

    test("debe responder 404 si no hay foto", async () => {
      const req = { params: { id: "4" } };
      const res = createMockRes();

      mockObtenerFotoService.mockResolvedValue(null);

      await obtenerFoto(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Foto no encontrada",
      });
    });
  });

  describe("actualizarPaciente", () => {
    test("debe actualizar paciente e historial de madre", async () => {
      const req = {
        params: { id: "15" },
        body: { nombre: "Carlos" },
        file: { buffer: Buffer.from("foto") },
      };
      const res = createMockRes();

      mockUpdatePaciente.mockResolvedValue();
      mockUpdateHistorialMadre.mockResolvedValue();

      await actualizarPaciente(req, res);

      expect(mockUpdatePaciente).toHaveBeenCalledWith(15, req.body, req.file);
      expect(mockUpdateHistorialMadre).toHaveBeenCalledWith(15, req.body);
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        message: "Paciente actualizado correctamente",
      });
    });

    test("debe responder 500 si falla actualización", async () => {
      const req = {
        params: { id: "15" },
        body: {},
        file: null,
      };
      const res = createMockRes();

      mockUpdatePaciente.mockRejectedValue(new Error("No se pudo actualizar"));

      await actualizarPaciente(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "No se pudo actualizar",
      });
    });
  });
});