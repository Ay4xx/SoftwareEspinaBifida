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

const mockListar = jest.fn();
const mockObtener = jest.fn();
const mockCrear = jest.fn();
const mockActualizar = jest.fn();
const mockEliminar = jest.fn();
const mockUploadFoto = jest.fn();

jest.unstable_mockModule("express", () => ({
  default: {
    Router: jest.fn(() => mockRouter),
  },
  Router: jest.fn(() => mockRouter),
}));

jest.unstable_mockModule("../../modulos/gestionUsuarios/gestionUsuarios.controller.js", () => ({
  listar: mockListar,
  obtener: mockObtener,
  crear: mockCrear,
  actualizar: mockActualizar,
  eliminar: mockEliminar,
  uploadFoto: mockUploadFoto,
}));

await import("../../modulos/gestionUsuarios/gestionUsuarios.routes.js");

describe("gestionUsuarios.routes.js", () => {
  test("registra GET / con listar", () => {
    expect(mockGet).toHaveBeenCalledWith("/", mockListar);
  });

  test("registra GET /:id con obtener", () => {
    expect(mockGet).toHaveBeenCalledWith("/:id", mockObtener);
  });

  test("registra POST / con uploadFoto y crear", () => {
    expect(mockPost).toHaveBeenCalledWith("/", mockUploadFoto, mockCrear);
  });

  test("registra PUT /:id con uploadFoto y actualizar", () => {
    expect(mockPut).toHaveBeenCalledWith("/:id", mockUploadFoto, mockActualizar);
  });

  test("registra DELETE /:id con eliminar", () => {
    expect(mockDelete).toHaveBeenCalledWith("/:id", mockEliminar);
  });
});