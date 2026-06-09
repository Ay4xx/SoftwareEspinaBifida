import { jest } from "@jest/globals";

const mockExecute = jest.fn();
const mockClose = jest.fn();
const mockGetConnection = jest.fn();

jest.unstable_mockModule("../../config/db.js", () => ({
  getConnection: mockGetConnection,
}));

jest.unstable_mockModule("oracledb", () => ({
  default: {
    OUT_FORMAT_OBJECT: "OUT_FORMAT_OBJECT",
  },
  OUT_FORMAT_OBJECT: "OUT_FORMAT_OBJECT",
}));

const {
  getMedicos,
  getServiciosByMedico,
  guardarEventoServicio,
  getMedicosConServicios,
} = await import("../../modulos/fiorella/medicoservice.js");

function setupConnection() {
  const conn = {
    execute: mockExecute,
    close: mockClose,
  };

  mockGetConnection.mockResolvedValue(conn);
  return conn;
}

describe("medicoservice", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getMedicos retorna médicos", async () => {
    setupConnection();

    const rows = [
      {
        MEDICO_ID: 1,
        NOMBRE: "Juan",
        APELLIDO: "Pérez",
        ESPECIALIDAD: "General",
      },
    ];

    mockExecute.mockResolvedValue({ rows });

    const result = await getMedicos();

    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("FROM MEDICO"),
      [],
      { outFormat: "OUT_FORMAT_OBJECT" }
    );

    expect(result).toEqual(rows);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("getServiciosByMedico retorna servicios del médico", async () => {
    setupConnection();

    const rows = [
      {
        MEDICO_ID: 1,
        SERVICIO_ID: 2,
        NOMBRE_SERVICIO: "Consulta",
        COSTO: 300,
      },
    ];

    mockExecute.mockResolvedValue({ rows });

    const result = await getServiciosByMedico("1");

    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("WHERE MEDICO_ID = :medicoId"),
      { medicoId: 1 },
      { outFormat: "OUT_FORMAT_OBJECT" }
    );

    expect(result).toEqual(rows);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("guardarEventoServicio ejecuta procedimiento y retorna ok true", async () => {
    setupConnection();

    mockExecute.mockResolvedValue({});

    const result = await guardarEventoServicio(
      "1",
      "2026-06-09",
      "300",
      "5",
      "10:30"
    );

    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("insertar_evento_servicio"),
      expect.objectContaining({
        pacienteId: 1,
        cuota: 300,
        servicioId: 5,
        horaCita: "10:30",
      })
    );

    const binds = mockExecute.mock.calls[0][1];
    expect(binds.fechaEvento).toBeInstanceOf(Date);

    expect(result).toEqual({ ok: true });
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("getMedicosConServicios retorna médicos con servicios", async () => {
    setupConnection();

    const rows = [
      {
        MEDICO_ID: 1,
        NOMBRE: "Juan",
        APELLIDO: "Pérez",
        ESPECIALIDAD: "General",
        SERVICIO_ID: 10,
        COSTO: 300,
      },
    ];

    mockExecute.mockResolvedValue({ rows });

    const result = await getMedicosConServicios();

    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("LEFT JOIN SERVICIOS"),
      [],
      { outFormat: "OUT_FORMAT_OBJECT" }
    );

    expect(result).toEqual(rows);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("cierra conexión aunque ocurra un error", async () => {
    setupConnection();

    mockExecute.mockRejectedValue(new Error("Error DB"));

    await expect(getMedicos()).rejects.toThrow("Error DB");

    expect(mockClose).toHaveBeenCalledTimes(1);
  });
});