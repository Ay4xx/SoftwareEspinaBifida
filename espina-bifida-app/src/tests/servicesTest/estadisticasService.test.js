import {
  getEstadisticas,
  descargarReporteMensual,
} from "../../services/estadisticasService";

describe("estadisticasService.js", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    delete global.fetch;
  });

  describe("getEstadisticas", () => {
    test("debe obtener estadísticas correctamente", async () => {
      const dataMock = {
        pacientes: { total: 10 },
        citas: { total: 5 },
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({
          ok: true,
          data: dataMock,
        }),
      });

      const result = await getEstadisticas();

      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/estadisticas"
      );

      expect(result).toEqual(dataMock);
    });

    test("debe lanzar error si response.ok es false", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: jest.fn(),
      });

      await expect(getEstadisticas()).rejects.toThrow(
        "Error al obtener las estadísticas"
      );
    });

    test("debe lanzar error si result.ok es false", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({
          ok: false,
          message: "Error del servidor",
        }),
      });

      await expect(getEstadisticas()).rejects.toThrow("Error del servidor");
    });

    test("debe lanzar error genérico si result.ok es false y no hay message", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({
          ok: false,
        }),
      });

      await expect(getEstadisticas()).rejects.toThrow(
        "Error en la respuesta del servidor"
      );
    });
  });

  describe("descargarReporteMensual", () => {
    test("debe descargar reporte correctamente y regresar blob", async () => {
      const filtros = {
        pacientes: true,
        citas: true,
        tipoArchivo: "pdf",
      };

      const blobMock = new Blob(["reporte"], { type: "application/pdf" });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        blob: jest.fn().mockResolvedValueOnce(blobMock),
      });

      const result = await descargarReporteMensual(filtros);

      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/estadisticas/reporte",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(filtros),
        }
      );

      expect(result).toBe(blobMock);
    });

    test("debe lanzar error si falla la descarga", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        blob: jest.fn(),
      });

      await expect(
        descargarReporteMensual({
          pacientes: true,
          tipoArchivo: "excel",
        })
      ).rejects.toThrow("Error al descargar el reporte");
    });
  });
});