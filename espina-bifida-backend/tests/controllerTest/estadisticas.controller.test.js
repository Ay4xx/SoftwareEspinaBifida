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

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe("getEstadisticas", () => {
    test("debe obtener estadísticas correctamente", async () => {
      const req = {};
      const res = crearMockRes();

      const data = {
        totalArticulos: 10,
        totalPacientes: 5,
      };

      mockGetEstadisticasService.mockResolvedValue(data);

      await getEstadisticas(req, res);

      expect(mockGetEstadisticasService).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        data,
      });
    });

    test("debe responder 500 si falla getEstadisticasService", async () => {
      const req = {};
      const res = crearMockRes();

      mockGetEstadisticasService.mockRejectedValue(new Error("DB error"));

      await getEstadisticas(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Error al obtener las estadísticas",
        error: "DB error",
      });
    });
  });

  describe("descargarReporteMensual", () => {
    test("debe regresar CSV con headers correctos", async () => {
      const req = {
        body: {
          tipoArchivo: "csv",
          inventario: true,
        },
      };
      const res = crearMockRes();

      const csv = "INVENTARIO\ncampo,valor\ntotalArticulos,10\n";

      mockDescargarReporteMensualService.mockResolvedValue(csv);

      await descargarReporteMensual(req, res);

      expect(mockDescargarReporteMensualService).toHaveBeenCalledWith(req.body);

      expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "text/csv");
      expect(res.setHeader).toHaveBeenCalledWith(
        "Content-Disposition",
        "attachment; filename=reporte_mensual.csv"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(csv);
    });

    test("debe regresar Excel con headers correctos", async () => {
      const req = {
        body: {
          tipoArchivo: "excel",
          pacientes: true,
        },
      };
      const res = crearMockRes();

      const buffer = Buffer.from("excel-file");

      mockDescargarReporteMensualService.mockResolvedValue(buffer);

      await descargarReporteMensual(req, res);

      expect(res.setHeader).toHaveBeenCalledWith(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      expect(res.setHeader).toHaveBeenCalledWith(
        "Content-Disposition",
        "attachment; filename=reporte_mensual.xlsx"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(buffer);
    });

    test("debe regresar PDF con headers correctos", async () => {
      const req = {
        body: {
          tipoArchivo: "pdf",
          reportes: true,
        },
      };
      const res = crearMockRes();

      const buffer = Buffer.from("pdf-file");

      mockDescargarReporteMensualService.mockResolvedValue(buffer);

      await descargarReporteMensual(req, res);

      expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "application/pdf");
      expect(res.setHeader).toHaveBeenCalledWith(
        "Content-Disposition",
        "attachment; filename=reporte_mensual.pdf"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(buffer);
    });

    test("debe regresar JSON si no es csv, excel o pdf", async () => {
      const req = {
        body: {
          inventario: true,
        },
      };
      const res = crearMockRes();

      const resultado = {
        inventario: {
          totalArticulos: 10,
        },
      };

      mockDescargarReporteMensualService.mockResolvedValue(resultado);

      await descargarReporteMensual(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        data: resultado,
      });
    });

    test("debe responder 500 si falla descargarReporteMensualService", async () => {
      const req = {
        body: {
          tipoArchivo: "csv",
        },
      };
      const res = crearMockRes();

      mockDescargarReporteMensualService.mockRejectedValue(new Error("Error reporte"));

      await descargarReporteMensual(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Error al generar reporte",
        error: "Error reporte",
      });
    });
  });
});