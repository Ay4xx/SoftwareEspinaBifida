import { jest, describe, beforeEach, afterEach, test, expect } from "@jest/globals";

const mockObtenerHistorialPorPaciente = jest.fn();

jest.unstable_mockModule("../../modulos/historial/historial.service.js", () => ({
  obtenerHistorialPorPaciente: mockObtenerHistorialPorPaciente,
}));

const { getHistorial } = await import("../../modulos/historial/historial.controller.js");

function crearMockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("historial.controller.js", () => {
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test("debe obtener historial por paciente correctamente", async () => {
    const req = {
      params: {
        id: "10",
      },
    };
    const res = crearMockRes();

    const historial = [
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
        TIPO: "medicamento",
        NOMBRE: "Paracetamol",
        PRECIO: 80,
      },
    ];

    mockObtenerHistorialPorPaciente.mockResolvedValue(historial);

    await getHistorial(req, res);

    expect(mockObtenerHistorialPorPaciente).toHaveBeenCalledWith("10");
    expect(res.json).toHaveBeenCalledWith(historial);
  });

  test("debe responder 500 si ocurre un error", async () => {
    const req = {
      params: {
        id: "10",
      },
    };
    const res = crearMockRes();

    mockObtenerHistorialPorPaciente.mockRejectedValue(new Error("DB error"));

    await getHistorial(req, res);

    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(Error));
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Error al obtener historial",
    });
  });
});