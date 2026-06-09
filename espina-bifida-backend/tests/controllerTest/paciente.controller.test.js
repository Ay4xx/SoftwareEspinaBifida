import { jest, describe, beforeEach, afterEach, test, expect } from "@jest/globals";

const mockCrearPacientePaso1 = jest.fn();
const mockActualizarPaso2 = jest.fn();
const mockActualizarPaso3 = jest.fn();
const mockActualizarPaso4 = jest.fn();
const mockActualizarPaso5 = jest.fn();
const mockGuardarDocumentos = jest.fn();

const mockEnviarCorreoPreRegistro = jest.fn();
const mockEnviarCorreoAltaManual = jest.fn();

jest.unstable_mockModule("../../modulos/registro/registro.service.js", () => ({
  crearPacientePaso1: mockCrearPacientePaso1,
  actualizarPaso2: mockActualizarPaso2,
  actualizarPaso3: mockActualizarPaso3,
  actualizarPaso4: mockActualizarPaso4,
  actualizarPaso5: mockActualizarPaso5,
  guardarDocumentos: mockGuardarDocumentos,
}));

jest.unstable_mockModule("../../modulos/email/email.service.js", () => ({
  enviarCorreoPreRegistro: mockEnviarCorreoPreRegistro,
  enviarCorreoAltaManual: mockEnviarCorreoAltaManual,
}));

const {
  registrarPaciente,
  contactoPaciente,
  historialMedicoPaciente,
  historialTutorPaciente,
  fotografiaPaciente,
} = await import("../../modulos/registro/registro.controller.js");

function mockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

describe("registro.controller.js", () => {
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe("registrarPaciente", () => {
    test("registra paciente correctamente", async () => {
      const req = {
        body: {
          nombre: "Ana",
          apellido: "López",
          genero: "F",
          fechaNacimiento: "2010-01-01",
          curp: "LOAA010101MNLXXX01",
          usuarioId: 5,
        },
      };
      const res = mockRes();

      const resultado = { pacienteId: 10 };
      mockCrearPacientePaso1.mockResolvedValue(resultado);

      await registrarPaciente(req, res);

      expect(mockCrearPacientePaso1).toHaveBeenCalledWith({
        nombre: "Ana",
        apellido: "López",
        genero: "F",
        fechaNacimiento: "2010-01-01",
        curp: "LOAA010101MNLXXX01",
        usuarioId: 5,
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        data: resultado,
      });
    });

    test("responde 400 si no viene CURP", async () => {
      const req = {
        body: {
          nombre: "Ana",
          apellido: "López",
        },
      };
      const res = mockRes();

      await registrarPaciente(req, res);

      expect(mockCrearPacientePaso1).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "La CURP es obligatoria.",
      });
    });

    test("responde 409 si la CURP está duplicada por code CURP_DUPLICADO", async () => {
      const req = {
        body: {
          nombre: "Ana",
          apellido: "López",
          curp: "LOAA010101MNLXXX01",
        },
      };
      const res = mockRes();

      const error = new Error("CURP duplicada");
      error.code = "CURP_DUPLICADO";

      mockCrearPacientePaso1.mockRejectedValue(error);

      await registrarPaciente(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Ya existe un paciente registrado con ese CURP.",
      });
    });

    test("responde 409 si la CURP está duplicada por errorNum 1", async () => {
      const req = {
        body: {
          nombre: "Ana",
          apellido: "López",
          curp: "LOAA010101MNLXXX01",
        },
      };
      const res = mockRes();

      const error = new Error("Unique constraint");
      error.errorNum = 1;

      mockCrearPacientePaso1.mockRejectedValue(error);

      await registrarPaciente(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Ya existe un paciente registrado con ese CURP.",
      });
    });

    test("responde 500 si falla registrarPaciente", async () => {
      const req = {
        body: {
          nombre: "Ana",
          apellido: "López",
          curp: "LOAA010101MNLXXX01",
        },
      };
      const res = mockRes();

      mockCrearPacientePaso1.mockRejectedValue(new Error("Error DB"));

      await registrarPaciente(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Error al registrar el paciente.",
      });
    });
  });

  describe("contactoPaciente", () => {
    test("guarda contacto correctamente", async () => {
      const req = {
        params: { id: "10" },
        body: {
          direccion: "Calle 123",
          ciudad: "Monterrey",
          estado: "Nuevo León",
          codigoPostal: "64000",
          emergenciaContacto: "Mamá",
          emergenciaTelefono: "8111111111",
          telefonoCasa: "8122222222",
          telefonoCelular: "8133333333",
          correo: "ana@test.com",
          usuarioId: 5,
          nombre: "Ana",
          apellido: "López",
        },
      };
      const res = mockRes();

      mockActualizarPaso2.mockResolvedValue();

      await contactoPaciente(req, res);

      expect(mockActualizarPaso2).toHaveBeenCalledWith(10, {
        direccion: "Calle 123",
        ciudad: "Monterrey",
        estado: "Nuevo León",
        codigoPostal: "64000",
        emergenciaContacto: "Mamá",
        emergenciaTelefono: "8111111111",
        telefonoCasa: "8122222222",
        telefonoCelular: "8133333333",
        correo: "ana@test.com",
      });

      expect(mockEnviarCorreoPreRegistro).not.toHaveBeenCalled();

      expect(res.json).toHaveBeenCalledWith({
        ok: true,
      });
    });

    test("envía correo de pre-registro si no hay usuarioId y sí hay correo", async () => {
      const req = {
        params: { id: "10" },
        body: {
          direccion: "Calle 123",
          ciudad: "Monterrey",
          estado: "Nuevo León",
          codigoPostal: "64000",
          emergenciaContacto: "Mamá",
          emergenciaTelefono: "8111111111",
          telefonoCasa: "8122222222",
          telefonoCelular: "8133333333",
          correo: "ana@test.com",
          usuarioId: null,
          nombre: "Ana",
          apellido: "López",
        },
      };
      const res = mockRes();

      mockActualizarPaso2.mockResolvedValue();
      mockEnviarCorreoPreRegistro.mockResolvedValue();

      await contactoPaciente(req, res);

      expect(mockEnviarCorreoPreRegistro).toHaveBeenCalledWith({
        nombre: "Ana",
        apellido: "López",
        correo: "ana@test.com",
      });

      expect(res.json).toHaveBeenCalledWith({
        ok: true,
      });
    });

    test("no falla si el correo de pre-registro falla", async () => {
      const req = {
        params: { id: "10" },
        body: {
          correo: "ana@test.com",
          usuarioId: null,
          nombre: "Ana",
          apellido: "López",
        },
      };
      const res = mockRes();

      mockActualizarPaso2.mockResolvedValue();
      mockEnviarCorreoPreRegistro.mockRejectedValue(new Error("Error correo"));

      await contactoPaciente(req, res);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error al enviar correo (pre-registro):",
        expect.any(Error)
      );

      expect(res.json).toHaveBeenCalledWith({
        ok: true,
      });
    });

    test("responde 500 si falla contactoPaciente", async () => {
      const req = {
        params: { id: "10" },
        body: {
          correo: "ana@test.com",
        },
      };
      const res = mockRes();

      mockActualizarPaso2.mockRejectedValue(new Error("Error DB"));

      await contactoPaciente(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Error al guardar contacto.",
      });
    });
  });

  describe("historialMedicoPaciente", () => {
    test("guarda historial médico correctamente", async () => {
      const req = {
        params: { id: "10" },
        body: {
          lugarNacimiento: "Monterrey",
          hospitalNacimiento: "Hospital A",
          tipoSangre: "O+",
          usaValvula: "No",
          notas: "Sin notas",
          tipoEspinaBifida: "Mielomeningocele",
          otrosPadecimiento: "Ninguno",
        },
      };
      const res = mockRes();

      mockActualizarPaso3.mockResolvedValue();

      await historialMedicoPaciente(req, res);

      expect(mockActualizarPaso3).toHaveBeenCalledWith(10, {
        lugarNacimiento: "Monterrey",
        hospitalNacimiento: "Hospital A",
        tipoSangre: "O+",
        usaValvula: "No",
        notas: "Sin notas",
        tipoEspinaBifida: "Mielomeningocele",
        otrosPadecimiento: "Ninguno",
      });

      expect(res.json).toHaveBeenCalledWith({
        ok: true,
      });
    });

    test("responde 500 si falla historialMedicoPaciente", async () => {
      const req = {
        params: { id: "10" },
        body: {},
      };
      const res = mockRes();

      mockActualizarPaso3.mockRejectedValue(new Error("Error DB"));

      await historialMedicoPaciente(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Error al guardar historial médico.",
      });
    });
  });

  describe("historialTutorPaciente", () => {
    test("guarda historial del tutor correctamente", async () => {
      const datos = {
        madreNombre: "María",
        padreNombre: "Juan",
        adicciones: "Ninguna",
      };

      const req = {
        params: { id: "10" },
        body: datos,
      };
      const res = mockRes();

      mockActualizarPaso4.mockResolvedValue();

      await historialTutorPaciente(req, res);

      expect(mockActualizarPaso4).toHaveBeenCalledWith(10, datos);
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
      });
    });

    test("responde 500 si falla historialTutorPaciente", async () => {
      const req = {
        params: { id: "10" },
        body: {},
      };
      const res = mockRes();

      mockActualizarPaso4.mockRejectedValue(new Error("Error DB"));

      await historialTutorPaciente(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Error al guardar historial del tutor.",
      });
    });
  });

  describe("fotografiaPaciente", () => {
    test("guarda fotografía si viene archivo foto", async () => {
      const fotoBuffer = Buffer.from("foto-test");

      const req = {
        params: { id: "10" },
        body: {},
        files: {
          foto: [{ buffer: fotoBuffer }],
        },
      };
      const res = mockRes();

      mockActualizarPaso5.mockResolvedValue();

      await fotografiaPaciente(req, res);

      expect(mockActualizarPaso5).toHaveBeenCalledWith(10, fotoBuffer);
      expect(mockGuardarDocumentos).not.toHaveBeenCalled();
      expect(mockEnviarCorreoAltaManual).not.toHaveBeenCalled();

      expect(res.json).toHaveBeenCalledWith({
        ok: true,
      });
    });

    test("guarda documentos si vienen archivos de documentos", async () => {
      const docPreregistro = Buffer.from("doc-preregistro");
      const docCurp = Buffer.from("doc-curp");

      const req = {
        params: { id: "10" },
        body: {},
        files: {
          docPreregistro: [{ buffer: docPreregistro }],
          docCurp: [{ buffer: docCurp }],
        },
      };
      const res = mockRes();

      mockGuardarDocumentos.mockResolvedValue();

      await fotografiaPaciente(req, res);

      expect(mockActualizarPaso5).not.toHaveBeenCalled();

      expect(mockGuardarDocumentos).toHaveBeenCalledWith(10, {
        docPreregistro,
        docActaNacimiento: null,
        docCurp,
        docComprobanteDomicilio: null,
        docIneFamilia: null,
      });

      expect(res.json).toHaveBeenCalledWith({
        ok: true,
      });
    });

    test("guarda foto y documentos si ambos vienen en files", async () => {
      const fotoBuffer = Buffer.from("foto-test");
      const docActaNacimiento = Buffer.from("acta");

      const req = {
        params: { id: "10" },
        body: {},
        files: {
          foto: [{ buffer: fotoBuffer }],
          docActaNacimiento: [{ buffer: docActaNacimiento }],
        },
      };
      const res = mockRes();

      mockActualizarPaso5.mockResolvedValue();
      mockGuardarDocumentos.mockResolvedValue();

      await fotografiaPaciente(req, res);

      expect(mockActualizarPaso5).toHaveBeenCalledWith(10, fotoBuffer);

      expect(mockGuardarDocumentos).toHaveBeenCalledWith(10, {
        docPreregistro: null,
        docActaNacimiento,
        docCurp: null,
        docComprobanteDomicilio: null,
        docIneFamilia: null,
      });

      expect(res.json).toHaveBeenCalledWith({
        ok: true,
      });
    });

    test("envía correo de alta manual si hay usuarioId y correo", async () => {
      const req = {
        params: { id: "10" },
        body: {
          usuarioId: 5,
          nombre: "Ana",
          apellido: "López",
          correo: "ana@test.com",
        },
        files: {},
      };
      const res = mockRes();

      mockEnviarCorreoAltaManual.mockResolvedValue();

      await fotografiaPaciente(req, res);

      expect(mockEnviarCorreoAltaManual).toHaveBeenCalledWith({
        nombre: "Ana",
        apellido: "López",
        correo: "ana@test.com",
      });

      expect(res.json).toHaveBeenCalledWith({
        ok: true,
      });
    });

    test("no falla si el correo de alta manual falla", async () => {
      const req = {
        params: { id: "10" },
        body: {
          usuarioId: 5,
          nombre: "Ana",
          apellido: "López",
          correo: "ana@test.com",
        },
        files: {},
      };
      const res = mockRes();

      mockEnviarCorreoAltaManual.mockRejectedValue(new Error("Error correo"));

      await fotografiaPaciente(req, res);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error al enviar correo (alta-manual):",
        expect.any(Error)
      );

      expect(res.json).toHaveBeenCalledWith({
        ok: true,
      });
    });

    test("responde ok aunque no vengan files", async () => {
      const req = {
        params: { id: "10" },
        body: {},
      };
      const res = mockRes();

      await fotografiaPaciente(req, res);

      expect(mockActualizarPaso5).not.toHaveBeenCalled();
      expect(mockGuardarDocumentos).not.toHaveBeenCalled();

      expect(res.json).toHaveBeenCalledWith({
        ok: true,
      });
    });

    test("responde 500 si falla actualizarPaso5", async () => {
      const req = {
        params: { id: "10" },
        body: {},
        files: {
          foto: [{ buffer: Buffer.from("foto-test") }],
        },
      };
      const res = mockRes();

      mockActualizarPaso5.mockRejectedValue(new Error("Error foto"));

      await fotografiaPaciente(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Error al guardar la fotografía.",
      });
    });

    test("responde 500 si falla guardarDocumentos", async () => {
      const req = {
        params: { id: "10" },
        body: {},
        files: {
          docCurp: [{ buffer: Buffer.from("curp") }],
        },
      };
      const res = mockRes();

      mockGuardarDocumentos.mockRejectedValue(new Error("Error documentos"));

      await fotografiaPaciente(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Error al guardar la fotografía.",
      });
    });
  });
});