import { jest, describe, beforeEach, afterEach, test, expect } from "@jest/globals";
import { Readable } from "node:stream";

const mockExecute = jest.fn();
const mockClose = jest.fn();
const mockGetConnection = jest.fn();

const mockMapPacienteToCard = jest.fn();
const mockObtenerMembresiaPorPacienteId = jest.fn();

jest.unstable_mockModule("oracledb", () => ({
  default: {
    OUT_FORMAT_OBJECT: "OUT_FORMAT_OBJECT",
  },
  OUT_FORMAT_OBJECT: "OUT_FORMAT_OBJECT",
}));

jest.unstable_mockModule("../../config/db.js", () => ({
  getConnection: mockGetConnection,
}));

jest.unstable_mockModule("../../modulos/paciente/paciente.mapper.js", () => ({
  mapPacienteToCard: mockMapPacienteToCard,
}));

jest.unstable_mockModule("../../modulos/membresia/membresia.service.js", () => ({
  obtenerMembresiaPorPacienteId: mockObtenerMembresiaPorPacienteId,
}));

const {
  getPacienteCards,
  getPacienteCredencial,
  getPacienteDetail,
  getPacienteDetalle,
  guardarFoto,
  obtenerFoto,
  updatePaciente,
  getPacienteCompleto,
  updateHistorialMadre,
} = await import("../../modulos/paciente/paciente.service.js");

function mockConnection() {
  return {
    execute: mockExecute,
    close: mockClose,
  };
}

describe("paciente.service.js", () => {
  let consoleSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetConnection.mockResolvedValue(mockConnection());
    consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe("getPacienteCards", () => {
    test("debe obtener pacientes y mapearlos a cards", async () => {
      const rows = [
        { PACIENTE_ID: 1, NOMBRE: "Ana", APELLIDO: "López" },
        { PACIENTE_ID: 2, NOMBRE: "Juan", APELLIDO: "Pérez" },
      ];

      mockExecute.mockResolvedValue({ rows });
      mockMapPacienteToCard
        .mockReturnValueOnce({ id: 1, name: "Ana López" })
        .mockReturnValueOnce({ id: 2, name: "Juan Pérez" });

      const result = await getPacienteCards("ana");

      expect(mockGetConnection).toHaveBeenCalled();
      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining("SELECT"),
        { search: "ana" },
        { outFormat: "OUT_FORMAT_OBJECT" }
      );
      expect(mockMapPacienteToCard).toHaveBeenCalledTimes(2);
      expect(result).toEqual([
        { id: 1, name: "Ana López" },
        { id: 2, name: "Juan Pérez" },
      ]);
      expect(mockClose).toHaveBeenCalled();
    });

    test("debe mandar search como null si viene vacío", async () => {
      mockExecute.mockResolvedValue({ rows: [] });

      await getPacienteCards("   ");

      expect(mockExecute).toHaveBeenCalledWith(
        expect.any(String),
        { search: null },
        { outFormat: "OUT_FORMAT_OBJECT" }
      );
    });

    test("debe cerrar conexión aunque falle", async () => {
      mockExecute.mockRejectedValue(new Error("DB error"));

      await expect(getPacienteCards()).rejects.toThrow("DB error");

      expect(mockClose).toHaveBeenCalled();
    });
  });

  describe("getPacienteCredencial", () => {
    test("debe regresar null si no encuentra paciente", async () => {
      mockExecute.mockResolvedValue({ rows: [] });

      const result = await getPacienteCredencial(99);

      expect(result).toBeNull();
      expect(mockClose).toHaveBeenCalled();
    });

    test("debe mapear credencial correctamente", async () => {
      mockExecute.mockResolvedValue({
        rows: [
          {
            FOLIO: "001",
            NOMBRE: "Luis",
            APELLIDO: "García",
            DIRECCION: "Monterrey, Nuevo León",
            TELCASA: "111",
            PADRES: "Mamá",
            FECHAEXPEDICION: "20/05/26",
            TIPOSANGRE: "O+",
            VALVULA: "Sí",
            ACCIDENTEAVISAR: "Mamá",
            TELEFONOEMERGENCIA: "222",
            CORREO: "luis@test.com",
            FECHANACIMIENTO: "01/01/2010",
            LUGARNACIMIENTO: "Monterrey",
            HOSPITAL: "Hospital A",
          },
        ],
      });

      const result = await getPacienteCredencial(1);

      expect(result).toEqual({
        folio: "001",
        nombre: "Luis",
        apellido: "García",
        nombreCompleto: "Luis García",
        direccion: "Monterrey, Nuevo León",
        telCasa: "111",
        padres: "Mamá",
        fechaExpedicion: "20/05/26",
        tipoSangre: "O+",
        valvula: "Sí",
        accidenteAvisar: "Mamá",
        telefonoEmergencia: "222",
        correo: "luis@test.com",
        fechaNacimiento: "01/01/2010",
        lugarNacimiento: "Monterrey",
        hospital: "Hospital A",
      });
    });
  });

  describe("getPacienteDetail", () => {
    test("debe regresar null si no encuentra paciente", async () => {
      mockExecute.mockResolvedValue({ rows: [] });

      const result = await getPacienteDetail(50);

      expect(result).toBeNull();
      expect(mockObtenerMembresiaPorPacienteId).not.toHaveBeenCalled();
    });

    test("debe obtener detalle y mapearlo con estatus de membresía", async () => {
      const row = {
        PACIENTE_ID: 1,
        NOMBRE: "Ana",
        APELLIDO: "López",
      };

      mockExecute.mockResolvedValue({ rows: [row] });
      mockObtenerMembresiaPorPacienteId.mockResolvedValue({
        ESTATUS: "activo",
      });
      mockMapPacienteToCard.mockReturnValue({
        id: 1,
        name: "Ana López",
        status: "Activo",
      });

      const result = await getPacienteDetail(1);

      expect(mockObtenerMembresiaPorPacienteId).toHaveBeenCalledWith(1);
      expect(mockMapPacienteToCard).toHaveBeenCalledWith({
        ...row,
        ESTATUS_MEMBRESIA: "activo",
      });
      expect(result).toEqual({
        id: 1,
        name: "Ana López",
        status: "Activo",
      });
    });
  });

  describe("getPacienteDetalle", () => {
    test("debe regresar null si no encuentra paciente", async () => {
      mockExecute.mockResolvedValue({ rows: [] });

      const result = await getPacienteDetalle(1);

      expect(result).toBeNull();
    });

    test("debe regresar detalle del paciente con membresía", async () => {
      const fechaAlta = new Date("2026-05-20T00:00:00.000Z");
      const fechaInicio = new Date("2026-01-01T00:00:00.000Z");
      const fechaFin = new Date("2026-12-31T00:00:00.000Z");

      mockExecute.mockResolvedValue({
        rows: [
          {
            PACIENTE_ID: 3,
            NOMBRE: "María",
            APELLIDO: "Ruiz",
            EMAIL: "maria@test.com",
            TELEFONO_CELULAR: "8181818181",
            ESTADO_RESIDENCIA: "Nuevo León",
            FECHA_ALTA: fechaAlta,
            VIVE: "SI",
          },
        ],
      });

      mockObtenerMembresiaPorPacienteId.mockResolvedValue({
        FECHA_INICIO: fechaInicio,
        FECHA_FIN: fechaFin,
      });

      const result = await getPacienteDetalle(3);

      expect(result).toEqual({
        PACIENTE_ID: 3,
        NOMBRE: "María",
        APELLIDO: "Ruiz",
        NOMBRE_COMPLETO: "María Ruiz",
        EMAIL: "maria@test.com",
        TELEFONO_CELULAR: "8181818181",
        ESTADO_RESIDENCIA: "Nuevo León",
        FECHA_ALTA: fechaAlta.toISOString(),
        VIVE: "SI",
        FECHA_INICIO: fechaInicio.toISOString(),
        FECHA_FIN: fechaFin.toISOString(),
        foto: "/api/pacientes/3/foto",
      });
    });
  });

  describe("guardarFoto", () => {
    test("debe actualizar la fotografía del paciente", async () => {
      const buffer = Buffer.from("imagen");

      await guardarFoto(5, buffer);

      expect(mockExecute).toHaveBeenCalledWith(
        "UPDATE PACIENTE SET FOTOGRAFIA = :foto WHERE PACIENTE_ID = :id",
        { foto: buffer, id: 5 },
        { autoCommit: true }
      );
      expect(mockClose).toHaveBeenCalled();
    });
  });

  describe("obtenerFoto", () => {
    test("debe regresar null si no encuentra paciente", async () => {
      mockExecute.mockResolvedValue({ rows: [] });

      const result = await obtenerFoto(1);

      expect(result).toBeNull();
    });

    test("debe regresar null si no tiene fotografía", async () => {
      mockExecute.mockResolvedValue({
        rows: [{ FOTOGRAFIA: null }],
      });

      const result = await obtenerFoto(1);

      expect(result).toBeNull();
    });

    test("debe leer un LOB y devolver Buffer", async () => {
      const lob = new Readable({
        read() {
          this.push(Buffer.from("foto"));
          this.push(null);
        },
      });

      mockExecute.mockResolvedValue({
        rows: [{ FOTOGRAFIA: lob }],
      });

      const result = await obtenerFoto(1);

      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.toString()).toBe("foto");
    });
  });

  describe("updatePaciente", () => {
    test("debe actualizar paciente con valvula SI", async () => {
      const datos = {
        nombre: "Carlos",
        apellido: "Santos",
        curp: "CURP123",
        genero: "M",
        fechaNacimiento: "2010-01-01",
        direccion: "Calle 1",
        ciudad: "Monterrey",
        estado: "Nuevo León",
        codigoPostal: "64000",
        telefonoCasa: "123",
        telefonoCelular: "456",
        correo: "carlos@test.com",
        emergenciaContacto: "Mamá",
        emergenciaTelefono: "789",
        lugarNacimiento: "Monterrey",
        hospitalNacimiento: "Hospital A",
        tipoSangre: "O+",
        usaValvula: "Sí",
        notas: "Sin notas",
      };

      await updatePaciente(10, datos);

      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE PACIENTE SET"),
        expect.objectContaining({
          nombre: "Carlos",
          apellido: "Santos",
          valvula: "SI",
          pacienteId: 10,
        }),
        { autoCommit: true }
      );
    });

    test("debe actualizar paciente con valvula NO", async () => {
      await updatePaciente(10, {
        nombre: "Ana",
        usaValvula: "No",
      });

      expect(mockExecute).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          nombre: "Ana",
          valvula: "NO",
          pacienteId: 10,
        }),
        { autoCommit: true }
      );
    });
  });

  describe("getPacienteCompleto", () => {
    test("debe regresar null si no encuentra paciente", async () => {
      mockExecute.mockResolvedValue({ rows: [] });

      const result = await getPacienteCompleto(99);

      expect(result).toBeNull();
    });

    test("debe regresar paciente completo", async () => {
      mockExecute.mockResolvedValue({
        rows: [
          {
            PACIENTE_ID: 2,
            NOMBRE: "Ana",
            APELLIDO: "López",
            CURP: "CURP",
            GENERO: "F",
            FECHA_NACIMIENTO: "2010-01-01",
            DIRECCION: "Calle 1",
            CIUDAD_RESIDENCIA: "Monterrey",
            ESTADO_RESIDENCIA: "Nuevo León",
            CODIGO_POSTAL: "64000",
            TELEFONO_CASA: "111",
            TELEFONO_CELULAR: "222",
            EMAIL: "ana@test.com",
            EMERGENCIA_CONTACTO: "Mamá",
            EMERGENCIA_TELEFONO: "333",
            LUGAR_NACIMIENTO: "Monterrey",
            HOSPITAL_NACIMIENTO: "Hospital A",
            SANGRE_TIPO: "A+",
            VALVULA: "NO",
            NOTAS_ADICIONALES: "Ninguna",
          },
        ],
      });

      const result = await getPacienteCompleto(2);

      expect(result).toEqual({
        PACIENTE_ID: 2,
        NOMBRE: "Ana",
        APELLIDO: "López",
        CURP: "CURP",
        GENERO: "F",
        FECHA_NACIMIENTO: "2010-01-01",
        DIRECCION: "Calle 1",
        CIUDAD_RESIDENCIA: "Monterrey",
        ESTADO_RESIDENCIA: "Nuevo León",
        CODIGO_POSTAL: "64000",
        TELEFONO_CASA: "111",
        TELEFONO_CELULAR: "222",
        EMAIL: "ana@test.com",
        EMERGENCIA_CONTACTO: "Mamá",
        EMERGENCIA_TELEFONO: "333",
        LUGAR_NACIMIENTO: "Monterrey",
        HOSPITAL_NACIMIENTO: "Hospital A",
        SANGRE_TIPO: "A+",
        VALVULA: "NO",
        NOTAS_ADICIONALES: "Ninguna",
        FOTO: "/api/pacientes/2/foto",
      });
    });
  });

  describe("updateHistorialMadre", () => {
    test("debe actualizar historial madre si ya existe", async () => {
      mockExecute
        .mockResolvedValueOnce({
          rows: [{ TOTAL: 1 }],
        })
        .mockResolvedValueOnce({ rowsAffected: 1 });

      await updateHistorialMadre(4, {
        tutorLugarNacimiento: "Monterrey",
        tutorEdad: "35",
        tutorOcupacion: "Maestra",
        tutorEscolaridad: "Licenciatura",
        tutorParentesco: "Sí",
        madreSeguroMedico: "IMSS",
        cdEmbarazo: "No",
        acidoFolico: "Sí",
        citasControl: "5",
      });

      expect(mockExecute).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("UPDATE HISTORIAL_MADRE SET"),
        expect.objectContaining({
          lugarNacimiento: "Monterrey",
          edad: 35,
          parentesco: "S",
          acidoFolico: "S",
          citasControl: 5,
          pacienteId: 4,
        }),
        { autoCommit: true }
      );
    });

    test("debe insertar historial madre si no existe", async () => {
      mockExecute
        .mockResolvedValueOnce({
          rows: [{ TOTAL: 0 }],
        })
        .mockResolvedValueOnce({ rowsAffected: 1 });

      await updateHistorialMadre(4, {
        tutorParentesco: "No",
        acidoFolico: "No",
      });

      expect(mockExecute).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("INSERT INTO HISTORIAL_MADRE"),
        expect.objectContaining({
          pacienteId: 4,
          lugarNacimiento: "N/A",
          escolaridad: "N/A",
          ocupacion: "N/A",
          edad: 0,
          parentesco: "N",
          seguroMedico: "N/A",
          cdEmbarazo: "N/A",
          acidoFolico: "N",
          citasControl: 0,
        }),
        { autoCommit: true }
      );
    });
  });
});