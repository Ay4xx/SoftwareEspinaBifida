import { jest } from "@jest/globals";

const mockGetPacienteDetalle = jest.fn();

jest.unstable_mockModule("../../modulos/fiorella/detallepaciente/detallepaciente.service.js", () => ({
  getPacienteDetalle: mockGetPacienteDetalle,
}));

const { listarPacienteDetalle } = await import("../../modulos/fiorella/detallepaciente/detallepaciente.controller.js");

function mockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

describe("detallepaciente.controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  test("listarPacienteDetalle responde con el detalle del paciente", async () => {
    const req = { params: { pacienteId: "1" } };
    const res = mockRes();

    const data = {
      pacienteId: 1,
      nombre: "Juan",
      apellido: "Pérez",
    };

    mockGetPacienteDetalle.mockResolvedValue(data);

    await listarPacienteDetalle(req, res);

    expect(mockGetPacienteDetalle).toHaveBeenCalledWith("1");
    expect(res.json).toHaveBeenCalledWith({
      ok: true,
      data,
    });
  });

  test("listarPacienteDetalle responde 404 si no encuentra paciente", async () => {
    const req = { params: { pacienteId: "999" } };
    const res = mockRes();

    mockGetPacienteDetalle.mockResolvedValue(null);

    await listarPacienteDetalle(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      message: "Paciente no encontrado",
    });
  });

  test("listarPacienteDetalle responde 500 si falla el service", async () => {
    const req = { params: { pacienteId: "1" } };
    const res = mockRes();

    mockGetPacienteDetalle.mockRejectedValue(new Error("Error de base de datos"));

    await listarPacienteDetalle(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      message: "Error de base de datos",
    });
  });
});