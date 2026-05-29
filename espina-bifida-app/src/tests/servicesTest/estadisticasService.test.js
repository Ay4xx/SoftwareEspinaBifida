import {
  getEstadisticas,
  descargarReporteMensual,
} from "../../services/estadisticasService";

describe("estadisticasService", () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn();
    jest.clearAllMocks();
  });

  test("getEstadisticas obtiene estadísticas correctamente", async () => {
    const mockData = {
      totalPacientes: 10,
      totalArticulos: 20,
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        ok: true,
        data: mockData,
      }),
    });

    const result = await getEstadisticas();

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3001/api/estadisticas"
    );

    expect(result).toEqual(mockData);
  });

  test("getEstadisticas lanza error si response.ok es false", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
    });

    await expect(getEstadisticas()).rejects.toThrow(
      "Error al obtener las estadísticas"
    );
  });

  test("getEstadisticas lanza error si result.ok es false", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        ok: false,
        message: "Error del servidor",
      }),
    });

    await expect(getEstadisticas()).rejects.toThrow("Error del servidor");
  });

  test("descargarReporteMensual manda POST con filtros y regresa data si no es archivo", async () => {
    const filtros = {
      inventario: true,
      pacientes: true,
      servicios: true,
      reportes: true,
      fechaInicio: "2026-05-01",
      fechaFin: "2026-05-29",
      tipoArchivo: "json",
    };

    const mockData = {
      mensaje: "Reporte generado",
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        ok: true,
        data: mockData,
      }),
    });

    const result = await descargarReporteMensual(filtros);

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3001/api/estadisticas/reporte",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filtros),
      }
    );

    expect(result).toEqual(mockData);
  });

  test("descargarReporteMensual lanza error si response.ok es false", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
    });

    await expect(
      descargarReporteMensual({ tipoArchivo: "json" })
    ).rejects.toThrow("Error al descargar el reporte");
  });

  test("descargarReporteMensual lanza error si result.ok es false", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        ok: false,
        message: "Error generando reporte",
      }),
    });

    await expect(
      descargarReporteMensual({ tipoArchivo: "json" })
    ).rejects.toThrow("Error generando reporte");
  });

  test("descargarReporteMensual descarga archivo excel", async () => {
    const filtros = {
      tipoArchivo: "excel",
    };

    const blob = new Blob(["reporte"]);

    fetch.mockResolvedValueOnce({
      ok: true,
      blob: jest.fn().mockResolvedValue(blob),
    });

    const clickMock = jest.fn();
    const removeMock = jest.fn();

    const anchor = document.createElement("a");
    anchor.click = clickMock;
    anchor.remove = removeMock;

    jest.spyOn(document, "createElement").mockReturnValue(anchor);

    globalThis.URL.createObjectURL = jest.fn(() => "blob:mock-url");
    globalThis.URL.revokeObjectURL = jest.fn();

    await descargarReporteMensual(filtros);

    expect(globalThis.URL.createObjectURL).toHaveBeenCalledWith(blob);
    expect(anchor.download).toBe("reporte_mensual.xlsx");
    expect(clickMock).toHaveBeenCalled();
    expect(removeMock).toHaveBeenCalled();
    expect(globalThis.URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");

    document.createElement.mockRestore();
  });

  test("descargarReporteMensual descarga archivo csv", async () => {
    const filtros = {
      tipoArchivo: "csv",
    };

    const blob = new Blob(["reporte"]);

    fetch.mockResolvedValueOnce({
      ok: true,
      blob: jest.fn().mockResolvedValue(blob),
    });

    const clickMock = jest.fn();
    const removeMock = jest.fn();

    const anchor = document.createElement("a");
    anchor.click = clickMock;
    anchor.remove = removeMock;

    jest.spyOn(document, "createElement").mockReturnValue(anchor);

    globalThis.URL.createObjectURL = jest.fn(() => "blob:mock-url");
    globalThis.URL.revokeObjectURL = jest.fn();

    await descargarReporteMensual(filtros);

    expect(anchor.download).toBe("reporte_mensual.csv");
    expect(clickMock).toHaveBeenCalled();

    document.createElement.mockRestore();
  });

  test("descargarReporteMensual descarga archivo pdf", async () => {
    const filtros = {
      tipoArchivo: "pdf",
    };

    const blob = new Blob(["reporte"]);

    fetch.mockResolvedValueOnce({
      ok: true,
      blob: jest.fn().mockResolvedValue(blob),
    });

    const clickMock = jest.fn();
    const removeMock = jest.fn();

    const anchor = document.createElement("a");
    anchor.click = clickMock;
    anchor.remove = removeMock;

    jest.spyOn(document, "createElement").mockReturnValue(anchor);

    globalThis.URL.createObjectURL = jest.fn(() => "blob:mock-url");
    globalThis.URL.revokeObjectURL = jest.fn();

    await descargarReporteMensual(filtros);

    expect(anchor.download).toBe("reporte_mensual.pdf");
    expect(clickMock).toHaveBeenCalled();

    document.createElement.mockRestore();
  });
});