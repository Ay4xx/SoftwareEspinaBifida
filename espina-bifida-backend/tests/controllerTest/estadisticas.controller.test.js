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

function crearMockRes() {
  const res = {};

  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);

  return res;
}

describe("estadisticas.controller.js", () => {
  let consoleErrorSpy;
  let consoleLogSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  describe("getEstadisticas", () => {
    test("debe obtener estadísticas correctamente", async () => {
      const req = {};
      const res = crearMockRes();

      const dataMock = {
        pacientes: {
          total: 20,
          vivos: 18,
          fallecidos: 2,
        },
        citas: {
          total: 10,
          atendidas: 7,
          canceladas: 2,
          pendientes: 1,
        },
      };

      mockGetEstadisticasService.mockResolvedValue(dataMock);

      await getEstadisticas(req, res);

      expect(mockGetEstadisticasService).toHaveBeenCalledTimes(1);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        data: dataMock,
      });
    });

    test("debe responder 500 si falla getEstadisticasService", async () => {
      const req = {};
      const res = crearMockRes();

      mockGetEstadisticasService.mockRejectedValue(new Error("DB error"));

      await getEstadisticas(req, res);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error en getEstadisticas controller:",
        expect.any(Error)
      );

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Error al obtener las estadísticas",
        error: "DB error",
      });
    });
  });

  describe("descargarReporteMensual", () => {
    test("debe regresar JSON si tipoArchivo no tiene MIME definido", async () => {
      const req = {
        body: {
          tipoArchivo: "json",
          pacientes: true,
        },
      };
      const res = crearMockRes();

      const resultadoMock = {
        pacientes: {
          total: 20,
        },
      };

      mockDescargarReporteMensualService.mockResolvedValue(resultadoMock);

      await descargarReporteMensual(req, res);

      expect(consoleLogSpy).toHaveBeenCalledWith("CONTROLLER HIT");

      expect(mockDescargarReporteMensualService).toHaveBeenCalledWith({
        tipoArchivo: "json",
        pacientes: true,
      });

      expect(res.setHeader).not.toHaveBeenCalled();
      expect(res.send).not.toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        data: resultadoMock,
      });
    });

    test("debe descargar CSV con Content-Type correcto", async () => {
      const buffer = Buffer.from("campo,valor\ntotal,20");

      const req = {
        body: {
          tipoArchivo: "csv",
          pacientes: true,
        },
      };
      const res = crearMockRes();

      mockDescargarReporteMensualService.mockResolvedValue(buffer);

      await descargarReporteMensual(req, res);

      expect(mockDescargarReporteMensualService).toHaveBeenCalledWith({
        tipoArchivo: "csv",
        pacientes: true,
      });

      expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "text/csv");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(buffer);
      expect(res.json).not.toHaveBeenCalled();
    });

    test("debe descargar Excel con Content-Type correcto", async () => {
      const buffer = Buffer.from("excel-file");

      const req = {
        body: {
          tipoArchivo: "excel",
          pacientes: true,
        },
      };
      const res = crearMockRes();

      mockDescargarReporteMensualService.mockResolvedValue(buffer);

      await descargarReporteMensual(req, res);

      expect(mockDescargarReporteMensualService).toHaveBeenCalledWith({
        tipoArchivo: "excel",
        pacientes: true,
      });

      expect(res.setHeader).toHaveBeenCalledWith(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(buffer);
      expect(res.json).not.toHaveBeenCalled();
    });

    test("debe descargar PDF con Content-Type correcto", async () => {
      const buffer = Buffer.from("pdf-file");

      const req = {
        body: {
          tipoArchivo: "pdf",
          pacientes: true,
        },
      };
      const res = crearMockRes();

      mockDescargarReporteMensualService.mockResolvedValue(buffer);

      await descargarReporteMensual(req, res);

      expect(mockDescargarReporteMensualService).toHaveBeenCalledWith({
        tipoArchivo: "pdf",
        pacientes: true,
      });

      expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "application/pdf");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(buffer);
      expect(res.json).not.toHaveBeenCalled();
    });

    test("debe responder 500 si falla descargarReporteMensualService", async () => {
      const req = {
        body: {
          tipoArchivo: "csv",
          pacientes: true,
        },
      };
      const res = crearMockRes();

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
});