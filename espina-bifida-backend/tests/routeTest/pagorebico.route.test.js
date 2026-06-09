import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import express from "express";
import request from "supertest";

const mockGuardarPago = jest.fn((req, res) => res.status(201).json({ handler: "guardarPago" }));

jest.unstable_mockModule("../../modulos/pagorecibo/pagorecibo.controller.js", () => ({
  guardarPago: mockGuardarPago,
}));

const { default: router } = await import("../../modulos/pagorecibo/pagorebico.route.js");

function createApp() {
  const app = express();
  app.use(express.json());
  app.use("/pagorecibo", router);
  return app;
}

describe("pagorebico.route.js", () => {
  beforeEach(() => jest.clearAllMocks());

  it("POST /guardar ejecuta guardarPago", async () => {
    const response = await request(createApp()).post("/pagorecibo/guardar").send({ pacienteId: 1, monto: 100 });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ handler: "guardarPago" });
    expect(mockGuardarPago).toHaveBeenCalledTimes(1);
  });
});
