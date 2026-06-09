import { jest } from "@jest/globals";

const mockGet = jest.fn();
const mockPost = jest.fn();

const mockRouter = {
  get: mockGet,
  post: mockPost,
};

const mockListarMedicos = jest.fn();
const mockListarServiciosPorMedico = jest.fn();
const mockGuardarConsultaServicio = jest.fn();

jest.unstable_mockModule("express", () => ({
  Router: jest.fn(() => mockRouter),
}));

jest.unstable_mockModule("../../modulos/fiorella/medicocontroller.js", () => ({
  listarMedicos: mockListarMedicos,
  listarServiciosPorMedico: mockListarServiciosPorMedico,
  guardarConsultaServicio: mockGuardarConsultaServicio,
}));

await import("../../modulos/fiorella/medico.route.js");

describe("medico.route", () => {
  test("registra GET / con listarMedicos", () => {
    expect(mockGet).toHaveBeenCalledWith("/", mockListarMedicos);
  });

  test("registra GET /:medicoId/servicios con listarServiciosPorMedico", () => {
    expect(mockGet).toHaveBeenCalledWith(
      "/:medicoId/servicios",
      mockListarServiciosPorMedico
    );
  });

  test("registra POST /guardar con guardarConsultaServicio", () => {
    expect(mockPost).toHaveBeenCalledWith(
      "/guardar",
      mockGuardarConsultaServicio
    );
  });
});