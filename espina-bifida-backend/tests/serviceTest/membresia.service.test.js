import { jest, describe, beforeEach, afterEach, test, expect } from "@jest/globals";

const mockExecute = jest.fn();
const mockClose = jest.fn();
const mockGetConnection = jest.fn();

jest.unstable_mockModule("oracledb", () => ({
  default: {
    OUT_FORMAT_OBJECT: "OUT_FORMAT_OBJECT",
  },
  OUT_FORMAT_OBJECT: "OUT_FORMAT_OBJECT",
}));

jest.unstable_mockModule("../../config/db.js", () => ({
  getConnection: mockGetConnection,
}));

const {
  activarMembresia,
  obtenerMembresiaPorPacienteId,
  desactivarMembresia,
} = await import("../../modulos/membresia/membresia.service.js");

function crearMockConnection() {
  return {
    execute: mockExecute,
    close: mockClose,
  };
}

describe("membresia.service.js", () => {
  let consoleSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetConnection.mockResolvedValue(crearMockConnection());
    consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe("activarMembresia", () => {
    test("debe actualizar membresía si ya existe", async () => {
      mockExecute
        .mockResolvedValueOnce({
          rows: [{ MEMBRESIA_ID: 1 }],
        })
        .mockResolvedValueOnce({
          rowsAffected: 1,
        });

      const result = await activarMembresia("10", "2026-05-29");

      expect(mockGetConnection).toHaveBeenCalled();

      expect(mockExecute).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining("SELECT membresia_id"),
        { pacienteId: "10" },
        { outFormat: "OUT_FORMAT_OBJECT" }
      );

      expect(mockExecute).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("UPDATE MEMBRESIA"),
        {
          pacienteId: "10",
          fechaInicio: "2026-05-29",
        },
        { autoCommit: true }
      );

      expect(result).toEqual({
        ok: true,
        message: "Membresía activada correctamente",
      });

      expect(mockClose).toHaveBeenCalled();
    });

    test("debe insertar membresía si no existe", async () => {
      mockExecute
        .mockResolvedValueOnce({
          rows: [],
        })
        .mockResolvedValueOnce({
          rowsAffected: 1,
        });

      const result = await activarMembresia("20", "2026-05-29");

      expect(mockExecute).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining("SELECT membresia_id"),
        { pacienteId: "20" },
        { outFormat: "OUT_FORMAT_OBJECT" }
      );

      expect(mockExecute).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("INSERT INTO MEMBRESIA"),
        {
          pacienteId: "20",
          fechaInicio: "2026-05-29",
        },
        { autoCommit: true }
      );

      expect(result).toEqual({
        ok: true,
        message: "Membresía activada correctamente",
      });

      expect(mockClose).toHaveBeenCalled();
    });

    test("debe cerrar conexión y lanzar error si falla", async () => {
      mockExecute.mockRejectedValue(new Error("Error Oracle"));

      await expect(
        activarMembresia("10", "2026-05-29")
      ).rejects.toThrow("Error Oracle");

      expect(mockClose).toHaveBeenCalled();
    });
  });

  describe("obtenerMembresiaPorPacienteId", () => {
    test("debe obtener membresía por pacienteId", async () => {
      const membresia = {
        MEMBRESIA_ID: 1,
        PACIENTE_ID: 10,
        ESTATUS: "activo",
        FECHA_INICIO: "2026-05-29",
        FECHA_FIN: "2027-05-29",
      };

      mockExecute.mockResolvedValue({
        rows: [membresia],
      });

      const result = await obtenerMembresiaPorPacienteId("10");

      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining("SELECT *"),
        { pacienteId: 10 },
        { outFormat: "OUT_FORMAT_OBJECT" }
      );

      expect(result).toEqual(membresia);
      expect(mockClose).toHaveBeenCalled();
    });

    test("debe regresar null si no encuentra membresía", async () => {
      mockExecute.mockResolvedValue({
        rows: [],
      });

      const result = await obtenerMembresiaPorPacienteId("99");

      expect(result).toBeNull();
      expect(mockClose).toHaveBeenCalled();
    });

    test("debe cerrar conexión y lanzar error si falla", async () => {
      mockExecute.mockRejectedValue(new Error("Fallo al consultar"));

      await expect(
        obtenerMembresiaPorPacienteId("10")
      ).rejects.toThrow("Fallo al consultar");

      expect(mockClose).toHaveBeenCalled();
    });
  });

  describe("desactivarMembresia", () => {
    test("debe desactivar membresía correctamente", async () => {
      mockExecute.mockResolvedValue({
        rowsAffected: 1,
      });

      const result = await desactivarMembresia("10");

      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE MEMBRESIA"),
        { pacienteId: "10" },
        { autoCommit: true }
      );

      expect(result).toEqual({
        ok: true,
        message: "Membresía desactivada correctamente",
      });

      expect(mockClose).toHaveBeenCalled();
    });

    test("debe cerrar conexión y lanzar error si falla", async () => {
      mockExecute.mockRejectedValue(new Error("No se pudo actualizar"));

      await expect(desactivarMembresia("10")).rejects.toThrow(
        "No se pudo actualizar"
      );

      expect(mockClose).toHaveBeenCalled();
    });
  });
});