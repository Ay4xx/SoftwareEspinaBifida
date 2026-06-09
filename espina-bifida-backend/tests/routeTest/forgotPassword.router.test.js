import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import express from "express";
import request from "supertest";

const mockRequestReset = jest.fn((req, res) => res.status(200).json({ handler: "requestReset" }));
const mockValidateToken = jest.fn((req, res) => res.status(200).json({ handler: "validateToken" }));
const mockResetPassword = jest.fn((req, res) => res.status(200).json({ handler: "resetPassword" }));

jest.unstable_mockModule("../../modulos/password/forgotPassword.controller.js", () => ({
  requestReset: mockRequestReset,
  validateToken: mockValidateToken,
  resetPassword: mockResetPassword,
}));

const { default: router } = await import("../../modulos/password/forgotPassword.router.js");

function createApp() {
  const app = express();
  app.use(express.json());
  app.use("/forgot-password", router);
  return app;
}

describe("forgotPassword.router.js", () => {
  beforeEach(() => jest.clearAllMocks());

  it("POST /request ejecuta requestReset", async () => {
    const response = await request(createApp()).post("/forgot-password/request").send({ correo: "test@mail.com" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ handler: "requestReset" });
    expect(mockRequestReset).toHaveBeenCalledTimes(1);
  });

  it("GET /validate ejecuta validateToken", async () => {
    const response = await request(createApp()).get("/forgot-password/validate?token=abc");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ handler: "validateToken" });
    expect(mockValidateToken).toHaveBeenCalledTimes(1);
  });

  it("POST /reset ejecuta resetPassword", async () => {
    const response = await request(createApp()).post("/forgot-password/reset").send({ token: "abc", password: "123" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ handler: "resetPassword" });
    expect(mockResetPassword).toHaveBeenCalledTimes(1);
  });
});
