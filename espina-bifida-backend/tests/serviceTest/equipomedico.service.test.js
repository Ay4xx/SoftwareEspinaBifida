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
    BIND_OUT: "BIND_OUT",
    NUMBER: "NUMBER",
  },
  OUT_FORMAT_OBJECT: "OUT_FORMAT_OBJECT",
  BIND_OUT: "BIND_OUT",
  NUMBER: "NUMBER",
}));

const {
  getEquipoMedico,
  getEquipoDisponibles,
  guardarEventoEquipoMedico,
} = await import("../../modulos/fiorella/equipomedico/equipomedicoservice.js");

function setupConnection() {
  const conn = {
    execute: mockExecute,
    close: mockClose,
  };

  mockGetConnection.mockResolvedValue(conn);
  return conn;
}

describe("equipomedicoservice", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-06-09T12:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("getEquipoMedico retorna equipo médico disponible", async () => {
    setupConnection();

    const rows = [
      {
        EQUIPO_M_ID: 1,
        DESCRIPCION: "Silla de ruedas",
        PRECIO: 1500,
        CANTIDAD_TOTAL: 4,
      },
    ];

    mockExecute.mockResolvedValue({ rows });

    const result = await getEquipoMedico();

    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("FROM INVENTARIO_EQUIPO_MEDICO"),
      [],
      { outFormat: "OUT_FORMAT_OBJECT" }
    );

    expect(result).toEqual(rows);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("getEquipoDisponibles sin ids usa arreglo vacío en binds", async () => {
    setupConnection();

    const rows = [
      {
        EQUIPO_M_ID: 1,
        DESCRIPCION: "Andadera",
      },
    ];

    mockExecute.mockResolvedValue({ rows });

    const result = await getEquipoDisponibles();

    expect(mockExecute).toHaveBeenCalledWith(
      expect.not.stringContaining("NOT IN"),
      [],
      { outFormat: "OUT_FORMAT_OBJECT" }
    );

    expect(result).toEqual(rows);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("getEquipoDisponibles con ids excluye equipos seleccionados", async () => {
    setupConnection();

    const rows = [
      {
        EQUIPO_M_ID: 3,
        DESCRIPCION: "Muletas",
      },
    ];

    mockExecute.mockResolvedValue({ rows });

    const result = await getEquipoDisponibles([1, 2]);

    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("EQUIPO_M_ID NOT IN (:id0, :id1)"),
      {
        id0: 1,
        id1: 2,
      },
      { outFormat: "OUT_FORMAT_OBJECT" }
    );

    expect(result).toEqual(rows);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("guardarEventoEquipoMedico calcula cuota, arma listas y retorna eventoId", async () => {
    setupConnection();

    mockExecute.mockResolvedValue({
      outBinds: {
        eventoId: 77,
      },
    });

    const equipos = [
      {
        EQUIPO_M_ID: 1,
        PRECIO: 100,
        cantidad: 2,
        fechaFinal: "2026-06-20",
      },
      {
        EQUIPO_M_ID: 2,
        PRECIO: 50,
        cantidad: 3,
        fechaFinal: "2026-06-25",
      },
    ];

    const result = await guardarEventoEquipoMedico("9", equipos);

    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("insertar_evento_equipo"),
      expect.objectContaining({
        pacienteId: 9,
        cuota: 350,
        id0: "1",
        id1: "2",
        cant0: 2,
        cant1: 3,
        fini0: "2026-06-09",
        fini1: "2026-06-09",
        ffin0: "2026-06-20",
        ffin1: "2026-06-25",
        reg0: "NO",
        reg1: "NO",
        eventoId: {
          dir: "BIND_OUT",
          type: "NUMBER",
        },
      })
    );

    expect(result).toEqual({
      eventoId: 77,
    });

    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("cierra conexión aunque ocurra un error", async () => {
    setupConnection();

    mockExecute.mockRejectedValue(new Error("Error equipo"));

    await expect(getEquipoMedico()).rejects.toThrow("Error equipo");

    expect(mockClose).toHaveBeenCalledTimes(1);
  });
});