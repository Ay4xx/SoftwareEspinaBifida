import { jest, describe, test, expect } from "@jest/globals";

const mockGet = jest.fn();
const mockPost = jest.fn();

const mockRouter = {
  get: mockGet,
  post: mockPost,
};

const mockGetEstadisticas = jest.fn();
const mockDescargarReporteMensual = jest.fn();

jest.unstable_mockModule("express", () => ({
  default: {
    Router: jest.fn(() => mockRouter),
  },
  Router: jest.fn(() => mockRouter),
}));

jest.unstable_mockModule("../../modulos/estadisticas/estadisticas.controller.js", () => ({
  getEstadisticas: mockGetEstadisticas,
  descargarReporteMensual: mockDescargarReporteMensual,
}));

await import("../../modulos/estadisticas/estadisticas.routes.js");

describe("estadisticas.routes.js", () => {
  test("registra GET / con getEstadisticas", () => {
    expect(mockGet).toHaveBeenCalledWith("/", mockGetEstadisticas);
  });

  test("registra POST /reporte con middleware y descargarReporteMensual", () => {
    expect(mockPost).toHaveBeenCalledWith(
      "/reporte",
      expect.any(Function),
      mockDescargarReporteMensual
    );
  });

  test("middleware de /reporte llama next", () => {
    const middleware = mockPost.mock.calls.find(
      (call) => call[0] === "/reporte"
    )[1];

    const req = {};
    const res = {};
    const next = jest.fn();

    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    middleware(req, res, next);

    expect(consoleLogSpy).toHaveBeenCalledWith("ROUTER HIT /reporte");
    expect(next).toHaveBeenCalledTimes(1);

    consoleLogSpy.mockRestore();
  });
});