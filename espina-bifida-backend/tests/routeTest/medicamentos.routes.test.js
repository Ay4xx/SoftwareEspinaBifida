import { jest } from "@jest/globals";

const mockGet = jest.fn();
const mockPost = jest.fn();

const mockRouter = {
  get: mockGet,
  post: mockPost,
};

const mockListarMedicamentos = jest.fn();
const mockListarMedicamentosDisponibles = jest.fn();
const mockGuardarConsulta = jest.fn();

jest.unstable_mockModule("express", () => ({
  Router: jest.fn(() => mockRouter),
}));

jest.unstable_mockModule("../../modulos/fiorella/medicamentos/medicamentoscontroller.js", () => ({
  listarMedicamentos: mockListarMedicamentos,
  listarMedicamentosDisponibles: mockListarMedicamentosDisponibles,
  guardarConsulta: mockGuardarConsulta,
}));

await import("../../modulos/fiorella/medicamentos/medicamentos.route.js");

describe("medicamentos.route", () => {
  test("registra GET / con listarMedicamentos", () => {
    expect(mockGet).toHaveBeenCalledWith("/", mockListarMedicamentos);
  });

  test("registra GET /disponibles con listarMedicamentosDisponibles", () => {
    expect(mockGet).toHaveBeenCalledWith(
      "/disponibles",
      mockListarMedicamentosDisponibles
    );
  });

  test("registra POST /guardar con guardarConsulta", () => {
    expect(mockPost).toHaveBeenCalledWith(
      "/guardar",
      mockGuardarConsulta
    );
  });
});