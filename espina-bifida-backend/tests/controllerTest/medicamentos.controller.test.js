import { jest } from "@jest/globals";

const mockGetMedicamentos = jest.fn();
const mockGetMedicamentosDisponibles = jest.fn();
const mockGuardarEventoMedicinas = jest.fn();

jest.unstable_mockModule("../../modulos/fiorella/medicamentos/medicamentosservice.js", () => ({
  getMedicamentos: mockGetMedicamentos,
  getMedicamentosDisponibles: mockGetMedicamentosDisponibles,
  guardarEventoMedicinas: mockGuardarEventoMedicinas,
}));

const {
  listarMedicamentos,
  listarMedicamentosDisponibles,
  guardarConsulta,
} = await import("../../modulos/fiorella/medicamentos/medicamentoscontroller.js");

function mockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

describe("medicamentoscontroller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  test("listarMedicamentos responde con medicamentos", async () => {
    const req = {};
    const res = mockRes();

    const data = [{ medicinaId: 1, descripcion: "Paracetamol" }];
    mockGetMedicamentos.mockResolvedValue(data);

    await listarMedicamentos(req, res);

    expect(mockGetMedicamentos).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      ok: true,
      data,
    });
  });

  test("listarMedicamentos responde 500 si falla el service", async () => {
    const req = {};
    const res = mockRes();

    mockGetMedicamentos.mockRejectedValue(new Error("Error medicamentos"));

    await listarMedicamentos(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      message: "Error medicamentos",
    });
  });

  test("listarMedicamentosDisponibles convierte ids en arreglo numérico", async () => {
    const req = { query: { ids: "1,2,3" } };
    const res = mockRes();

    const data = [{ medicinaId: 4, descripcion: "Ibuprofeno" }];
    mockGetMedicamentosDisponibles.mockResolvedValue(data);

    await listarMedicamentosDisponibles(req, res);

    expect(mockGetMedicamentosDisponibles).toHaveBeenCalledWith([1, 2, 3]);
    expect(res.json).toHaveBeenCalledWith({
      ok: true,
      data,
    });
  });

  test("listarMedicamentosDisponibles manda arreglo vacío si no hay ids", async () => {
    const req = { query: {} };
    const res = mockRes();

    mockGetMedicamentosDisponibles.mockResolvedValue([]);

    await listarMedicamentosDisponibles(req, res);

    expect(mockGetMedicamentosDisponibles).toHaveBeenCalledWith([]);
    expect(res.json).toHaveBeenCalledWith({
      ok: true,
      data: [],
    });
  });

  test("listarMedicamentosDisponibles responde 500 si falla el service", async () => {
    const req = { query: { ids: "1,2" } };
    const res = mockRes();

    mockGetMedicamentosDisponibles.mockRejectedValue(new Error("Error"));

    await listarMedicamentosDisponibles(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      message: "Error al obtener medicamentos disponibles",
    });
  });

  test("guardarConsulta guarda evento de medicamentos", async () => {
    const req = {
      body: {
        pacienteId: 1,
        medicamentos: [{ medicinaId: 2, cantidad: 3 }],
      },
    };
    const res = mockRes();

    mockGuardarEventoMedicinas.mockResolvedValue({ eventoId: 80 });

    await guardarConsulta(req, res);

    expect(mockGuardarEventoMedicinas).toHaveBeenCalledWith(1, [
      { medicinaId: 2, cantidad: 3 },
    ]);

    expect(res.json).toHaveBeenCalledWith({
      ok: true,
      eventoId: 80,
    });
  });

  test("guardarConsulta responde 500 si falla al guardar", async () => {
    const req = {
      body: {
        pacienteId: 1,
        medicamentos: [{ medicinaId: 2, cantidad: 3 }],
      },
    };
    const res = mockRes();

    mockGuardarEventoMedicinas.mockRejectedValue(new Error("No se pudo guardar"));

    await guardarConsulta(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      message: "No se pudo guardar",
    });
  });
});