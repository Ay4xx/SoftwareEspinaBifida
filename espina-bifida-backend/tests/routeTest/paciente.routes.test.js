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

const mockSingle = jest.fn(() => "upload-foto-middleware");
const mockUpload = {
  single: mockSingle,
};

const mockListarPacienteCards = jest.fn();
const mockObtenerPacientePorId = jest.fn();
const mockObtenerPacienteCredencial = jest.fn();
const mockObtenerPacienteDetalle = jest.fn();
const mockSubirFoto = jest.fn();
const mockObtenerFoto = jest.fn();
const mockActualizarPaciente = jest.fn();
const mockBorrarPaciente = jest.fn();

jest.unstable_mockModule("express", () => ({
  default: {
    Router: jest.fn(() => mockRouter),
  },
  Router: jest.fn(() => mockRouter),
}));

jest.unstable_mockModule("../../modulos/middlewares/upload.js", () => ({
  default: mockUpload,
}));

jest.unstable_mockModule("../../modulos/paciente/paciente.controller.js", () => ({
  listarPacienteCards: mockListarPacienteCards,
  obtenerPacientePorId: mockObtenerPacientePorId,
  obtenerPacienteCredencial: mockObtenerPacienteCredencial,
  obtenerPacienteDetalle: mockObtenerPacienteDetalle,
  subirFoto: mockSubirFoto,
  obtenerFoto: mockObtenerFoto,
  actualizarPaciente: mockActualizarPaciente,
  borrarPaciente: mockBorrarPaciente,
}));

await import("../../modulos/paciente/paciente.routes.js");

describe("paciente.routes.js", () => {
  test("registra GET /cards con listarPacienteCards", () => {
    expect(mockGet).toHaveBeenCalledWith("/cards", mockListarPacienteCards);
  });

  test("registra GET /credencial/:pacienteId con obtenerPacienteCredencial", () => {
    expect(mockGet).toHaveBeenCalledWith(
      "/credencial/:pacienteId",
      mockObtenerPacienteCredencial
    );
  });

  test("registra GET /detalle/:id con obtenerPacienteDetalle", () => {
    expect(mockGet).toHaveBeenCalledWith("/detalle/:id", mockObtenerPacienteDetalle);
  });

  test("registra GET /:id/foto con obtenerFoto", () => {
    expect(mockGet).toHaveBeenCalledWith("/:id/foto", mockObtenerFoto);
  });

  test("registra DELETE /:id con borrarPaciente", () => {
    expect(mockDelete).toHaveBeenCalledWith("/:id", mockBorrarPaciente);
  });

  test("registra POST /upload/:id con upload.single('foto') y subirFoto", () => {
    expect(mockSingle).toHaveBeenCalledWith("foto");
    expect(mockPost).toHaveBeenCalledWith(
      "/upload/:id",
      "upload-foto-middleware",
      mockSubirFoto
    );
  });

  test("registra PUT /:id con upload.single('foto') y actualizarPaciente", () => {
    expect(mockPut).toHaveBeenCalledWith(
      "/:id",
      "upload-foto-middleware",
      mockActualizarPaciente
    );
  });

  test("registra GET /:id con obtenerPacientePorId", () => {
    expect(mockGet).toHaveBeenCalledWith("/:id", mockObtenerPacientePorId);
  });
});