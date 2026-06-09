import { jest, describe, beforeEach, afterEach, test, expect } from "@jest/globals";

const mockObtenerHistorialPorPaciente = jest.fn();
const mockEliminarEvento = jest.fn();

jest.unstable_mockModule("../../modulos/historial/historial.service.js", () => ({
  obtenerHistorialPorPaciente: mockObtenerHistorialPorPaciente,
  eliminarEvento: mockEliminarEvento,
}));

const { getHistorial, deleteEvento } = await import("../../modulos/historial/historial.controller.js");

function mockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

describe("historial.controller.js", () => {
  let consoleLogSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  test("getHistorial responde con historial del paciente", async () => {
    const req = { params: { id: "10" } };
    const res = mockRes();

    const data = [
      {
        EVENTO_ID: 1,
        tipo: "servicio",
        nombre: "Consulta",
      },
    ];

    mockObtenerHistorialPorPaciente.mockResolvedValue(data);

    await getHistorial(req, res);

    expect(mockObtenerHistorialPorPaciente).toHaveBeenCalledWith("10");
    expect(consoleLogSpy).toHaveBeenCalledWith("HISTORIAL:");
    expect(consoleLogSpy).toHaveBeenCalledWith(data);
    expect(res.json).toHaveBeenCalledWith(data);
  });

  test("getHistorial responde 500 si falla", async () => {
    const req = { params: { id: "10" } };
    const res = mockRes();

    mockObtenerHistorialPorPaciente.mockRejectedValue(new Error("Error historial"));

    await getHistorial(req, res);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error en getHistorial:",
      expect.any(Error)
    );

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Error al obtener historial",
    });
  });

  test("deleteEvento elimina evento correctamente", async () => {
    const req = { params: { eventoId: "50" } };
    const res = mockRes();

    mockEliminarEvento.mockResolvedValue();

    await deleteEvento(req, res);

    expect(mockEliminarEvento).toHaveBeenCalledWith("50");
    expect(res.json).toHaveBeenCalledWith({
      ok: true,
      message: "Evento eliminado y stock restaurado correctamente",
    });
  });

  test("deleteEvento responde 500 si falla", async () => {
    const req = { params: { eventoId: "50" } };
    const res = mockRes();

    mockEliminarEvento.mockRejectedValue(new Error("Error eliminar"));

    await deleteEvento(req, res);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error en deleteEvento:",
      expect.any(Error)
    );

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Error al eliminar evento",
    });
  });
});