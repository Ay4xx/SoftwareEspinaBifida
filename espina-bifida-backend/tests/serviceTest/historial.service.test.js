import { jest, describe, beforeEach, afterEach, test, expect } from "@jest/globals";

const mockExecute = jest.fn();
const mockClose = jest.fn();
const mockGetConnection = jest.fn();

jest.unstable_mockModule("../../config/db.js", () => ({
  getConnection: mockGetConnection,
}));

const { obtenerHistorialPorPaciente } = await import("../../modulos/historial/historial.service.js");

function crearMockConnection() {
  return {
    execute: mockExecute,
    close: mockClose,
  };
}

describe("historial.service.js", () => {
  let consoleErrorSpy;
  let consoleLogSpy;

  beforeEach(() => {
    jest.clearAllMocks();

    mockGetConnection.mockResolvedValue(crearMockConnection());

    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  test("debe obtener historial por paciente correctamente", async () => {
    const rows = [
      {
        PACIENTE_ID: 10,
        FECHA_EVENTO: "2026-05-29",
        TIPO: "servicio",
        NOMBRE: "Consulta médica",
        PRECIO: 500,
      },
      {
        PACIENTE_ID: 10,
        FECHA_EVENTO: "2026-05-20",
        TIPO: "equipo",
        NOMBRE: "Silla de ruedas",
        PRECIO: 1200,
      },
    ];

    mockExecute.mockResolvedValue({
      rows,
    });

    const result = await obtenerHistorialPorPaciente("10");

    expect(mockGetConnection).toHaveBeenCalled();

    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("UNION ALL"),
      ["10"]
    );

    expect(result).toEqual(rows);
    expect(mockClose).toHaveBeenCalled();
    expect(consoleLogSpy).toHaveBeenCalledWith("Conexión cerrada");
  });

  test("debe regresar arreglo vacío si no hay historial", async () => {
    mockExecute.mockResolvedValue({
      rows: [],
    });

    const result = await obtenerHistorialPorPaciente("99");

    expect(result).toEqual([]);
    expect(mockClose).toHaveBeenCalled();
  });

  test("debe cerrar conexión y lanzar error si falla la consulta", async () => {
    mockExecute.mockRejectedValue(new Error("Error Oracle"));

    await expect(obtenerHistorialPorPaciente("10")).rejects.toThrow("Error Oracle");

    expect(consoleErrorSpy).toHaveBeenCalledWith("Error en obtenerHistorialPorPaciente:");
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(Error));
    expect(mockClose).toHaveBeenCalled();
  });

  test("debe capturar error si falla cerrar conexión", async () => {
    mockExecute.mockResolvedValue({
      rows: [],
    });

    mockClose.mockRejectedValue(new Error("Error al cerrar"));

    const result = await obtenerHistorialPorPaciente("10");

    expect(result).toEqual([]);
    expect(mockClose).toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error al cerrar conexión:",
      expect.any(Error)
    );
  });
});