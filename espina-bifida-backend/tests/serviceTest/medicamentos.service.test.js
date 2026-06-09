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
  getMedicamentos,
  getMedicamentosDisponibles,
  guardarEventoMedicinas,
} = await import("../../modulos/fiorella/medicamentos/medicamentosservice.js");

function setupConnection() {
  const conn = {
    execute: mockExecute,
    close: mockClose,
  };

  mockGetConnection.mockResolvedValue(conn);
  return conn;
}

describe("medicamentosservice", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getMedicamentos retorna medicamentos con cantidad mayor a 0", async () => {
    setupConnection();

    const rows = [
      {
        MEDICINA_ID: 1,
        DESCRIPCION: "Paracetamol",
        PRECIO: 100,
        UNIDAD: "Caja",
        CANTIDAD_TOTAL: 20,
      },
    ];

    mockExecute.mockResolvedValue({ rows });

    const result = await getMedicamentos();

    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("FROM INVENTARIO_MEDICINAS"),
      [],
      { outFormat: "OUT_FORMAT_OBJECT" }
    );

    expect(result).toEqual(rows);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("getMedicamentosDisponibles sin ids usa arreglo vacío en binds", async () => {
    setupConnection();

    const rows = [
      {
        MEDICINA_ID: 1,
        DESCRIPCION: "Paracetamol",
      },
    ];

    mockExecute.mockResolvedValue({ rows });

    const result = await getMedicamentosDisponibles();

    expect(mockExecute).toHaveBeenCalledWith(
      expect.not.stringContaining("NOT IN"),
      [],
      { outFormat: "OUT_FORMAT_OBJECT" }
    );

    expect(result).toEqual(rows);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("getMedicamentosDisponibles con ids excluye medicamentos seleccionados", async () => {
    setupConnection();

    const rows = [
      {
        MEDICINA_ID: 3,
        DESCRIPCION: "Ibuprofeno",
      },
    ];

    mockExecute.mockResolvedValue({ rows });

    const result = await getMedicamentosDisponibles([1, 2]);

    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("MEDICINA_ID NOT IN (:id0, :id1)"),
      {
        id0: 1,
        id1: 2,
      },
      { outFormat: "OUT_FORMAT_OBJECT" }
    );

    expect(result).toEqual(rows);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("guardarEventoMedicinas calcula cuota, arma listas y retorna eventoId", async () => {
    setupConnection();

    mockExecute.mockResolvedValue({
      outBinds: {
        eventoId: 99,
      },
    });

    const medicamentos = [
      {
        MEDICINA_ID: 1,
        PRECIO: 100,
        cantidad: 2,
      },
      {
        MEDICINA_ID: 2,
        PRECIO: 50,
        cantidad: 3,
      },
    ];

    const result = await guardarEventoMedicinas("10", medicamentos);

    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("insertar_evento_medicinas"),
      expect.objectContaining({
        pacienteId: 10,
        cuota: 350,
        id0: "1",
        id1: "2",
        cant0: 2,
        cant1: 3,
        eventoId: {
          dir: "BIND_OUT",
          type: "NUMBER",
        },
      })
    );

    expect(result).toEqual({
      eventoId: 99,
    });

    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("cierra conexión aunque ocurra un error", async () => {
    setupConnection();

    mockExecute.mockRejectedValue(new Error("Error medicamentos"));

    await expect(getMedicamentos()).rejects.toThrow("Error medicamentos");

    expect(mockClose).toHaveBeenCalledTimes(1);
  });
});