import { describe, it, expect } from "@jest/globals";
import express from "express";
import request from "supertest";
import { uploadPaso5 } from "../../modulos/registro/registro.multer.js";

function createApp() {
  const app = express();

  app.post("/paso5", uploadPaso5, (req, res) => {
    res.status(200).json({
      fileFields: Object.keys(req.files || {}).sort(),
      fotoSize: req.files?.foto?.[0]?.buffer?.length || 0,
    });
  });

  app.use((err, req, res, next) => {
    res.status(400).json({ error: err.message, code: err.code });
  });

  return app;
}

describe("registro.multer.js", () => {
  it("acepta los campos configurados en memoria", async () => {
    const response = await request(createApp())
      .post("/paso5")
      .attach("foto", Buffer.from("foto"), "foto.jpg")
      .attach("docCurp", Buffer.from("curp"), "curp.pdf")
      .attach("docActaNacimiento", Buffer.from("acta"), "acta.pdf");

    expect(response.status).toBe(200);
    expect(response.body.fileFields).toEqual(["docActaNacimiento", "docCurp", "foto"]);
    expect(response.body.fotoSize).toBe(Buffer.from("foto").length);
  });

  it("rechaza campos no configurados", async () => {
    const response = await request(createApp())
      .post("/paso5")
      .attach("archivoNoPermitido", Buffer.from("x"), "x.pdf");

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("LIMIT_UNEXPECTED_FILE");
  });

  it("rechaza archivos mayores a 10 MB", async () => {
    const archivoGrande = Buffer.alloc(10 * 1024 * 1024 + 1);

    const response = await request(createApp())
      .post("/paso5")
      .attach("foto", archivoGrande, "grande.jpg");

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("LIMIT_FILE_SIZE");
  });
});
