import { jest, describe, test, expect } from "@jest/globals";

const mockGet = jest.fn();

const mockRouter = {
  get: mockGet,
};

const mockGetHistorialFamiliar = jest.fn();

jest.unstable_mockModule("express", () => ({
  default: {
    Router: jest.fn(() => mockRouter),
  },
  Router: jest.fn(() => mockRouter),
}));

jest.unstable_mockModule("../../modulos/detallefamilia/familia.controller.js", () => ({
  getHistorialFamiliar: mockGetHistorialFamiliar,
}));

await import("../../modulos/detallefamilia/familia.route.js");

describe("familia.route.js", () => {
  test("registra GET /:id con getHistorialFamiliar", () => {
    expect(mockGet).toHaveBeenCalledWith("/:id", mockGetHistorialFamiliar);
  });
});