import { jest, describe, test, expect } from "@jest/globals";

const mockGet = jest.fn();
const mockPut = jest.fn();
const mockDelete = jest.fn();

const mockRouter = {
  get: mockGet,
  put: mockPut,
  delete: mockDelete,
};

const mockListarNotificaciones = jest.fn();
const mockAprobarNotificacionController = jest.fn();
const mockRechazarNotificacionController = jest.fn();
const mockGetNotificacionByIdController = jest.fn();
const mockLimpiarNotificacionesAntiguasController = jest.fn();

jest.unstable_mockModule("express", () => ({
  default: {
    Router: jest.fn(() => mockRouter),
  },
  Router: jest.fn(() => mockRouter),
}));

jest.unstable_mockModule("../../modulos/notificaciones/notificaciones.controller.js", () => ({
  listarNotificaciones: mockListarNotificaciones,
  aprobarNotificacionController: mockAprobarNotificacionController,
  rechazarNotificacionController: mockRechazarNotificacionController,
  getNotificacionByIdController: mockGetNotificacionByIdController,
  limpiarNotificacionesAntiguasController: mockLimpiarNotificacionesAntiguasController,
}));

await import("../../modulos/notificaciones/notificaciones.routes.js");

describe("notificaciones.routes.js", () => {
  test("registra GET / con listarNotificaciones", () => {
    expect(mockGet).toHaveBeenCalledWith("/", mockListarNotificaciones);
  });

  test("registra GET /:id con getNotificacionByIdController", () => {
    expect(mockGet).toHaveBeenCalledWith("/:id", mockGetNotificacionByIdController);
  });

  test("registra PUT /:id/aprobar con aprobarNotificacionController", () => {
    expect(mockPut).toHaveBeenCalledWith(
      "/:id/aprobar",
      mockAprobarNotificacionController
    );
  });

  test("registra PUT /:id/rechazar con rechazarNotificacionController", () => {
    expect(mockPut).toHaveBeenCalledWith(
      "/:id/rechazar",
      mockRechazarNotificacionController
    );
  });

  test("registra DELETE /limpiar-antiguas con limpiarNotificacionesAntiguasController", () => {
    expect(mockDelete).toHaveBeenCalledWith(
      "/limpiar-antiguas",
      mockLimpiarNotificacionesAntiguasController
    );
  });
});