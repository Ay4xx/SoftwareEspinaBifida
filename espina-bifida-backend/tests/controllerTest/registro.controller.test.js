import { jest, describe, beforeEach, afterEach, test, expect } from "@jest/globals";

const mockCrearPacientePaso1 = jest.fn();
const mockActualizarPaso2 = jest.fn();
const mockActualizarPaso3 = jest.fn();
const mockActualizarPaso4 = jest.fn();
const mockActualizarPaso5 = jest.fn();

const mockEnviarCorreoPreRegistro = jest.fn();
const mockEnviarCorreoAltaManual = jest.fn();

jest.unstable_mockModule("../../modulos/registro/registro.service.js", () => ({
  crearPacientePaso1: mockCrearPacientePaso1,
  actualizarPaso2: mockActualizarPaso2,
  actualizarPaso3: mockActualizarPaso3,
  actualizarPaso4: mockActualizarPaso4,
  actualizarPaso5: mockActualizarPaso5,
}));

jest.unstable_mockModule("../../modulos/email/email.service.js", () => ({
  enviarCorreoPreRegistro: mockEnviarCorreoPreRegistro,
  enviarCorreoAltaManual: mockEnviarCorreoAltaManual,
}));

const {
  registrarPaciente,
  fotografiaPaciente,
  historialTutorPaciente,
  historialMedicoPaciente,
  contactoPaciente,
} = await import("../../modulos/registro/registro.controller.js");

function crearMockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
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
    test("debe registrar paciente paso 1 correctamente", async () => {
      const req = {
        body: {
          nombre: "Juan",
          apellido: "Pérez",
          genero: "M",
          fechaNacimiento: "2010-01-01",
          curp: "JUAP100101HNLXXX01",
          usuarioId: 1,
        },
      };
      const res = crearMockRes();

      mockCrearPacientePaso1.mockResolvedValue({ pacienteId: 10 });

      await registrarPaciente(req, res);

      expect(mockCrearPacientePaso1).toHaveBeenCalledWith({
        nombre: "Juan",
        apellido: "Pérez",
        genero: "M",
        fechaNacimiento: "2010-01-01",
        curp: "JUAP100101HNLXXX01",
        usuarioId: 1,
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        data: { pacienteId: 10 },
      });
    });

    test("debe responder 400 si faltan campos obligatorios", async () => {
      const req = {
        body: {
          nombre: "Juan",
          apellido: "Pérez",
        },
      };
      const res = crearMockRes();

      await registrarPaciente(req, res);

      expect(mockCrearPacientePaso1).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Todos los campos del paso 1 son obligatorios.",
      });
    });

    test("debe responder 409 si CURP está duplicado por code", async () => {
      const req = {
        body: {
          nombre: "Juan",
          apellido: "Pérez",
          genero: "M",
          fechaNacimiento: "2010-01-01",
          curp: "CURP123",
        },
      };
      const res = crearMockRes();

      const error = new Error("CURP duplicado");
      error.code = "CURP_DUPLICADO";

      mockCrearPacientePaso1.mockRejectedValue(error);

      await registrarPaciente(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Ya existe un paciente registrado con ese CURP.",
      });
    });

    test("debe responder 409 si Oracle devuelve errorNum 1", async () => {
      const req = {
        body: {
          nombre: "Juan",
          apellido: "Pérez",
          genero: "M",
          fechaNacimiento: "2010-01-01",
          curp: "CURP123",
        },
      };
      const res = crearMockRes();

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

    test("debe responder 500 si falla registro", async () => {
      const req = {
        body: {
          nombre: "Juan",
          apellido: "Pérez",
          genero: "M",
          fechaNacimiento: "2010-01-01",
          curp: "CURP123",
        },
      };
      const res = crearMockRes();

      mockCrearPacientePaso1.mockRejectedValue(new Error("DB error"));

      await registrarPaciente(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Error al registrar el paciente.",
      });
    });
  });

  describe("fotografiaPaciente", () => {
    test("debe guardar fotografía correctamente", async () => {
      const buffer = Buffer.from("foto");

      const req = {
        params: { id: "10" },
        body: {},
        file: { buffer },
      };
      const res = crearMockRes();

      mockActualizarPaso5.mockResolvedValue();

      await fotografiaPaciente(req, res);

      expect(mockActualizarPaso5).toHaveBeenCalledWith(10, buffer);
      expect(mockEnviarCorreoAltaManual).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ ok: true });
    });

    test("debe enviar correo de alta manual si tiene usuarioId y correo", async () => {
      const buffer = Buffer.from("foto");

      const req = {
        params: { id: "10" },
        body: {
          usuarioId: 1,
          nombre: "Ana",
          apellido: "López",
          correo: "ana@test.com",
        },
        file: { buffer },
      };
      const res = crearMockRes();

      mockActualizarPaso5.mockResolvedValue();
      mockEnviarCorreoAltaManual.mockResolvedValue();

      await fotografiaPaciente(req, res);

      expect(mockActualizarPaso5).toHaveBeenCalledWith(10, buffer);
      expect(mockEnviarCorreoAltaManual).toHaveBeenCalledWith({
        nombre: "Ana",
        apellido: "López",
        correo: "ana@test.com",
      });
      expect(res.json).toHaveBeenCalledWith({ ok: true });
    });

    test("debe guardar aunque falle el correo de alta manual", async () => {
      const buffer = Buffer.from("foto");

      const req = {
        params: { id: "10" },
        body: {
          usuarioId: 1,
          nombre: "Ana",
          apellido: "López",
          correo: "ana@test.com",
        },
        file: { buffer },
      };
      const res = crearMockRes();

      mockActualizarPaso5.mockResolvedValue();
      mockEnviarCorreoAltaManual.mockRejectedValue(new Error("Error correo"));

      await fotografiaPaciente(req, res);

      expect(res.json).toHaveBeenCalledWith({ ok: true });
    });

    test("debe responder 400 si no se recibe imagen", async () => {
      const req = {
        params: { id: "10" },
        body: {},
        file: null,
      };
      const res = crearMockRes();

      await fotografiaPaciente(req, res);

      expect(mockActualizarPaso5).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "No se recibió ninguna imagen.",
      });
    });

    test("debe responder 500 si falla guardar fotografía", async () => {
      const req = {
        params: { id: "10" },
        body: {},
        file: { buffer: Buffer.from("foto") },
      };
      const res = crearMockRes();

      mockActualizarPaso5.mockRejectedValue(new Error("DB error"));

      await fotografiaPaciente(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Error al guardar la fotografía.",
      });
    });
  });

  describe("historialTutorPaciente", () => {
    test("debe guardar historial del tutor correctamente", async () => {
      const req = {
        params: { id: "10" },
        body: {
          tutorLugarNacimiento: "Monterrey",
          tutorEdad: "35",
          tutorOcupacion: "Maestra",
          tutorEscolaridad: "Licenciatura",
          tutorParentesco: "Sí",
          madreSeguroMedico: "IMSS",
          cdEmbarazo: "No",
          acidoFolico: "Sí",
          citasControl: "5",
        },
      };
      const res = crearMockRes();

      mockActualizarPaso4.mockResolvedValue();

      await historialTutorPaciente(req, res);

      expect(mockActualizarPaso4).toHaveBeenCalledWith(10, req.body);
      expect(res.json).toHaveBeenCalledWith({ ok: true });
    });

    test("debe responder 500 si falla historial tutor", async () => {
      const req = {
        params: { id: "10" },
        body: {},
      };
      const res = crearMockRes();

      mockActualizarPaso4.mockRejectedValue(new Error("DB error"));

      await historialTutorPaciente(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Error al guardar historial del tutor.",
      });
    });
  });

  describe("historialMedicoPaciente", () => {
    test("debe guardar historial médico correctamente", async () => {
      const req = {
        params: { id: "10" },
        body: {
          lugarNacimiento: "Monterrey",
          hospitalNacimiento: "Hospital A",
          tipoSangre: "O+",
          usaValvula: "Sí",
          notas: "Sin notas",
        },
      };
      const res = crearMockRes();

      mockActualizarPaso3.mockResolvedValue();

      await historialMedicoPaciente(req, res);

      expect(mockActualizarPaso3).toHaveBeenCalledWith(10, req.body);
      expect(res.json).toHaveBeenCalledWith({ ok: true });
    });

    test("debe responder 400 si faltan campos médicos obligatorios", async () => {
      const req = {
        params: { id: "10" },
        body: {
          lugarNacimiento: "Monterrey",
          hospitalNacimiento: "",
          tipoSangre: "O+",
        },
      };
      const res = crearMockRes();

      await historialMedicoPaciente(req, res);

      expect(mockActualizarPaso3).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Lugar de nacimiento, hospital y tipo de sangre son obligatorios.",
      });
    });

    test("debe responder 500 si falla historial médico", async () => {
      const req = {
        params: { id: "10" },
        body: {
          lugarNacimiento: "Monterrey",
          hospitalNacimiento: "Hospital A",
          tipoSangre: "O+",
        },
      };
      const res = crearMockRes();

      mockActualizarPaso3.mockRejectedValue(new Error("DB error"));

      await historialMedicoPaciente(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Error al guardar historial médico.",
      });
    });
  });

  describe("contactoPaciente", () => {
    test("debe guardar contacto correctamente", async () => {
      const req = {
        params: { id: "10" },
        body: {
          direccion: "Calle 1",
          ciudad: "Monterrey",
          estado: "Nuevo León",
          codigoPostal: "64000",
          emergenciaContacto: "Mamá",
          emergenciaTelefono: "8181818181",
          telefonoCasa: "8111111111",
          telefonoCelular: "8122222222",
          correo: "paciente@test.com",
          usuarioId: 1,
          nombre: "Juan",
          apellido: "Pérez",
        },
      };
      const res = crearMockRes();

      mockActualizarPaso2.mockResolvedValue();

      await contactoPaciente(req, res);

      expect(mockActualizarPaso2).toHaveBeenCalledWith(10, {
        direccion: "Calle 1",
        ciudad: "Monterrey",
        estado: "Nuevo León",
        codigoPostal: "64000",
        emergenciaContacto: "Mamá",
        emergenciaTelefono: "8181818181",
        telefonoCasa: "8111111111",
        telefonoCelular: "8122222222",
        correo: "paciente@test.com",
      });

      expect(mockEnviarCorreoPreRegistro).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ ok: true });
    });

    test("debe enviar correo de pre-registro si es invitado y tiene correo", async () => {
      const req = {
        params: { id: "10" },
        body: {
          direccion: "Calle 1",
          ciudad: "Monterrey",
          estado: "Nuevo León",
          codigoPostal: "64000",
          emergenciaContacto: "Mamá",
          emergenciaTelefono: "8181818181",
          telefonoCasa: "",
          telefonoCelular: "8122222222",
          correo: "paciente@test.com",
          usuarioId: null,
          nombre: "Juan",
          apellido: "Pérez",
        },
      };
      const res = crearMockRes();

      mockActualizarPaso2.mockResolvedValue();
      mockEnviarCorreoPreRegistro.mockResolvedValue();

      await contactoPaciente(req, res);

      expect(mockEnviarCorreoPreRegistro).toHaveBeenCalledWith({
        nombre: "Juan",
        apellido: "Pérez",
        correo: "paciente@test.com",
      });

      expect(res.json).toHaveBeenCalledWith({ ok: true });
    });

    test("debe guardar contacto aunque falle el correo de pre-registro", async () => {
      const req = {
        params: { id: "10" },
        body: {
          direccion: "Calle 1",
          ciudad: "Monterrey",
          estado: "Nuevo León",
          codigoPostal: "64000",
          emergenciaContacto: "Mamá",
          emergenciaTelefono: "8181818181",
          correo: "paciente@test.com",
          usuarioId: null,
          nombre: "Juan",
          apellido: "Pérez",
        },
      };
      const res = crearMockRes();

      mockActualizarPaso2.mockResolvedValue();
      mockEnviarCorreoPreRegistro.mockRejectedValue(new Error("Error correo"));

      await contactoPaciente(req, res);

      expect(res.json).toHaveBeenCalledWith({ ok: true });
    });

    test("debe responder 400 si faltan campos obligatorios de contacto", async () => {
      const req = {
        params: { id: "10" },
        body: {
          direccion: "Calle 1",
          ciudad: "Monterrey",
        },
      };
      const res = crearMockRes();

      await contactoPaciente(req, res);

      expect(mockActualizarPaso2).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Faltan campos obligatorios de contacto.",
      });
    });

    test("debe responder 500 si falla guardar contacto", async () => {
      const req = {
        params: { id: "10" },
        body: {
          direccion: "Calle 1",
          ciudad: "Monterrey",
          estado: "Nuevo León",
          codigoPostal: "64000",
          emergenciaContacto: "Mamá",
          emergenciaTelefono: "8181818181",
        },
      };
      const res = crearMockRes();

      mockActualizarPaso2.mockRejectedValue(new Error("DB error"));

      await contactoPaciente(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Error al guardar contacto.",
      });
    });
  });
});