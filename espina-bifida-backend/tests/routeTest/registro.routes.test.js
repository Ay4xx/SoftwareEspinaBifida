import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import express from "express";
import request from "supertest";

const mockRegistrarPaciente = jest.fn((req, res) => res.status(201).json({ handler: "registrarPaciente" }));
const mockContactoPaciente = jest.fn((req, res) => res.status(200).json({ handler: "contactoPaciente" }));
const mockHistorialMedicoPaciente = jest.fn((req, res) => res.status(200).json({ handler: "historialMedicoPaciente" }));
const mockHistorialTutorPaciente = jest.fn((req, res) => res.status(200).json({ handler: "historialTutorPaciente" }));
const mockFotografiaPaciente = jest.fn((req, res) => res.status(200).json({ handler: "fotografiaPaciente", multerPaso5: req.multerPaso5 === true }));
const mockUploadPaso5 = jest.fn((req, res, next) => {
  req.multerPaso5 = true;
  next();
});

jest.unstable_mockModule("../../modulos/registro/registro.controller.js", () => ({
  registrarPaciente: mockRegistrarPaciente,
  contactoPaciente: mockContactoPaciente,
  historialMedicoPaciente: mockHistorialMedicoPaciente,
  historialTutorPaciente: mockHistorialTutorPaciente,
  fotografiaPaciente: mockFotografiaPaciente,
}));

jest.unstable_mockModule("../../modulos/registro/registro.multer.js", () => ({
  uploadPaso5: mockUploadPaso5,
}));

const { default: router } = await import("../../modulos/registro/registro.routes.js");

function createApp() {
  const app = express();
  app.use(express.json());
  app.use("/registro", router);
  return app;
}

describe("registro.routes.js", () => {
  beforeEach(() => jest.clearAllMocks());

  it("POST / ejecuta registrarPaciente", async () => {
    const response = await request(createApp()).post("/registro").send({ nombre: "Ana" });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ handler: "registrarPaciente" });
    expect(mockRegistrarPaciente).toHaveBeenCalledTimes(1);
  });

  it("PUT /:id/paso2 ejecuta contactoPaciente", async () => {
    const response = await request(createApp()).put("/registro/10/paso2").send({ telefono: "811" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ handler: "contactoPaciente" });
    expect(mockContactoPaciente).toHaveBeenCalledTimes(1);
  });

  it("PUT /:id/paso3 ejecuta historialMedicoPaciente", async () => {
    const response = await request(createApp()).put("/registro/10/paso3").send({ diagnostico: "x" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ handler: "historialMedicoPaciente" });
    expect(mockHistorialMedicoPaciente).toHaveBeenCalledTimes(1);
  });

  it("PUT /:id/paso4 ejecuta historialTutorPaciente", async () => {
    const response = await request(createApp()).put("/registro/10/paso4").send({ tutor: "Laura" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ handler: "historialTutorPaciente" });
    expect(mockHistorialTutorPaciente).toHaveBeenCalledTimes(1);
  });

  it("PUT /:id/paso5 ejecuta uploadPaso5 antes de fotografiaPaciente", async () => {
    const response = await request(createApp()).put("/registro/10/paso5").send({});

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ handler: "fotografiaPaciente", multerPaso5: true });
    expect(mockUploadPaso5).toHaveBeenCalledTimes(1);
    expect(mockFotografiaPaciente).toHaveBeenCalledTimes(1);
  });
});
