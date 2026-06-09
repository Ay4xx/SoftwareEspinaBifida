import { jest } from "@jest/globals";

process.env.MAIL_USER = "asociacion@test.com";
process.env.MAIL_PASS = "password-test";

const sendMail = jest.fn();
const createTransport = jest.fn(() => ({ sendMail }));

jest.unstable_mockModule("nodemailer", () => ({
  default: { createTransport },
}));

const {
  enviarCorreoPreRegistro,
  enviarCorreoAprobacion,
  enviarCorreoRechazo,
  enviarCorreoAltaManual,
  enviarCorreoRecuperacion,
} = await import("../../modulos/email/email.service.js");

describe("email.service", () => {
  beforeEach(() => {
    sendMail.mockClear();
  });

  test("configura transporter de nodemailer", () => {
    expect(createTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        service: "gmail",
        auth: expect.objectContaining({
          user: "asociacion@test.com",
          pass: "password-test",
        }),
      })
    );
  });

  test("enviarCorreoPreRegistro no envía si no hay correo", async () => {
    await enviarCorreoPreRegistro({ nombre: "Ana", apellido: "López" });

    expect(sendMail).not.toHaveBeenCalled();
  });

  test("envía correo de preregistro", async () => {
    await enviarCorreoPreRegistro({
      nombre: "Ana",
      apellido: "López",
      correo: "ana@test.com",
    });

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "ana@test.com",
        subject: "Solicitud de registro recibida",
        html: expect.stringContaining("Ana López"),
      })
    );
  });

  test("envía correo de aprobación", async () => {
    await enviarCorreoAprobacion({
      nombre: "Ana",
      apellido: "López",
      correo: "ana@test.com",
    });

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "ana@test.com",
        subject: "Solicitud de registro aprobada",
        html: expect.stringContaining("aprobada"),
      })
    );
  });

  test("envía correo de rechazo", async () => {
    await enviarCorreoRechazo({
      nombre: "Ana",
      apellido: "López",
      correo: "ana@test.com",
    });

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "ana@test.com",
        subject: "Solicitud de registro rechazada",
        html: expect.stringContaining("rechazada"),
      })
    );
  });

  test("envía correo de alta manual", async () => {
    await enviarCorreoAltaManual({
      nombre: "Ana",
      apellido: "López",
      correo: "ana@test.com",
    });

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "ana@test.com",
        subject: "Bienvenido a la Asociación Espina Bífida",
        html: expect.stringContaining("Bienvenido"),
      })
    );
  });

  test("envía correo de recuperación con link", async () => {
    await enviarCorreoRecuperacion({
      nombre: "Ana",
      correo: "ana@test.com",
      link: "http://app/reset?token=abc",
    });

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "ana@test.com",
        subject: "Recuperación de contraseña",
        html: expect.stringContaining("http://app/reset?token=abc"),
      })
    );
  });
});