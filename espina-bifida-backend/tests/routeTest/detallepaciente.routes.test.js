import { jest } from "@jest/globals";

const mockGet = jest.fn();

const mockRouter = {
  get: mockGet,
};

const mockListarPacienteDetalle = jest.fn();

jest.unstable_mockModule("express", () => ({
  Router: jest.fn(() => mockRouter),
}));

jest.unstable_mockModule("../../modulos/fiorella/detallepaciente/detallepaciente.controller.js", () => ({
  listarPacienteDetalle: mockListarPacienteDetalle,
}));

await import("../../modulos/fiorella/detallepaciente/detallepaciente.routes.js");

describe("detallepaciente.routes", () => {
  test("registra GET /:pacienteId con listarPacienteDetalle", () => {
    expect(mockGet).toHaveBeenCalledWith(
      "/:pacienteId",
      mockListarPacienteDetalle
    );
  });
});