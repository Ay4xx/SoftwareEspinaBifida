import { jest } from "@jest/globals";

const mockExecute = jest.fn();
const mockClose = jest.fn();
const mockGetConnection = jest.fn();
const mockObtenerMembresiaPorPacienteId = jest.fn();

jest.unstable_mockModule("../../config/db.js", () => ({
  getConnection: mockGetConnection,
}));

jest.unstable_mockModule("../../modulos/membresia/membresia.service.js", () => ({
  obtenerMembresiaPorPacienteId: mockObtenerMembresiaPorPacienteId,
}));

jest.unstable_mockModule("oracledb", () => ({
  default: {
    OUT_FORMAT_OBJECT: "OUT_FORMAT_OBJECT",
  },
  OUT_FORMAT_OBJECT: "OUT_FORMAT_OBJECT",
}));

const { getPacienteDetalle } = await import("../../modulos/fiorella/detallepaciente/detallepaciente.service.js");

function setupConnection() {
  const conn = {
    execute: mockExecute,
    close: mockClose,
  };

  mockGetConnection.mockResolvedValue(conn);
  return conn;
}

describe("detallepaciente.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getPacienteDetalle retorna null si no encuentra paciente", async () => {
    setupConnection();

    mockExecute.mockResolvedValue({
      rows: [],
    });

    const result = await getPacienteDetalle("999");

    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("FROM PACIENTE"),
      { pacienteId: 999 },
      { outFormat: "OUT_FORMAT_OBJECT" }
    );

    expect(result).toBeNull();
    expect(mockObtenerMembresiaPorPacienteId).not.toHaveBeenCalled();
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("getPacienteDetalle retorna datos del paciente con membresía", async () => {
    setupConnection();

    mockExecute.mockResolvedValue({
      rows: [
        {
          PACIENTE_ID: 1,
          NOMBRE: "Juan",
          APELLIDO: "Pérez",
          EMAIL: "juan@test.com",
          EMERGENCIA_TELEFONO: "8112345678",
          ESTADO_RESIDENCIA: "Nuevo León",
          FECHA_ALTA: "2026-01-01",
        },
      ],
    });

    mockObtenerMembresiaPorPacienteId.mockResolvedValue({
      FECHA_INICIO: "2026-01-10",
      FECHA_FIN: "2027-01-10",
    });

    const result = await getPacienteDetalle("1");

    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("WHERE p.PACIENTE_ID = :pacienteId"),
      { pacienteId: 1 },
      { outFormat: "OUT_FORMAT_OBJECT" }
    );

    expect(mockObtenerMembresiaPorPacienteId).toHaveBeenCalledWith("1");

    expect(result).toEqual({
      PACIENTE_ID: 1,
      NOMBRE: "Juan",
      APELLIDO: "Pérez",
      EMAIL: "juan@test.com",
      EMERGENCIA_TELEFONO: "8112345678",
      ESTADO_RESIDENCIA: "Nuevo León",
      FECHA_ALTA: new Date("2026-01-01").toISOString(),
      FECHA_INICIO: new Date("2026-01-10").toISOString(),
      FECHA_FIN: new Date("2027-01-10").toISOString(),
    });

    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("getPacienteDetalle maneja campos null y membresía inexistente", async () => {
    setupConnection();

    mockExecute.mockResolvedValue({
      rows: [
        {
          PACIENTE_ID: 2,
          NOMBRE: null,
          APELLIDO: null,
          EMAIL: null,
          EMERGENCIA_TELEFONO: null,
          ESTADO_RESIDENCIA: null,
          FECHA_ALTA: null,
        },
      ],
    });

    mockObtenerMembresiaPorPacienteId.mockResolvedValue(null);

    const result = await getPacienteDetalle("2");

    expect(result).toEqual({
      PACIENTE_ID: 2,
      NOMBRE: null,
      APELLIDO: null,
      EMAIL: null,
      EMERGENCIA_TELEFONO: null,
      ESTADO_RESIDENCIA: null,
      FECHA_ALTA: null,
      FECHA_INICIO: null,
      FECHA_FIN: null,
    });

    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("cierra conexión aunque ocurra un error", async () => {
    setupConnection();

    mockExecute.mockRejectedValue(new Error("Error detalle"));

    await expect(getPacienteDetalle("1")).rejects.toThrow("Error detalle");

    expect(mockClose).toHaveBeenCalledTimes(1);
  });
});