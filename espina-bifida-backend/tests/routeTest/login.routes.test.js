import { jest, describe, test, expect } from "@jest/globals";

const mockPost = jest.fn();

const mockRouter = {
  post: mockPost,
};

const mockLoginPaciente = jest.fn();

jest.unstable_mockModule("express", () => ({
  default: {
    Router: jest.fn(() => mockRouter),
  },
  Router: jest.fn(() => mockRouter),
}));

jest.unstable_mockModule("../../modulos/login/login.controller.js", () => ({
  loginPaciente: mockLoginPaciente,
}));

await import("../../modulos/login/login.routes.js");

describe("login.routes.js", () => {
  test("registra POST / con loginPaciente", () => {
    expect(mockPost).toHaveBeenCalledWith("/", mockLoginPaciente);
  });
});