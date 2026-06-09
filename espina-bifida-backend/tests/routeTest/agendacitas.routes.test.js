import { jest, describe, test, expect } from "@jest/globals";

const mockGet = jest.fn();
const mockPost = jest.fn();
const mockPut = jest.fn();
const mockDelete = jest.fn();

const mockRouter = {
  get: mockGet,
  post: mockPost,
  put: mockPut,
  delete: mockDelete,
};

const mockObtenerCitasPorFecha = jest.fn();
const mockObtenerCitaPorId = jest.fn();
const mockCrearNuevaCita = jest.fn();
const mockActualizarEstatus = jest.fn();
const mockEliminarCitaController = jest.fn();

jest.unstable_mockModule("express", () => ({
  default: {
    Router: jest.fn(() => mockRouter),
  },
  Router: jest.fn(() => mockRouter),
}));

jest.unstable_mockModule("../../modulos/agendacitas/agendacitas.controller.js", () => ({
  obtenerCitasPorFecha: mockObtenerCitasPorFecha,
  obtenerCitaPorId: mockObtenerCitaPorId,
  crearNuevaCita: mockCrearNuevaCita,
  actualizarEstatus: mockActualizarEstatus,
  eliminarCitaController: mockEliminarCitaController,
}));

await import("../../modulos/agendacitas/agendacitas.route.js");

describe("agendacitas.route.js", () => {
  test("registra GET / con obtenerCitasPorFecha", () => {
    expect(mockGet).toHaveBeenCalledWith("/", mockObtenerCitasPorFecha);
  });

  test("registra GET /:id con obtenerCitaPorId", () => {
    expect(mockGet).toHaveBeenCalledWith("/:id", mockObtenerCitaPorId);
  });

  test("registra POST / con crearNuevaCita", () => {
    expect(mockPost).toHaveBeenCalledWith("/", mockCrearNuevaCita);
  });

  test("registra PUT /:id/estatus con actualizarEstatus", () => {
    expect(mockPut).toHaveBeenCalledWith("/:id/estatus", mockActualizarEstatus);
  });

  test("registra DELETE /:id con eliminarCitaController", () => {
    expect(mockDelete).toHaveBeenCalledWith("/:id", mockEliminarCitaController);
  });
});