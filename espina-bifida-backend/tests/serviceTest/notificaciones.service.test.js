import { jest, describe, beforeEach, afterEach, test, expect } from "@jest/globals";
import { Readable } from "node:stream";

const mockExecute = jest.fn();
const mockClose = jest.fn();
const mockGetConnection = jest.fn();
const mockMapNotificacionToCard = jest.fn();

jest.unstable_mockModule("../../config/db.js", () => ({
  getConnection: mockGetConnection,
}));

jest.unstable_mockModule("oracledb", () => ({
  default: {
    OUT_FORMAT_OBJECT: "OUT_FORMAT_OBJECT",
  },
  OUT_FORMAT_OBJECT: "OUT_FORMAT_OBJECT",
}));

jest.unstable_mockModule("../../modulos/notificaciones/notificaciones.mapper.js", () => ({
  mapNotificacionToCard: mockMapNotificacionToCard,
}));

const {
  getNotificaciones,
  getNotificacionById,
  aprobarNotificacion,
  rechazarNotificacion,
  eliminarNotificacionesAntiguas,
} = await import("../../modulos/notificaciones/notificaciones.service.js");

function crearMockConnection() {
  return {
    execute: mockExecute,
    close: mockClose,
  };
}

describe("notificaciones.service.js", () => {
  let consoleErrorSpy;
  let consoleLogSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetConnection.mockResolvedValue(crearMockConnection());

    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  describe("getNotificaciones", () => {
    test("debe obtener notificaciones y mapearlas", async () => {
      const rows = [
        { NOTIFICACION_ID: 1, NOMBRE: "Juan" },
        { NOTIFICACION_ID: 2, NOMBRE: "Ana" },
      ];

      mockExecute.mockResolvedValue({ rows });

      mockMapNotificacionToCard
        .mockReturnValueOnce({ id: 1, paciente: { nombre: "Juan" } })
        .mockReturnValueOnce({ id: 2, paciente: { nombre: "Ana" } });

      const result = await getNotificaciones("pendiente");

      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining("SELECT"),
        { estado: "pendiente" },
        { outFormat: "OUT_FORMAT_OBJECT" }
      );

      expect(mockMapNotificacionToCard).toHaveBeenCalledTimes(2);
      expect(result).toEqual([
        { id: 1, paciente: { nombre: "Juan" } },
        { id: 2, paciente: { nombre: "Ana" } },
      ]);
      expect(mockClose).toHaveBeenCalled();
    });

    test("debe mandar estado null si viene vacío", async () => {
      mockExecute.mockResolvedValue({ rows: [] });

      await getNotificaciones("   ");

      expect(mockExecute).toHaveBeenCalledWith(
        expect.any(String),
        { estado: null },
        { outFormat: "OUT_FORMAT_OBJECT" }
      );
    });

    test("debe cerrar conexión y lanzar error si falla", async () => {
      mockExecute.mockRejectedValue(new Error("DB error"));

      await expect(getNotificaciones()).rejects.toThrow("DB error");

      expect(mockClose).toHaveBeenCalled();
    });
  });

  describe("getNotificacionById", () => {
    test("debe regresar null si no encuentra notificación", async () => {
      mockExecute.mockResolvedValue({ rows: [] });

      const result = await getNotificacionById(99);

      expect(result).toBeNull();
      expect(mockClose).toHaveBeenCalled();
    });

    test("debe obtener notificación sin fotografía", async () => {
      mockExecute.mockResolvedValue({
        rows: [
          {
            NOTIFICACION_ID: 1,
            ESTADO_PROCESO: "pendiente",
            FECHA_CREACION: "29/05/2026 14:00",
            PACIENTE_ID: 10,
            NOMBRE: "Juan",
            APELLIDO: "Pérez",
            CURP: "CURP123",
            GENERO: "M",
            FECHA_NACIMIENTO: "2010-01-01",
            DIRECCION: "Calle 1",
            CIUDAD_RESIDENCIA: "Monterrey",
            ESTADO_RESIDENCIA: "Nuevo León",
            CODIGO_POSTAL: "64000",
            TELEFONO_CASA: "111",
            TELEFONO_CELULAR: "222",
            EMAIL: "juan@test.com",
            EMERGENCIA_CONTACTO: "Mamá",
            EMERGENCIA_TELEFONO: "333",
            LUGAR_NACIMIENTO: "Monterrey",
            HOSPITAL_NACIMIENTO: "Hospital A",
            SANGRE_TIPO: "O+",
            VALVULA: "SI",
            ETAPA_VIDA: "Niño",
            NOTAS_ADICIONALES: "Ninguna",
            FOTOGRAFIA: null,
            TUTOR_LUGAR_NACIMIENTO: "Monterrey",
            TUTOR_EDAD: 35,
            TUTOR_OCUPACION: "Maestra",
            TUTOR_ESCOLARIDAD: "Licenciatura",
            TUTOR_PARENTESCO: "S",
            MADRE_SEGURO_MEDICO: "IMSS",
            CD_EMBARAZO: "No",
            ACIDO_FOLICO: "S",
            CITAS_CONTROL: 5,
          },
        ],
      });

      const result = await getNotificacionById("1");

      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining("WHERE n.notificacion_id = :notificacionId"),
        { notificacionId: 1 },
        { outFormat: "OUT_FORMAT_OBJECT" }
      );

      expect(result).toEqual({
        NOTIFICACION_ID: 1,
        ESTADO_PROCESO: "pendiente",
        FECHA_CREACION: "29/05/2026 14:00",
        PACIENTE_ID: 10,
        NOMBRE: "Juan",
        APELLIDO: "Pérez",
        CURP: "CURP123",
        GENERO: "M",
        FECHA_NACIMIENTO: "2010-01-01",
        DIRECCION: "Calle 1",
        CIUDAD_RESIDENCIA: "Monterrey",
        ESTADO_RESIDENCIA: "Nuevo León",
        CODIGO_POSTAL: "64000",
        TELEFONO_CASA: "111",
        TELEFONO_CELULAR: "222",
        EMAIL: "juan@test.com",
        EMERGENCIA_CONTACTO: "Mamá",
        EMERGENCIA_TELEFONO: "333",
        LUGAR_NACIMIENTO: "Monterrey",
        HOSPITAL_NACIMIENTO: "Hospital A",
        SANGRE_TIPO: "O+",
        VALVULA: "SI",
        ETAPA_VIDA: "Niño",
        NOTAS_ADICIONALES: "Ninguna",
        FOTO: null,
        TUTOR_LUGAR_NACIMIENTO: "Monterrey",
        TUTOR_EDAD: 35,
        TUTOR_OCUPACION: "Maestra",
        TUTOR_ESCOLARIDAD: "Licenciatura",
        TUTOR_PARENTESCO: "S",
        MADRE_SEGURO_MEDICO: "IMSS",
        CD_EMBARAZO: "No",
        ACIDO_FOLICO: "S",
        CITAS_CONTROL: 5,
      });

      expect(mockClose).toHaveBeenCalled();
    });

    test("debe convertir fotografía BLOB a base64", async () => {
      const lob = new Readable({
        read() {
          this.push(Buffer.from("foto-test"));
          this.push(null);
        },
      });

      mockExecute.mockResolvedValue({
        rows: [
          {
            NOTIFICACION_ID: 1,
            ESTADO_PROCESO: "pendiente",
            FECHA_CREACION: "29/05/2026",
            PACIENTE_ID: 10,
            NOMBRE: "Juan",
            APELLIDO: "Pérez",
            FOTOGRAFIA: lob,
          },
        ],
      });

      const result = await getNotificacionById("1");

      expect(result.FOTO).toBe(
        `data:image/jpeg;base64,${Buffer.from("foto-test").toString("base64")}`
      );
    });

    test("debe cerrar conexión y lanzar error si falla", async () => {
      mockExecute.mockRejectedValue(new Error("DB error"));

      await expect(getNotificacionById(1)).rejects.toThrow("DB error");

      expect(mockClose).toHaveBeenCalled();
    });
  });

  describe("aprobarNotificacion", () => {
    test("debe aprobar notificación y regresar true si rowsAffected es mayor a 0", async () => {
      mockExecute.mockResolvedValue({ rowsAffected: 1 });

      const result = await aprobarNotificacion("1", "7");

      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE NOTIFICACION SET estado_proceso = 'aprobado'"),
        { notificacionId: 1 },
        { autoCommit: true }
      );

      expect(result).toBe(true);
      expect(mockClose).toHaveBeenCalled();
    });

    test("debe regresar false si no actualizó filas", async () => {
      mockExecute.mockResolvedValue({ rowsAffected: 0 });

      const result = await aprobarNotificacion("1", "7");

      expect(result).toBe(false);
    });

    test("debe lanzar error si falla", async () => {
      mockExecute.mockRejectedValue(new Error("DB error"));

      await expect(aprobarNotificacion("1", "7")).rejects.toThrow("DB error");

      expect(mockClose).toHaveBeenCalled();
    });
  });

  describe("rechazarNotificacion", () => {
    test("debe rechazar notificación y regresar true si rowsAffected es mayor a 0", async () => {
      mockExecute.mockResolvedValue({ rowsAffected: 1 });

      const result = await rechazarNotificacion("2", "9");

      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE NOTIFICACION SET estado_proceso = 'rechazado'"),
        { notificacionId: 2 },
        { autoCommit: true }
      );

      expect(result).toBe(true);
      expect(mockClose).toHaveBeenCalled();
    });

    test("debe regresar false si no actualizó filas", async () => {
      mockExecute.mockResolvedValue({ rowsAffected: 0 });

      const result = await rechazarNotificacion("2", "9");

      expect(result).toBe(false);
    });

    test("debe lanzar error si falla", async () => {
      mockExecute.mockRejectedValue(new Error("DB error"));

      await expect(rechazarNotificacion("2", "9")).rejects.toThrow("DB error");

      expect(mockClose).toHaveBeenCalled();
    });
  });

  describe("eliminarNotificacionesAntiguas", () => {
    test("debe regresar 0 si no hay notificaciones antiguas", async () => {
      mockExecute.mockResolvedValueOnce({
        rows: [],
      });

      const result = await eliminarNotificacionesAntiguas();

      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining("SELECT DISTINCT paciente_id"),
        {},
        { outFormat: "OUT_FORMAT_OBJECT" }
      );

      expect(result).toBe(0);
      expect(consoleLogSpy).toHaveBeenCalledWith("No hay notificaciones antiguas que eliminar");
      expect(mockClose).toHaveBeenCalled();
    });

    test("debe eliminar notificaciones antiguas y datos relacionados", async () => {
      mockExecute
        .mockResolvedValueOnce({
          rows: [{ PACIENTE_ID: 10 }, { PACIENTE_ID: 20 }],
        })
        .mockResolvedValue({ rowsAffected: 1 });

      const result = await eliminarNotificacionesAntiguas();

      const bindsEsperados = {
        id0: 10,
        id1: 20,
      };

      expect(mockExecute).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining("SELECT DISTINCT paciente_id"),
        {},
        { outFormat: "OUT_FORMAT_OBJECT" }
      );

      expect(mockExecute).toHaveBeenNthCalledWith(
        2,
        "DELETE FROM NOTIFICACION WHERE paciente_id IN (:id0,:id1)",
        bindsEsperados,
        { autoCommit: true }
      );

      expect(mockExecute).toHaveBeenNthCalledWith(
        3,
        "DELETE FROM PACIENTE_PADECIMIENTO WHERE paciente_id IN (:id0,:id1)",
        bindsEsperados,
        { autoCommit: true }
      );

      expect(mockExecute).toHaveBeenNthCalledWith(
        4,
        "DELETE FROM HISTORIAL_MADRE WHERE paciente_id IN (:id0,:id1)",
        bindsEsperados,
        { autoCommit: true }
      );

      expect(mockExecute).toHaveBeenNthCalledWith(
        5,
        "DELETE FROM HISTORIAL_PADRE WHERE paciente_id IN (:id0,:id1)",
        bindsEsperados,
        { autoCommit: true }
      );

      expect(mockExecute).toHaveBeenNthCalledWith(
        6,
        "DELETE FROM EVENTO_VISITA WHERE paciente_id IN (:id0,:id1)",
        bindsEsperados,
        { autoCommit: true }
      );

      expect(mockExecute).toHaveBeenNthCalledWith(
        7,
        "DELETE FROM MEMBRESIA WHERE paciente_id IN (:id0,:id1)",
        bindsEsperados,
        { autoCommit: true }
      );

      expect(mockExecute).toHaveBeenNthCalledWith(
        8,
        "DELETE FROM PACIENTE WHERE paciente_id IN (:id0,:id1)",
        bindsEsperados,
        { autoCommit: true }
      );

      expect(result).toBe(2);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "[Limpieza] Eliminados 2 pacientes y sus notificaciones antiguas"
      );
      expect(mockClose).toHaveBeenCalled();
    });

    test("debe cerrar conexión y lanzar error si falla", async () => {
      mockExecute.mockRejectedValue(new Error("DB error"));

      await expect(eliminarNotificacionesAntiguas()).rejects.toThrow("DB error");

      expect(mockClose).toHaveBeenCalled();
    });
  });
});