import { jest } from "@jest/globals";

const mockExecute = jest.fn();
const mockClose = jest.fn();
const mockCommit = jest.fn();
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
  insertarMedicina,
  insertarEquipoMedico,
  verificarDuplicado,
  actualizarCantidadMedicina,
  actualizarCantidadEquipo,
  getInventarioCompleto,
  eliminarArticulo,
} = await import("../../modulos/fiorella/regservicios/regservicios.service.js");

function setupConnection() {
  const conn = {
    execute: mockExecute,
    close: mockClose,
    commit: mockCommit,
  };

  mockGetConnection.mockResolvedValue(conn);
  return conn;
}

describe("regservicios.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  test("insertarMedicina inserta medicina y retorna medicina_id", async () => {
    setupConnection();

    mockExecute.mockResolvedValue({
      outBinds: {
        medicina_id: 10,
      },
    });

    const result = await insertarMedicina({
      descripcion: "Paracetamol",
      unidad: "Caja",
      precio: "100.50",
      medicion: "500",
      cantidad_total: "20",
    });

    expect(mockGetConnection).toHaveBeenCalledTimes(1);
    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("insertar_medicina"),
      expect.objectContaining({
        descripcion: "Paracetamol",
        unidad: "Caja",
        precio: 100.5,
        medicion: 500,
        cantidad_total: 20,
        medicina_id: {
          dir: "BIND_OUT",
          type: "NUMBER",
        },
      })
    );

    expect(result).toEqual({
      medicina_id: 10,
    });

    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("insertarEquipoMedico inserta equipo y retorna equipo_m_id", async () => {
    setupConnection();

    mockExecute.mockResolvedValue({
      outBinds: {
        equipo_m_id: 7,
      },
    });

    const result = await insertarEquipoMedico({
      descripcion: "Silla de ruedas",
      precio: "1500.75",
      cantidad_total: "5",
    });

    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("insertar_equipo_medico"),
      expect.objectContaining({
        descripcion: "Silla de ruedas",
        precio: 1500.75,
        cantidad_total: 5,
        equipo_m_id: {
          dir: "BIND_OUT",
          type: "NUMBER",
        },
      })
    );

    expect(result).toEqual({
      equipo_m_id: 7,
    });

    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("verificarDuplicado retorna true si existe medicina duplicada", async () => {
    setupConnection();

    mockExecute.mockResolvedValue({
      rows: [{ TOTAL: 1 }],
    });

    const result = await verificarDuplicado("Paracetamol", "medicina");

    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("INVENTARIO_MEDICINAS"),
      { descripcion: "Paracetamol" },
      { outFormat: "OUT_FORMAT_OBJECT" }
    );

    expect(result).toBe(true);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("verificarDuplicado retorna false si no existe equipo duplicado", async () => {
    setupConnection();

    mockExecute.mockResolvedValue({
      rows: [{ TOTAL: 0 }],
    });

    const result = await verificarDuplicado("Andadera", "equipo");

    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("INVENTARIO_EQUIPO_MEDICO"),
      { descripcion: "Andadera" },
      { outFormat: "OUT_FORMAT_OBJECT" }
    );

    expect(result).toBe(false);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("actualizarCantidadMedicina ejecuta procedimiento con ids numéricos", async () => {
    setupConnection();

    mockExecute.mockResolvedValue({});

    await actualizarCantidadMedicina("3", "10");

    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("actualizar_cantidad_medicina"),
      {
        medicinaId: 3,
        cantidad: 10,
      }
    );

    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("actualizarCantidadEquipo ejecuta procedimiento con ids numéricos", async () => {
    setupConnection();

    mockExecute.mockResolvedValue({});

    await actualizarCantidadEquipo("4", "8");

    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("actualizar_cantidad_equipo"),
      {
        equipoId: 4,
        cantidad: 8,
      }
    );

    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("getInventarioCompleto une medicinas y equipo médico", async () => {
    setupConnection();

    mockExecute
      .mockResolvedValueOnce({
        rows: [
          {
            ID: 1,
            DESCRIPCION: "Paracetamol",
            TIPO: "medicina",
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            ID: 2,
            DESCRIPCION: "Silla de ruedas",
            TIPO: "equipo",
          },
        ],
      });

    const result = await getInventarioCompleto();

    expect(mockExecute).toHaveBeenCalledTimes(2);
    expect(result).toEqual([
      {
        ID: 1,
        DESCRIPCION: "Paracetamol",
        TIPO: "medicina",
      },
      {
        ID: 2,
        DESCRIPCION: "Silla de ruedas",
        TIPO: "equipo",
      },
    ]);

    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("eliminarArticulo elimina medicina y hace commit", async () => {
    setupConnection();

    mockExecute.mockResolvedValue({});
    mockCommit.mockResolvedValue({});

    await eliminarArticulo("5", "medicina");

    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("DELETE FROM INVENTARIO_MEDICINAS"),
      { id: 5 }
    );

    expect(mockCommit).toHaveBeenCalledTimes(1);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("eliminarArticulo elimina equipo y hace commit", async () => {
    setupConnection();

    mockExecute.mockResolvedValue({});
    mockCommit.mockResolvedValue({});

    await eliminarArticulo("6", "equipo");

    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("DELETE FROM INVENTARIO_EQUIPO_MEDICO"),
      { id: 6 }
    );

    expect(mockCommit).toHaveBeenCalledTimes(1);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("cierra conexión aunque ocurra un error", async () => {
    setupConnection();

    mockExecute.mockRejectedValue(new Error("Error DB"));

    await expect(actualizarCantidadMedicina("1", "2")).rejects.toThrow("Error DB");

    expect(mockClose).toHaveBeenCalledTimes(1);
  });
});