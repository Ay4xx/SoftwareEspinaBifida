import { jest } from "@jest/globals";

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

const mockCrearMedicina = jest.fn();
const mockCrearEquipoMedico = jest.fn();
const mockRegistrarEntradaMedicina = jest.fn();
const mockRegistrarEntradaEquipo = jest.fn();
const mockListarInventario = jest.fn();
const mockEliminarArticuloController = jest.fn();

jest.unstable_mockModule("express", () => ({
  Router: jest.fn(() => mockRouter),
}));

jest.unstable_mockModule("../../modulos/fiorella/regservicios/regservicios.controller.js", () => ({
  crearMedicina: mockCrearMedicina,
  crearEquipoMedico: mockCrearEquipoMedico,
  registrarEntradaMedicina: mockRegistrarEntradaMedicina,
  registrarEntradaEquipo: mockRegistrarEntradaEquipo,
  listarInventario: mockListarInventario,
  eliminarArticuloController: mockEliminarArticuloController,
}));

await import("../../modulos/fiorella/regservicios/regservicios.route.js");

describe("regservicios.route", () => {
  test("registra POST /medicina con crearMedicina", () => {
    expect(mockPost).toHaveBeenCalledWith(
      "/medicina",
      mockCrearMedicina
    );
  });

  test("registra POST /equipo con crearEquipoMedico", () => {
    expect(mockPost).toHaveBeenCalledWith(
      "/equipo",
      mockCrearEquipoMedico
    );
  });

  test("registra PUT /medicina/cantidad con registrarEntradaMedicina", () => {
    expect(mockPut).toHaveBeenCalledWith(
      "/medicina/cantidad",
      mockRegistrarEntradaMedicina
    );
  });

  test("registra PUT /equipo/cantidad con registrarEntradaEquipo", () => {
    expect(mockPut).toHaveBeenCalledWith(
      "/equipo/cantidad",
      mockRegistrarEntradaEquipo
    );
  });

  test("registra GET / con listarInventario", () => {
    expect(mockGet).toHaveBeenCalledWith(
      "/",
      mockListarInventario
    );
  });

  test("registra DELETE /:tipo/:id con eliminarArticuloController", () => {
    expect(mockDelete).toHaveBeenCalledWith(
      "/:tipo/:id",
      mockEliminarArticuloController
    );
  });
});