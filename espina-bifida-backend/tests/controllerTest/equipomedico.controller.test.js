import { jest } from "@jest/globals";

const mockGetEquipoMedico = jest.fn();
const mockGetEquipoDisponibles = jest.fn();
const mockGuardarEventoEquipoMedico = jest.fn();

jest.unstable_mockModule("../../modulos/fiorella/equipomedico/equipomedicoservice.js", () => ({
  getEquipoMedico: mockGetEquipoMedico,
  getEquipoDisponibles: mockGetEquipoDisponibles,
  guardarEventoEquipoMedico: mockGuardarEventoEquipoMedico,
}));

const {
  listarEquipo,
  listarEquipoMDisponibles,
  guardarConsultaEquipo,
} = await import("../../modulos/fiorella/equipomedico/equipomedicocontroller.js");

function mockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

describe("equipomedicocontroller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  test("listarEquipo responde con equipo médico", async () => {
    const req = {};
    const res = mockRes();

    const data = [{ equipoId: 1, descripcion: "Silla de ruedas" }];
    mockGetEquipoMedico.mockResolvedValue(data);

    await listarEquipo(req, res);

    expect(mockGetEquipoMedico).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      ok: true,
      data,
    });
  });

  test("listarEquipo responde 500 si falla el service", async () => {
    const req = {};
    const res = mockRes();

    mockGetEquipoMedico.mockRejectedValue(new Error("Error equipo"));

    await listarEquipo(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      message: "Error equipo",
    });
  });

  test("listarEquipoMDisponibles convierte query ids en arreglo numérico", async () => {
    const req = { query: { ids: "1,2,3" } };
    const res = mockRes();

    const data = [{ equipoId: 4, descripcion: "Andadera" }];
    mockGetEquipoDisponibles.mockResolvedValue(data);

    await listarEquipoMDisponibles(req, res);

    expect(mockGetEquipoDisponibles).toHaveBeenCalledWith([1, 2, 3]);
    expect(res.json).toHaveBeenCalledWith({
      ok: true,
      data,
    });
  });

  test("listarEquipoMDisponibles manda arreglo vacío si no hay ids", async () => {
    const req = { query: {} };
    const res = mockRes();

    mockGetEquipoDisponibles.mockResolvedValue([]);

    await listarEquipoMDisponibles(req, res);

    expect(mockGetEquipoDisponibles).toHaveBeenCalledWith([]);
    expect(res.json).toHaveBeenCalledWith({
      ok: true,
      data: [],
    });
  });

  test("listarEquipoMDisponibles responde 500 si falla el service", async () => {
    const req = { query: { ids: "1,2" } };
    const res = mockRes();

    mockGetEquipoDisponibles.mockRejectedValue(new Error("Error"));

    await listarEquipoMDisponibles(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      message: "Error al obtener equipo medico disponibles",
    });
  });

  test("guardarConsultaEquipo guarda evento de equipo médico", async () => {
    const req = {
      body: {
        pacienteId: 1,
        equipos: [{ equipoId: 2, cantidad: 1 }],
      },
    };
    const res = mockRes();

    mockGuardarEventoEquipoMedico.mockResolvedValue({ eventoId: 50 });

    await guardarConsultaEquipo(req, res);

    expect(mockGuardarEventoEquipoMedico).toHaveBeenCalledWith(1, [
      { equipoId: 2, cantidad: 1 },
    ]);

    expect(res.json).toHaveBeenCalledWith({
      ok: true,
      eventoId: 50,
    });
  });

  test("guardarConsultaEquipo responde 500 si falla al guardar", async () => {
    const req = {
      body: {
        pacienteId: 1,
        equipos: [{ equipoId: 2, cantidad: 1 }],
      },
    };
    const res = mockRes();

    mockGuardarEventoEquipoMedico.mockRejectedValue(new Error("No guardado"));

    await guardarConsultaEquipo(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      message: "No guardado",
    });
  });
});