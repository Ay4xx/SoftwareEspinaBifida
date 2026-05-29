import { jest, describe, beforeEach, afterEach, test, expect } from "@jest/globals";

const mockExecute = jest.fn();
const mockClose = jest.fn();
const mockGetConnection = jest.fn();

jest.unstable_mockModule("../../config/db.js", () => ({
  getConnection: mockGetConnection,
}));

jest.unstable_mockModule("oracledb", () => ({
  default: {
    OUT_FORMAT_OBJECT: "OUT_FORMAT_OBJECT",
    BIND_OUT: "BIND_OUT",
    NUMBER: "NUMBER",
  },
  OUT_FORMAT_OBJECT: "OUT_FORMAT_OBJECT",
  BIND_OUT: "BIND_OUT",
  NUMBER: "NUMBER",
}));

const {
  getCitasByFecha,
  crearCita,
  actualizarEstatusCita,
  eliminarCita,
  getCitaById,
} = await import("../../modulos/agendacitas/agendacitas.service.js");

function crearMockConnection() {
  return {
    execute: mockExecute,
    close: mockClose,
  };
}

describe("agendacitas.service.js", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetConnection.mockResolvedValue(crearMockConnection());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("getCitasByFecha", () => {
    test("debe obtener citas por fecha y mapearlas correctamente", async () => {
      const rows = [
        {
          ID_CITA: 1,
          ID_PACIENTE: 10,
          NOMBRE: "Juan",
          APELLIDO: "Pérez",
          TELEFONO_CELULAR: "8111111111",
          FECHA_CITA: "2026-05-29",
          HORA_CITA: "10:00",
          ESTATUS_CITA: "PENDIENTE",
          MOTIVO: "Consulta",
          NOTAS: "Primera cita",
        },
      ];

      mockExecute.mockResolvedValue({
        rows,
      });

      const result = await getCitasByFecha("2026-05-29");

      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining("WHERE TO_CHAR"),
        {
          fecha: "2026-05-29",
        },
        {
          outFormat: "OUT_FORMAT_OBJECT",
        }
      );

      expect(result).toEqual([
        {
          id_cita: 1,
          id_paciente: 10,
          nombre: "Juan",
          apellido: "Pérez",
          telefono: "8111111111",
          fecha_cita: "2026-05-29",
          hora_cita: "10:00",
          estatus_cita: "PENDIENTE",
          motivo: "Consulta",
          notas: "Primera cita",
        },
      ]);

      expect(mockClose).toHaveBeenCalled();
    });

    test("debe regresar arreglo vacío si no hay citas", async () => {
      mockExecute.mockResolvedValue({
        rows: [],
      });

      const result = await getCitasByFecha("2026-05-29");

      expect(result).toEqual([]);
      expect(mockClose).toHaveBeenCalled();
    });

    test("debe cerrar conexión y lanzar error si falla Oracle", async () => {
      mockExecute.mockRejectedValue(new Error("Error Oracle"));

      await expect(getCitasByFecha("2026-05-29")).rejects.toThrow("Error Oracle");

      expect(mockClose).toHaveBeenCalled();
    });
  });

  describe("crearCita", () => {
    test("debe crear cita correctamente con datos completos", async () => {
      mockExecute.mockResolvedValue({
        outBinds: {
          idCita: [15],
        },
      });

      const citaData = {
        id_paciente: "10",
        fecha_cita: "2026-05-29",
        hora_cita: "10:00",
        motivo: "Consulta general",
        notas: "Llegar temprano",
        estatus_cita: "CONFIRMADA",
      };

      const result = await crearCita(citaData);

      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO AGENDA_CITAS"),
        {
          idPaciente: 10,
          fechaCita: "2026-05-29",
          horaCita: "10:00",
          motivo: "Consulta general",
          notas: "Llegar temprano",
          estatusCita: "CONFIRMADA",
          idCita: {
            dir: "BIND_OUT",
            type: "NUMBER",
          },
        },
        {
          autoCommit: true,
        }
      );

      expect(result).toEqual({
        ok: true,
        id_cita: 15,
      });

      expect(mockClose).toHaveBeenCalled();
    });

    test("debe crear cita con valores opcionales por defecto", async () => {
      mockExecute.mockResolvedValue({
        outBinds: {
          idCita: [20],
        },
      });

      const citaData = {
        id_paciente: "11",
        fecha_cita: "2026-06-01",
        hora_cita: "12:30",
      };

      const result = await crearCita(citaData);

      expect(mockExecute).toHaveBeenCalledWith(
        expect.any(String),
        {
          idPaciente: 11,
          fechaCita: "2026-06-01",
          horaCita: "12:30",
          motivo: null,
          notas: null,
          estatusCita: "PENDIENTE",
          idCita: {
            dir: "BIND_OUT",
            type: "NUMBER",
          },
        },
        {
          autoCommit: true,
        }
      );

      expect(result).toEqual({
        ok: true,
        id_cita: 20,
      });

      expect(mockClose).toHaveBeenCalled();
    });

    test("debe cerrar conexión y lanzar error si falla crearCita", async () => {
      mockExecute.mockRejectedValue(new Error("Error Oracle"));

      await expect(
        crearCita({
          id_paciente: "10",
          fecha_cita: "2026-05-29",
          hora_cita: "10:00",
        })
      ).rejects.toThrow("Error Oracle");

      expect(mockClose).toHaveBeenCalled();
    });
  });

  describe("actualizarEstatusCita", () => {
    test("debe actualizar estatus de cita correctamente", async () => {
      mockExecute.mockResolvedValue({
        rowsAffected: 1,
      });

      const result = await actualizarEstatusCita("5", "CONFIRMADA");

      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE AGENDA_CITAS"),
        {
          idCita: 5,
          nuevoEstatus: "CONFIRMADA",
        },
        {
          autoCommit: true,
        }
      );

      expect(result).toEqual({
        ok: true,
      });

      expect(mockClose).toHaveBeenCalled();
    });

    test("debe cerrar conexión y lanzar error si falla actualizarEstatusCita", async () => {
      mockExecute.mockRejectedValue(new Error("Error Oracle"));

      await expect(actualizarEstatusCita("5", "CANCELADA")).rejects.toThrow(
        "Error Oracle"
      );

      expect(mockClose).toHaveBeenCalled();
    });
  });

  describe("eliminarCita", () => {
    test("debe eliminar cita correctamente", async () => {
      mockExecute.mockResolvedValue({
        rowsAffected: 1,
      });

      const result = await eliminarCita("7");

      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining("DELETE FROM AGENDA_CITAS"),
        {
          idCita: 7,
        },
        {
          autoCommit: true,
        }
      );

      expect(result).toEqual({
        ok: true,
      });

      expect(mockClose).toHaveBeenCalled();
    });

    test("debe cerrar conexión y lanzar error si falla eliminarCita", async () => {
      mockExecute.mockRejectedValue(new Error("Error Oracle"));

      await expect(eliminarCita("7")).rejects.toThrow("Error Oracle");

      expect(mockClose).toHaveBeenCalled();
    });
  });

  describe("getCitaById", () => {
    test("debe obtener cita por id", async () => {
      const cita = {
        ID_CITA: 1,
        ID_PACIENTE: 10,
        NOMBRE: "Juan",
        TELEFONO_CELULAR: "8111111111",
        FECHA_CITA: "2026-05-29",
        HORA_CITA: "10:00",
        ESTATUS_CITA: "PENDIENTE",
        MOTIVO: "Consulta",
        NOTAS: "Notas",
      };

      mockExecute.mockResolvedValue({
        rows: [cita],
      });

      const result = await getCitaById("1");

      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining("WHERE c.ID_CITA = :idCita"),
        {
          idCita: 1,
        },
        {
          outFormat: "OUT_FORMAT_OBJECT",
        }
      );

      expect(result).toEqual(cita);
      expect(mockClose).toHaveBeenCalled();
    });

    test("debe regresar undefined si no encuentra cita", async () => {
      mockExecute.mockResolvedValue({
        rows: [],
      });

      const result = await getCitaById("99");

      expect(result).toBeUndefined();
      expect(mockClose).toHaveBeenCalled();
    });

    test("debe cerrar conexión y lanzar error si falla getCitaById", async () => {
      mockExecute.mockRejectedValue(new Error("Error Oracle"));

      await expect(getCitaById("1")).rejects.toThrow("Error Oracle");

      expect(mockClose).toHaveBeenCalled();
    });
  });
});