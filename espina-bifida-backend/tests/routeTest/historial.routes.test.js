import { jest, describe, test, expect } from "@jest/globals";

const mockGet = jest.fn();
const mockDelete = jest.fn();

const mockRouter = {
  get: mockGet,
  delete: mockDelete,
};

const mockGetHistorial = jest.fn();
const mockDeleteEvento = jest.fn();

jest.unstable_mockModule("express", () => ({
  default: {
    Router: jest.fn(() => mockRouter),
  },
  Router: jest.fn(() => mockRouter),
}));

jest.unstable_mockModule("../../modulos/historial/historial.controller.js", () => ({
  getHistorial: mockGetHistorial,
  deleteEvento: mockDeleteEvento,
}));

await import("../../modulos/historial/historial.route.js");

describe("historial.route.js", () => {
  test("registra GET /:id con getHistorial", () => {
    expect(mockGet).toHaveBeenCalledWith("/:id", mockGetHistorial);
  });

  test("registra DELETE /:id/:eventoId con deleteEvento", () => {
    expect(mockDelete).toHaveBeenCalledWith(
      "/:id/:eventoId",
      mockDeleteEvento
    );
  });
});