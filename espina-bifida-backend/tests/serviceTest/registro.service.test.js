import { jest, describe, beforeEach, afterEach, test, expect } from "@jest/globals";

const mockExecute = jest.fn();
const mockClose = jest.fn();
const mockGetConnection = jest.fn();

jest.unstable_mockModule("../../config/db.js", () => ({
  getConnection: mockGetConnection,
}));

jest.unstable_mockModule("oracledb", () => ({
  default: {
    BIND_OUT: "BIND_OUT",
    NUMBER: "NUMBER",
  },
  BIND_OUT: "BIND_OUT",
  NUMBER: "NUMBER",
}));

const {
  crearPacientePaso1,
  actualizarPaso2,
  actualizarPaso3,
  actualizarPaso4,
  actualizarPaso5,
} = await import("../../modulos/registro/registro.service.js");

function crearMockConnection() {
  return {
    execute: mockExecute,
    close: mockClose,
  };
}

describe("registro.service.js", () => {
 let consoleErrorSpy;

beforeEach(() => {
  jest.clearAllMocks();

  mockGetConnection.mockResolvedValue(crearMockConnection());
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

  jest.useFakeTimers();
  jest.setSystemTime(new Date("2026-05-29T12:00:00.000Z"));
});

afterEach(() => {
  consoleErrorSpy.mockRestore();
  jest.useRealTimers();
});

  describe("crearPacientePaso1", () => {
    test("debe crear paciente paso 1 correctamente sin usuarioId", async () => {
      mockExecute
        .mockResolvedValueOnce({
          rows: [[0]],
        })
        .mockResolvedValueOnce({
          outBinds: {
            id: [10],
          },
        });

      const result = await crearPacientePaso1({
        nombre: "Juan",
        apellido: "Pérez",
        genero: "M",
        fechaNacimiento: "2010-01-01",
        curp: "JUAP100101HNLXXX01",
        usuarioId: null,
      });

      expect(mockExecute).toHaveBeenNthCalledWith(
        1,
        "SELECT COUNT(*) FROM PACIENTE WHERE CURP = :curp",
        { curp: "JUAP100101HNLXXX01" }
      );

      expect(mockExecute).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("INSERT INTO PACIENTE"),
        expect.objectContaining({
          nombre: "Juan",
          apellido: "Pérez",
          curp: "JUAP100101HNLXXX01",
          fechaNacimiento: "2010-01-01",
          genero: "M",
          edad: 16,
          etapaVida: "Adolescencia",
          id: {
            dir: "BIND_OUT",
            type: "NUMBER",
          },
        }),
        { autoCommit: true }
      );

      expect(result).toEqual({ pacienteId: 10 });
      expect(mockClose).toHaveBeenCalled();
    });

    test("debe crear paciente y borrar notificación pendiente si viene usuarioId", async () => {
      mockExecute
        .mockResolvedValueOnce({
          rows: [[0]],
        })
        .mockResolvedValueOnce({
          outBinds: {
            id: [20],
          },
        })
        .mockResolvedValueOnce({
          rowsAffected: 1,
        });

      const result = await crearPacientePaso1({
        nombre: "Ana",
        apellido: "López",
        genero: "F",
        fechaNacimiento: "2020-01-01",
        curp: "ANAL200101MNLXXX01",
        usuarioId: 1,
      });

      expect(mockExecute).toHaveBeenNthCalledWith(
        3,
        expect.stringContaining("DELETE FROM NOTIFICACION"),
        { pacienteId: 20 },
        { autoCommit: true }
      );

      expect(result).toEqual({ pacienteId: 20 });
      expect(mockClose).toHaveBeenCalled();
    });

    test("debe calcular etapa de vida Infancia", async () => {
      mockExecute
        .mockResolvedValueOnce({
          rows: [[0]],
        })
        .mockResolvedValueOnce({
          outBinds: {
            id: [30],
          },
        });

      await crearPacientePaso1({
        nombre: "Niño",
        apellido: "Prueba",
        genero: "M",
        fechaNacimiento: "2018-01-01",
        curp: "CURPINFANCIA",
      });

      expect(mockExecute).toHaveBeenNthCalledWith(
        2,
        expect.any(String),
        expect.objectContaining({
          edad: 8,
          etapaVida: "Infancia",
        }),
        { autoCommit: true }
      );
    });

    test("debe calcular etapa de vida Adulto", async () => {
      mockExecute
        .mockResolvedValueOnce({
          rows: [[0]],
        })
        .mockResolvedValueOnce({
          outBinds: {
            id: [40],
          },
        });

      await crearPacientePaso1({
        nombre: "Adulto",
        apellido: "Prueba",
        genero: "M",
        fechaNacimiento: "2000-01-01",
        curp: "CURPADULTO",
      });

      expect(mockExecute).toHaveBeenNthCalledWith(
        2,
        expect.any(String),
        expect.objectContaining({
          edad: 26,
          etapaVida: "Adulto",
        }),
        { autoCommit: true }
      );
    });

    test("debe lanzar CURP_DUPLICADO si ya existe CURP", async () => {
      mockExecute.mockResolvedValueOnce({
        rows: [[1]],
      });

      await expect(
        crearPacientePaso1({
          nombre: "Juan",
          apellido: "Pérez",
          genero: "M",
          fechaNacimiento: "2010-01-01",
          curp: "CURP_DUP",
        })
      ).rejects.toMatchObject({
        code: "CURP_DUPLICADO",
      });

      expect(mockExecute).toHaveBeenCalledTimes(1);
      expect(mockClose).toHaveBeenCalled();
    });

    test("debe cerrar conexión y lanzar error si falla Oracle", async () => {
      mockExecute.mockRejectedValue(new Error("Error Oracle"));

      await expect(
        crearPacientePaso1({
          nombre: "Juan",
          apellido: "Pérez",
          genero: "M",
          fechaNacimiento: "2010-01-01",
          curp: "CURP123",
        })
      ).rejects.toThrow("Error Oracle");

      expect(mockClose).toHaveBeenCalled();
    });
  });

  describe("actualizarPaso2", () => {
    test("debe actualizar datos de contacto correctamente", async () => {
      mockExecute.mockResolvedValue({ rowsAffected: 1 });

      await actualizarPaso2(10, {
        direccion: "Calle 1",
        ciudad: "Monterrey",
        estado: "Nuevo León",
        codigoPostal: "64000",
        emergenciaContacto: "Mamá",
        emergenciaTelefono: "8181818181",
        telefonoCasa: "",
        telefonoCelular: "8122222222",
        correo: "paciente@test.com",
      });

      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE PACIENTE SET"),
        {
          direccion: "Calle 1",
          ciudad: "Monterrey",
          estado: "Nuevo León",
          codigoPostal: "64000",
          emergenciaContacto: "Mamá",
          emergenciaTelefono: "8181818181",
          telefonoCasa: null,
          telefonoCelular: "8122222222",
          correo: "paciente@test.com",
          pacienteId: 10,
        },
        { autoCommit: true }
      );

      expect(mockClose).toHaveBeenCalled();
    });

    test("debe cerrar conexión y lanzar error si falla actualizarPaso2", async () => {
      mockExecute.mockRejectedValue(new Error("Error paso 2"));

      await expect(
        actualizarPaso2(10, {
          direccion: "Calle",
          ciudad: "Monterrey",
          estado: "NL",
          codigoPostal: "64000",
          emergenciaContacto: "Mamá",
          emergenciaTelefono: "8181818181",
        })
      ).rejects.toThrow("Error paso 2");

      expect(mockClose).toHaveBeenCalled();
    });
  });

  describe("actualizarPaso3", () => {
    test("debe actualizar historial médico con válvula SI", async () => {
      mockExecute.mockResolvedValue({ rowsAffected: 1 });

      await actualizarPaso3(10, {
        lugarNacimiento: "Monterrey",
        hospitalNacimiento: "Hospital A",
        tipoSangre: "O+",
        usaValvula: "Sí",
        notas: "",
      });

      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE PACIENTE SET"),
        {
          lugarNacimiento: "Monterrey",
          hospitalNacimiento: "Hospital A",
          tipoSangre: "O+",
          valvula: "SI",
          notas: null,
          pacienteId: 10,
        },
        { autoCommit: true }
      );

      expect(mockClose).toHaveBeenCalled();
    });

    test("debe actualizar historial médico con válvula NO", async () => {
      mockExecute.mockResolvedValue({ rowsAffected: 1 });

      await actualizarPaso3(10, {
        lugarNacimiento: "Monterrey",
        hospitalNacimiento: "Hospital A",
        tipoSangre: "O+",
        usaValvula: "No",
        notas: "Sin notas",
      });

      expect(mockExecute).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          valvula: "NO",
          notas: "Sin notas",
        }),
        { autoCommit: true }
      );
    });

    test("debe actualizar historial médico con válvula null", async () => {
      mockExecute.mockResolvedValue({ rowsAffected: 1 });

      await actualizarPaso3(10, {
        lugarNacimiento: "Monterrey",
        hospitalNacimiento: "Hospital A",
        tipoSangre: "O+",
        usaValvula: "",
        notas: "Texto",
      });

      expect(mockExecute).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          valvula: null,
        }),
        { autoCommit: true }
      );
    });

    test("debe cerrar conexión y lanzar error si falla actualizarPaso3", async () => {
      mockExecute.mockRejectedValue(new Error("Error paso 3"));

      await expect(
        actualizarPaso3(10, {
          lugarNacimiento: "Monterrey",
          hospitalNacimiento: "Hospital A",
          tipoSangre: "O+",
        })
      ).rejects.toThrow("Error paso 3");

      expect(mockClose).toHaveBeenCalled();
    });
  });

  describe("actualizarPaso4", () => {
    test("debe insertar historial de madre correctamente con valores completos", async () => {
      mockExecute.mockResolvedValue({ rowsAffected: 1 });

      await actualizarPaso4(10, {
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

      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO HISTORIAL_MADRE"),
        {
          pacienteId: 10,
          lugarNacimiento: "Monterrey",
          escolaridad: "Licenciatura",
          ocupacion: "Maestra",
          edad: 35,
          parentesco: "S",
          seguroMedico: "IMSS",
          cdEmbarazo: "No",
          acidoFolico: "S",
          citasControl: 5,
        },
        { autoCommit: true }
      );

      expect(mockClose).toHaveBeenCalled();
    });

    test("debe insertar historial de madre con valores por defecto", async () => {
      mockExecute.mockResolvedValue({ rowsAffected: 1 });

      await actualizarPaso4(10, {});

      expect(mockExecute).toHaveBeenCalledWith(
        expect.any(String),
        {
          pacienteId: 10,
          lugarNacimiento: "N/A",
          escolaridad: "N/A",
          ocupacion: "N/A",
          edad: 0,
          parentesco: "N",
          seguroMedico: "N/A",
          cdEmbarazo: "N/A",
          acidoFolico: "N",
          citasControl: 0,
        },
        { autoCommit: true }
      );
    });

    test("debe cerrar conexión y lanzar error si falla actualizarPaso4", async () => {
      mockExecute.mockRejectedValue(new Error("Error paso 4"));

      await expect(actualizarPaso4(10, {})).rejects.toThrow("Error paso 4");

      expect(mockClose).toHaveBeenCalled();
    });
  });

  describe("actualizarPaso5", () => {
    test("debe actualizar fotografía correctamente", async () => {
      const buffer = Buffer.from("foto");

      mockExecute.mockResolvedValue({ rowsAffected: 1 });

      await actualizarPaso5(10, buffer);

      expect(mockExecute).toHaveBeenCalledWith(
        "UPDATE PACIENTE SET FOTOGRAFIA = :foto WHERE PACIENTE_ID = :pacienteId",
        {
          foto: buffer,
          pacienteId: 10,
        },
        { autoCommit: true }
      );

      expect(mockClose).toHaveBeenCalled();
    });

    test("debe cerrar conexión y lanzar error si falla actualizarPaso5", async () => {
      mockExecute.mockRejectedValue(new Error("Error paso 5"));

      await expect(actualizarPaso5(10, Buffer.from("foto"))).rejects.toThrow(
        "Error paso 5"
      );

      expect(mockClose).toHaveBeenCalled();
    });
  });
});