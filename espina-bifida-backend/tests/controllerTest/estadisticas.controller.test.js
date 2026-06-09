import { jest, describe, beforeEach, afterEach, test, expect } from "@jest/globals";

const mockGetEstadisticasService = jest.fn();
const mockDescargarReporteMensualService = jest.fn();

jest.unstable_mockModule("../../modulos/estadisticas/estadisticas.service.js", () => ({
  getEstadisticasService: mockGetEstadisticasService,
  descargarReporteMensualService: mockDescargarReporteMensualService,
}));

const {
  getEstadisticas,
  descargarReporteMensual,
} = await import("../../modulos/estadisticas/estadisticas.controller.js");

function mockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn(),
    setHeader: jest.fn(),
  };
}

describe("estadisticas.controller.js", () => {
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test("getEstadisticas responde con estadísticas", async () => {
    const req = {};
    const res = mockRes();

    const data = {
      totalPacientes: 10,
      totalMedicamentos: 5,
    };

    mockGetEstadisticasService.mockResolvedValue(data);

    await getEstadisticas(req, res);

    expect(mockGetEstadisticasService).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      ok: true,
      data,
    });
  });

  test("getEstadisticas responde 500 si falla", async () => {
    const req = {};
    const res = mockRes();

    mockGetEstadisticasService.mockRejectedValue(new Error("Error stats"));

    await getEstadisticas(req, res);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error en getEstadisticas:",
      expect.any(Error)
    );

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      message: "Error al obtener las estadísticas",
      error: "Error stats",
    });
  });

  test("descargarReporteMensual responde CSV con content-type correcto", async () => {
    const req = {
      body: {
        tipoArchivo: "csv",
        mes: 6,
        anio: 2026,
      },
    };
    const res = mockRes();

    const resultado = "columna1,columna2\nvalor1,valor2";
    mockDescargarReporteMensualService.mockResolvedValue(resultado);

    await descargarReporteMensual(req, res);

    expect(mockDescargarReporteMensualService).toHaveBeenCalledWith(req.body);
    expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "text/csv");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(resultado);
  });

  test("descargarReporteMensual responde Excel con content-type correcto", async () => {
    const req = {
      body: {
        tipoArchivo: "excel",
      },
    };
    const res = mockRes();

    const resultado = Buffer.from("excel");
    mockDescargarReporteMensualService.mockResolvedValue(resultado);

    await descargarReporteMensual(req, res);

    expect(res.setHeader).toHaveBeenCalledWith(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(resultado);
  });

  test("descargarReporteMensual responde PDF con content-type correcto", async () => {
    const req = {
      body: {
        tipoArchivo: "pdf",
      },
    };
    const res = mockRes();

    const resultado = Buffer.from("pdf");
    mockDescargarReporteMensualService.mockResolvedValue(resultado);

    await descargarReporteMensual(req, res);

    expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "application/pdf");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(resultado);
  });

  test("descargarReporteMensual responde JSON si tipoArchivo no tiene MIME", async () => {
    const req = {
      body: {
        tipoArchivo: "json",
      },
    };
    const res = mockRes();

    const resultado = {
      filas: [{ id: 1 }],
    };

    mockDescargarReporteMensualService.mockResolvedValue(resultado);

    await descargarReporteMensual(req, res);

    expect(res.setHeader).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      ok: true,
      data: resultado,
    });
  });

  test("descargarReporteMensual responde 500 si falla", async () => {
    const req = {
      body: {
        tipoArchivo: "pdf",
      },
    };
    const res = mockRes();

    mockDescargarReporteMensualService.mockRejectedValue(new Error("Error reporte"));

    await descargarReporteMensual(req, res);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error en descargarReporteMensual:",
      expect.any(Error)
    );

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      message: "Error al generar reporte",
      error: "Error reporte",
    });
  });
});