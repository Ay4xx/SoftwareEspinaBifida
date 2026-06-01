import { jest, describe, beforeEach, afterEach, test, expect } from "@jest/globals";

const mockExecute = jest.fn();
const mockClose = jest.fn();
const mockGetConnection = jest.fn();

const mockOracledb = {
  OUT_FORMAT_OBJECT: "OUT_FORMAT_OBJECT",
  CLOB: "CLOB",
  fetchAsString: [],
};

jest.unstable_mockModule("../../config/db.js", () => ({
  getConnection: mockGetConnection,
}));

jest.unstable_mockModule("oracledb", () => ({
  default: mockOracledb,
  OUT_FORMAT_OBJECT: "OUT_FORMAT_OBJECT",
  CLOB: "CLOB",
  fetchAsString: [],
}));

const { obtenerHistorialFamiliar } = await import(
  "../../modulos/detallefamilia/familia.service.js"
);

function crearMockConnection() {
  return {
    execute: mockExecute,
    close: mockClose,
  };
}

describe("familia.service.js", () => {
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    mockOracledb.fetchAsString = [];

    mockGetConnection.mockResolvedValue(crearMockConnection());
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe("obtenerHistorialFamiliar", () => {
    test("debe obtener historial familiar correctamente", async () => {
  const rows = [
    {
      PADRE_ID: 1,
      PACIENTE_ID: 10,
      PADRE_LUGAR_NACIMIENTO: "Monterrey",
      PADRE_ESCOLARIDAD: "Licenciatura",
      PADRE_OCUPACION: "Ingeniero",
      PADRE_EDAD: 40,
      PADRE_SEGURO: "IMSS",
      PADRE_NOMBRE: "Padre Test",

      MADRE_ID: 2,
      MADRE_LUGAR_NACIMIENTO: "Guadalupe",
      MADRE_ESCOLARIDAD: "Preparatoria",
      MADRE_OCUPACION: "Maestra",
      MADRE_EDAD: 38,
      CD_EMBARAZO: "No",
      ACIDO_FOLICO: "S",
      CITAS_CONTROL: 5,
      MADRE_SEGURO: "IMSS",
      MADRE_NOMBRE: "Madre Test",

      ADICCIONES: "No",
      HIJO_DTN: "No",
      FAMILIAR_DTN: "No",
      EXPO_TOXICOS: "No",
      DESCRIPCION_EXPO_TOXICOS: null,
    },
  ];

  mockExecute.mockResolvedValue({
    rows,
  });

  const result = await obtenerHistorialFamiliar("10");

  expect(mockGetConnection).toHaveBeenCalled();

  expect(mockExecute).toHaveBeenCalledWith(
    expect.stringContaining("FROM ADMIN.HISTORIAL_PADRE p"),
    { pacienteId: 10 },
    { outFormat: "OUT_FORMAT_OBJECT" }
  );

  expect(result).toEqual(rows);
  expect(mockClose).toHaveBeenCalled();
});

    test("debe regresar arreglo vacío si no hay historial familiar", async () => {
      mockExecute.mockResolvedValue({
        rows: [],
      });

      const result = await obtenerHistorialFamiliar("99");

      expect(result).toEqual([]);
      expect(mockClose).toHaveBeenCalled();
    });

    test("debe configurar fetchAsString para CLOB", async () => {
      mockExecute.mockResolvedValue({
        rows: [],
      });

      await obtenerHistorialFamiliar("10");

      expect(mockOracledb.fetchAsString).toEqual(["CLOB"]);
    });

    test("debe cerrar conexión y lanzar error si falla la consulta", async () => {
  mockExecute.mockRejectedValue(new Error("Error Oracle"));

  await expect(obtenerHistorialFamiliar("10")).rejects.toThrow(
    "Error Oracle"
  );

  expect(consoleErrorSpy).toHaveBeenCalledWith(
    "Error SQL:",
    "Error Oracle",
    "| ORA-code:",
    undefined
  );

  expect(mockClose).toHaveBeenCalled();
});

    test("debe lanzar error si falla getConnection", async () => {
      mockGetConnection.mockRejectedValue(new Error("No hay conexión"));

      await expect(obtenerHistorialFamiliar("10")).rejects.toThrow(
        "No hay conexión"
      );

      expect(mockExecute).not.toHaveBeenCalled();
      expect(mockClose).not.toHaveBeenCalled();
    });
  });
});