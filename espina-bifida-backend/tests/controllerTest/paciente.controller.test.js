import { jest, describe, it, expect, beforeEach, afterEach } from "@jest/globals";

const mockGetPacienteCards = jest.fn();
const mockGetPacienteDetail = jest.fn();
const mockGetPacienteCredencial = jest.fn();
const mockGetPacienteDetalle = jest.fn();
const mockGetPacienteCompleto = jest.fn();
const mockGuardarFoto = jest.fn();
const mockObtenerFotoService = jest.fn();
const mockUpdatePaciente = jest.fn();
const mockUpdateHistorialMadre = jest.fn();
const mockBorrarPacienteService = jest.fn();

jest.unstable_mockModule("../../modulos/paciente/paciente.service.js", () => ({
  getPacienteCards: mockGetPacienteCards,
  getPacienteDetail: mockGetPacienteDetail,
  getPacienteCredencial: mockGetPacienteCredencial,
  getPacienteDetalle: mockGetPacienteDetalle,
  getPacienteCompleto: mockGetPacienteCompleto,
  guardarFoto: mockGuardarFoto,
  obtenerFoto: mockObtenerFotoService,
  updatePaciente: mockUpdatePaciente,
  updateHistorialMadre: mockUpdateHistorialMadre,
  borrarPacienteService: mockBorrarPacienteService,
}));

const controller = await import("../../modulos/paciente/paciente.controller.js");

function mockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  };
}

describe("paciente.controller.js", () => {
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => consoleErrorSpy.mockRestore());

  it("listarPacienteCards responde con pacientes", async () => {
    const data = [{ paciente_id: 1, nombre: "Ana" }];
    mockGetPacienteCards.mockResolvedValue(data);
    const res = mockRes();

    await controller.listarPacienteCards({ query: { search: "Ana" } }, res);

    expect(mockGetPacienteCards).toHaveBeenCalledWith("Ana");
    expect(res.json).toHaveBeenCalledWith({ ok: true, data });
  });

  it("listarPacienteCards responde 500 si falla", async () => {
    mockGetPacienteCards.mockRejectedValue(new Error("DB error"));
    const res = mockRes();

    await controller.listarPacienteCards({ query: {} }, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ ok: false, message: "Error al obtener pacientes" });
  });

  it("obtenerPacientePorId responde con paciente completo", async () => {
    const paciente = { paciente_id: 10, nombre: "Luis" };
    mockGetPacienteCompleto.mockResolvedValue(paciente);
    const res = mockRes();

    await controller.obtenerPacientePorId({ params: { id: "10" } }, res);

    expect(mockGetPacienteCompleto).toHaveBeenCalledWith("10");
    expect(res.json).toHaveBeenCalledWith({ ok: true, data: paciente });
  });

  it("obtenerPacientePorId responde 404 si no existe", async () => {
    mockGetPacienteCompleto.mockResolvedValue(null);
    const res = mockRes();

    await controller.obtenerPacientePorId({ params: { id: "99" } }, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ ok: false, message: "Paciente no encontrado" });
  });

  it("obtenerPacientePorId responde 500 si falla", async () => {
    mockGetPacienteCompleto.mockRejectedValue(new Error("fallo"));
    const res = mockRes();

    await controller.obtenerPacientePorId({ params: { id: "10" } }, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ ok: false, message: "Error al obtener el paciente" });
  });

  it("obtenerPacienteCredencial convierte pacienteId a Number", async () => {
    const credencial = { paciente_id: 7, folio: "ABC" };
    mockGetPacienteCredencial.mockResolvedValue(credencial);
    const res = mockRes();

    await controller.obtenerPacienteCredencial({ params: { pacienteId: "7" } }, res);

    expect(mockGetPacienteCredencial).toHaveBeenCalledWith(7);
    expect(res.json).toHaveBeenCalledWith({ ok: true, data: credencial });
  });

  it("obtenerPacienteCredencial responde 404 si no hay credencial", async () => {
    mockGetPacienteCredencial.mockResolvedValue(null);
    const res = mockRes();

    await controller.obtenerPacienteCredencial({ params: { pacienteId: "7" } }, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ ok: false, message: "Paciente no encontrado" });
  });

  it("obtenerPacienteCredencial responde 500 si falla", async () => {
    mockGetPacienteCredencial.mockRejectedValue(new Error("credencial error"));
    const res = mockRes();

    await controller.obtenerPacienteCredencial({ params: { pacienteId: "7" } }, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ ok: false, message: "Error interno del servidor", error: "credencial error" });
  });

  it("obtenerPacienteDetalle responde con detalle", async () => {
    const paciente = { paciente_id: 4, ciudad: "Monterrey" };
    mockGetPacienteDetalle.mockResolvedValue(paciente);
    const res = mockRes();

    await controller.obtenerPacienteDetalle({ params: { id: "4" } }, res);

    expect(mockGetPacienteDetalle).toHaveBeenCalledWith("4");
    expect(res.json).toHaveBeenCalledWith({ ok: true, data: paciente });
  });

  it("obtenerPacienteDetalle responde 404 si no existe", async () => {
    mockGetPacienteDetalle.mockResolvedValue(undefined);
    const res = mockRes();

    await controller.obtenerPacienteDetalle({ params: { id: "4" } }, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ ok: false, message: "Paciente no encontrado" });
  });

  it("subirFoto guarda req.file.buffer", async () => {
    const buffer = Buffer.from("imagen");
    const res = mockRes();

    await controller.subirFoto({ params: { id: "3" }, file: { buffer } }, res);

    expect(mockGuardarFoto).toHaveBeenCalledWith("3", buffer);
    expect(res.json).toHaveBeenCalledWith({ ok: true, message: "Foto guardada correctamente" });
  });

  it("subirFoto responde 400 si no recibe imagen", async () => {
    const res = mockRes();

    await controller.subirFoto({ params: { id: "3" } }, res);

    expect(mockGuardarFoto).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ ok: false, message: "No se recibió ninguna imagen" });
  });

  it("subirFoto responde 500 si guardarFoto falla", async () => {
    mockGuardarFoto.mockRejectedValue(new Error("foto error"));
    const res = mockRes();

    await controller.subirFoto({ params: { id: "3" }, file: { buffer: Buffer.from("x") } }, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ ok: false, message: "Error al guardar la foto", error: "foto error" });
  });

  it("obtenerFoto envía imagen jpeg", async () => {
    const foto = Buffer.from("foto");
    mockObtenerFotoService.mockResolvedValue(foto);
    const res = mockRes();

    await controller.obtenerFoto({ params: { id: "8" } }, res);

    expect(mockObtenerFotoService).toHaveBeenCalledWith("8");
    expect(res.set).toHaveBeenCalledWith("Content-Type", "image/jpeg");
    expect(res.send).toHaveBeenCalledWith(foto);
  });

  it("obtenerFoto responde 404 si no encuentra foto", async () => {
    mockObtenerFotoService.mockResolvedValue(null);
    const res = mockRes();

    await controller.obtenerFoto({ params: { id: "8" } }, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ ok: false, message: "Foto no encontrada" });
  });

  it("obtenerFoto responde 500 si falla", async () => {
    mockObtenerFotoService.mockRejectedValue(new Error("lob error"));
    const res = mockRes();

    await controller.obtenerFoto({ params: { id: "8" } }, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ ok: false, message: "Error al obtener la foto", error: "lob error" });
  });

  it("actualizarPaciente parsea tutores string y actualiza", async () => {
    const file = { buffer: Buffer.from("foto") };
    const req = {
      params: { id: "12" },
      body: { nombre: "Marta", tutores: JSON.stringify([{ nombre: "Tutor" }]) },
      file,
    };
    const res = mockRes();

    await controller.actualizarPaciente(req, res);

    expect(req.body.tutores).toEqual([{ nombre: "Tutor" }]);
    expect(mockUpdatePaciente).toHaveBeenCalledWith(12, req.body, file);
    expect(mockUpdateHistorialMadre).toHaveBeenCalledWith(12, req.body);
    expect(res.json).toHaveBeenCalledWith({ ok: true, message: "Paciente actualizado correctamente" });
  });

  it("actualizarPaciente responde 500 si falla", async () => {
    mockUpdatePaciente.mockRejectedValue(new Error("update error"));
    const res = mockRes();

    await controller.actualizarPaciente({ params: { id: "12" }, body: { nombre: "Marta" } }, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ ok: false, message: "update error" });
  });

  it("borrarPaciente elimina correctamente", async () => {
    mockBorrarPacienteService.mockResolvedValue(true);
    const res = mockRes();

    await controller.borrarPaciente({ params: { id: "5" } }, res);

    expect(mockBorrarPacienteService).toHaveBeenCalledWith("5");
    expect(res.json).toHaveBeenCalledWith({ ok: true, message: "Paciente eliminado correctamente" });
  });

  it("borrarPaciente responde 400 si falta id", async () => {
    const res = mockRes();

    await controller.borrarPaciente({ params: {} }, res);

    expect(mockBorrarPacienteService).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ ok: false, message: "Falta el id del paciente" });
  });

  it("borrarPaciente responde 404 si no existe", async () => {
    mockBorrarPacienteService.mockResolvedValue(false);
    const res = mockRes();

    await controller.borrarPaciente({ params: { id: "5" } }, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ ok: false, message: "No se encontró el paciente" });
  });

  it("borrarPaciente responde 500 si falla", async () => {
    mockBorrarPacienteService.mockRejectedValue(new Error("delete error"));
    const res = mockRes();

    await controller.borrarPaciente({ params: { id: "5" } }, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ ok: false, message: "Error interno del servidor" });
  });
});
