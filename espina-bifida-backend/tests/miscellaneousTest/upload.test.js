import { describe, it, expect } from "@jest/globals";
import express from "express";
import request from "supertest";
import upload from "../../modulos/middlewares/upload.js";

function createApp() {
  const app = express();

  app.post("/upload", upload.single("archivo"), (req, res) => {
    res.status(200).json({
      fieldname: req.file?.fieldname,
      originalname: req.file?.originalname,
      size: req.file?.buffer?.length,
      hasBuffer: Buffer.isBuffer(req.file?.buffer),
    });
  });

  return app;
}

describe("upload.js", () => {
  it("guarda el archivo en memoria usando multer", async () => {
    const contenido = Buffer.from("contenido de prueba");

    const response = await request(createApp())
      .post("/upload")
      .attach("archivo", contenido, "prueba.txt");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      fieldname: "archivo",
      originalname: "prueba.txt",
      size: contenido.length,
      hasBuffer: true,
    });
  });
});
