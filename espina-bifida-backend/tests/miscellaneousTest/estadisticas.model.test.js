import { jest, describe, beforeEach, afterEach, test, expect } from "@jest/globals";

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

const { getEstadisticasModel } = await import(
  "../../modulos/estadisticas/estadisticas.model.js"
);

function crearMockConnection() {
  return {
    execute: mockExecute,
    close: mockClose,
  };
}

describe("estadisticas.model.js", () => {
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetConnection.mockResolvedValue(crearMockConnection());
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test("debe obtener estadísticas desde Oracle correctamente", async () => {
    const row = {
      TOTAL_ARTICULOS: 10,
      EXISTENCIAS_NORMAL: 6,
      EXISTENCIAS_BAJAS: 3,
      EXISTENCIAS_AGOTADAS: 1,
      TOTAL_PACIENTES: 20,
      PACIENTES_ACTIVOS: 18,
      PACIENTES_INACTIVOS: 2,
      PACIENTES_NUEVOS_MES: 4,
      VISITAS_MES: 8,
      SERVICIOS_REALIZADOS: 12,
      MEDICINAS_ENTREGADAS: 30,
      EQUIPO_SIN_REGRESAR: 2,
      INGRESOS_MES: 5000,
      REGISTROS_PENDIENTES: 3,
      NOTIFICACIONES_MES: 6,
      TOTAL_REPORTES: 15,
    };

    mockExecute.mockResolvedValue({
      rows: [row],
    });

    const result = await getEstadisticasModel();

    expect(mockGetConnection).toHaveBeenCalled();

    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("SELECT"),
      [],
      {
        outFormat: "OUT_FORMAT_OBJECT",
      }
    );

    expect(result.kpis).toEqual(row);
    expect(mockClose).toHaveBeenCalled();
  });

  test("debe cerrar conexión y lanzar error si falla Oracle", async () => {
    mockExecute.mockRejectedValue(new Error("Error Oracle"));

    await expect(getEstadisticasModel()).rejects.toThrow("Error Oracle");

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error en getEstadisticasModel:",
      expect.any(Error)
    );

    expect(mockClose).toHaveBeenCalled();
  });

  test("debe lanzar error si falla getConnection", async () => {
    mockGetConnection.mockRejectedValue(new Error("Sin conexión"));

    await expect(getEstadisticasModel()).rejects.toThrow("Sin conexión");

    expect(mockExecute).not.toHaveBeenCalled();
    expect(mockClose).not.toHaveBeenCalled();
  });
});