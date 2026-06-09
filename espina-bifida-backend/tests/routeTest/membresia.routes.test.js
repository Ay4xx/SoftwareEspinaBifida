import { jest, describe, test, expect } from "@jest/globals";

const mockPut = jest.fn();

const mockRouter = {
  put: mockPut,
};

const mockActivarMembresiaController = jest.fn();
const mockDesactivarMembresiaController = jest.fn();

jest.unstable_mockModule("express", () => ({
  default: {
    Router: jest.fn(() => mockRouter),
  },
  Router: jest.fn(() => mockRouter),
}));

jest.unstable_mockModule("../../modulos/membresia/membresia.controller.js", () => ({
  activarMembresiaController: mockActivarMembresiaController,
  desactivarMembresiaController: mockDesactivarMembresiaController,
}));

await import("../../modulos/membresia/membresia.routes.js");

describe("membresia.routes.js", () => {
  test("registra PUT /activar/:pacienteId con activarMembresiaController", () => {
    expect(mockPut).toHaveBeenCalledWith(
      "/activar/:pacienteId",
      mockActivarMembresiaController
    );
  });

  test("registra PUT /desactivar/:pacienteId con desactivarMembresiaController", () => {
    expect(mockPut).toHaveBeenCalledWith(
      "/desactivar/:pacienteId",
      mockDesactivarMembresiaController
    );
  });
});