import { jest } from "@jest/globals";

const mockGet = jest.fn();
const mockPost = jest.fn();

const mockRouter = {
  get: mockGet,
  post: mockPost,
};

const mockListarEquipo = jest.fn();
const mockListarEquipoMDisponibles = jest.fn();
const mockGuardarConsultaEquipo = jest.fn();

jest.unstable_mockModule("express", () => ({
  Router: jest.fn(() => mockRouter),
}));

jest.unstable_mockModule("../../modulos/fiorella/equipomedico/equipomedicocontroller.js", () => ({
  listarEquipo: mockListarEquipo,
  listarEquipoMDisponibles: mockListarEquipoMDisponibles,
  guardarConsultaEquipo: mockGuardarConsultaEquipo,
}));

await import("../../modulos/fiorella/equipomedico/equipomedico.route.js");

describe("equipomedico.route", () => {
  test("registra GET / con listarEquipo", () => {
    expect(mockGet).toHaveBeenCalledWith("/", mockListarEquipo);
  });

  test("registra GET /disponibles con listarEquipoMDisponibles", () => {
    expect(mockGet).toHaveBeenCalledWith(
      "/disponibles",
      mockListarEquipoMDisponibles
    );
  });

  test("registra POST /guardar con guardarConsultaEquipo", () => {
    expect(mockPost).toHaveBeenCalledWith(
      "/guardar",
      mockGuardarConsultaEquipo
    );
  });
});