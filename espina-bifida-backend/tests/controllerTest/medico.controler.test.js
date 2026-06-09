import { jest } from "@jest/globals";

const mockGetMedicosConServicios = jest.fn();
const mockGetServiciosByMedico = jest.fn();
const mockGuardarEventoServicio = jest.fn();

jest.unstable_mockModule("../../modulos/fiorella/medicoservice.js", () => ({
  getMedicos: jest.fn(),
  getServiciosByMedico: mockGetServiciosByMedico,
  guardarEventoServicio: mockGuardarEventoServicio,
  getMedicosConServicios: mockGetMedicosConServicios,
}));

const {
  listarMedicos,
  listarServiciosPorMedico,
  guardarConsultaServicio,
} = await import("../../modulos/fiorella/medicocontroller.js");

function mockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

describe("medicocontroller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  test("listarMedicos responde con médicos y servicios", async () => {
    const req = {};
    const res = mockRes();

    const data = [{ medicoId: 1, nombre: "Dr. Juan" }];
    mockGetMedicosConServicios.mockResolvedValue(data);

    await listarMedicos(req, res);

    expect(mockGetMedicosConServicios).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ ok: true, data });
  });

  test("listarMedicos responde 500 si falla el service", async () => {
    const req = {};
    const res = mockRes();

    mockGetMedicosConServicios.mockRejectedValue(new Error("DB error"));

    await listarMedicos(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      message: "Error al obtener médicos",
    });
  });

  test("listarServiciosPorMedico responde con servicios del médico", async () => {
    const req = { params: { medicoId: "10" } };
    const res = mockRes();

    const data = [{ servicioId: 1, nombre: "Consulta" }];
    mockGetServiciosByMedico.mockResolvedValue(data);

    await listarServiciosPorMedico(req, res);

    expect(mockGetServiciosByMedico).toHaveBeenCalledWith("10");
    expect(res.json).toHaveBeenCalledWith({ ok: true, data });
  });

  test("listarServiciosPorMedico responde 500 si falla el service", async () => {
    const req = { params: { medicoId: "10" } };
    const res = mockRes();

    mockGetServiciosByMedico.mockRejectedValue(new Error("Error"));

    await listarServiciosPorMedico(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      message: "Error al obtener servicios",
    });
  });

  test("guardarConsultaServicio guarda una consulta correctamente", async () => {
    const req = {
      body: {
        pacienteId: 1,
        fechaEvento: "2026-06-09",
        cuota: 300,
        servicioId: 5,
        horaCita: "10:00",
      },
    };
    const res = mockRes();

    mockGuardarEventoServicio.mockResolvedValue({ eventoId: 99 });

    await guardarConsultaServicio(req, res);

    expect(mockGuardarEventoServicio).toHaveBeenCalledWith(
      1,
      "2026-06-09",
      300,
      5,
      "10:00"
    );

    expect(res.json).toHaveBeenCalledWith({
      ok: true,
      eventoId: 99,
    });
  });

  test("guardarConsultaServicio responde 500 si falla al guardar", async () => {
    const req = {
      body: {
        pacienteId: 1,
        fechaEvento: "2026-06-09",
        cuota: 300,
        servicioId: 5,
        horaCita: "10:00",
      },
    };
    const res = mockRes();

    mockGuardarEventoServicio.mockRejectedValue(new Error("No se pudo guardar"));

    await guardarConsultaServicio(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      message: "No se pudo guardar",
    });
  });
});