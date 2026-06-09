import { jest, describe, beforeEach, test, expect } from "@jest/globals";
import { EventEmitter } from "node:events";

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
    STRING: "STRING",
  },
  OUT_FORMAT_OBJECT: "OUT_FORMAT_OBJECT",
  STRING: "STRING",
}));

jest.unstable_mockModule(
  "../../modulos/notificaciones/notificaciones.mapper.js",
  () => ({
    mapNotificacionToCard: mockMapNotificacionToCard,
  })
);

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

function crearBlobMock(texto = "foto-test") {
  const blob = new EventEmitter();

  process.nextTick(() => {
    blob.emit("data", Buffer.from(texto));
    blob.emit("end");
  });

  return blob;
}

describe("notificaciones.service.js", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetConnection.mockResolvedValue(crearMockConnection());
  });

  test("getNotificaciones obtiene notificaciones y las mapea", async () => {
    const rows = [
      {
        NOTIFICACION_ID: 1,
        PACIENTE_ID: 10,
        TITULO: "Nueva solicitud",
        ESTADO_PROCESO: "pendiente",
      },
      {
        NOTIFICACION_ID: 2,
        PACIENTE_ID: 11,
        TITULO: "Otra solicitud",
        ESTADO_PROCESO: "rechazado",
      },
    ];

    mockExecute.mockResolvedValue({ rows });

    mockMapNotificacionToCard
      .mockReturnValueOnce({ id: 1, titulo: "Nueva solicitud" })
      .mockReturnValueOnce({ id: 2, titulo: "Otra solicitud" });

    const result = await getNotificaciones();

    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("FROM NOTIFICACION"),
      { estado: null },
      { outFormat: "OUT_FORMAT_OBJECT" }
    );

    expect(mockMapNotificacionToCard).toHaveBeenCalledTimes(2);

    expect(result).toEqual([
      { id: 1, titulo: "Nueva solicitud" },
      { id: 2, titulo: "Otra solicitud" },
    ]);

    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("getNotificaciones limpia estado con trim", async () => {
    mockExecute.mockResolvedValue({ rows: [] });

    const result = await getNotificaciones(" pendiente ");

    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("LOWER(n.estado_proceso) = LOWER(:estado)"),
      { estado: "pendiente" },
      { outFormat: "OUT_FORMAT_OBJECT" }
    );

    expect(result).toEqual([]);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("getNotificaciones usa estado null si recibe string vacío", async () => {
    mockExecute.mockResolvedValue({ rows: [] });

    await getNotificaciones("   ");

    expect(mockExecute).toHaveBeenCalledWith(
      expect.any(String),
      { estado: null },
      { outFormat: "OUT_FORMAT_OBJECT" }
    );

    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("getNotificacionById retorna null si no existe", async () => {
    mockExecute.mockResolvedValueOnce({ rows: [] });

    const result = await getNotificacionById("999");

    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("WHERE n.notificacion_id = :notificacionId"),
      { notificacionId: 999 },
      { outFormat: "OUT_FORMAT_OBJECT" }
    );

    expect(result).toBeNull();
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("getNotificacionById retorna detalle con foto y tutores", async () => {
    const fotografia = crearBlobMock("foto-test");

    mockExecute
      .mockResolvedValueOnce({
        rows: [
          {
            NOTIFICACION_ID: 1,
            ESTADO_PROCESO: "pendiente",
            FECHA_CREACION: "09/06/2026 10:00",
            PACIENTE_ID: 10,
            NOMBRE: "Ana",
            APELLIDO: "López",
            CURP: "CURP123",
            GENERO: "F",
            FECHA_NACIMIENTO: "2010-01-01",
            DIRECCION: "Calle 123",
            CIUDAD_RESIDENCIA: "Monterrey",
            ESTADO_RESIDENCIA: "Nuevo León",
            CODIGO_POSTAL: "64000",
            TELEFONO_CASA: "8180000000",
            TELEFONO_CELULAR: "8111111111",
            EMAIL: "ana@test.com",
            EMERGENCIA_CONTACTO: "Mamá",
            EMERGENCIA_TELEFONO: "8122222222",
            LUGAR_NACIMIENTO: "Monterrey",
            HOSPITAL_NACIMIENTO: "Hospital A",
            SANGRE_TIPO: "O+",
            VALVULA: "No",
            ETAPA_VIDA: "Niñez",
            NOTAS_ADICIONALES: "Notas",
            TIPO_ESPINA_BIFIDA: "Mielomeningocele",
            OTROS_PADECIMIENTO: "Ninguno",
            FOTOGRAFIA: fotografia,
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            NOMBRE: "María López",
            LUGAR_NACIMIENTO: "Monterrey",
            ESCOLARIDAD: "Licenciatura",
            OCUPACION: "Contadora",
            EDAD: 35,
            SEGURO_MEDICO: "IMSS",
            CD_EMBARAZO: "Sí",
            ACIDO_FOLICO: "S",
            CITAS_CONTROL: 8,
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            NOMBRE: "Juan Pérez",
            LUGAR_NACIMIENTO: "Guadalupe",
            ESCOLARIDAD: "Preparatoria",
            OCUPACION: "Empleado",
            EDAD: 38,
            SEGURO_MEDICO: "ISSSTE",
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            ADICCIONES: "Ninguna",
            HIJO_DTN: "SI",
            FAMILIAR_DTN: "NO",
            EXPO_TOXICOS: "SI",
            DESCRIPCION_EXPO_TOXICOS: "Químicos",
          },
        ],
      });

    const result = await getNotificacionById("1");

    expect(mockExecute).toHaveBeenCalledTimes(4);

    expect(result).toEqual(
      expect.objectContaining({
        NOTIFICACION_ID: 1,
        ESTADO_PROCESO: "pendiente",
        PACIENTE_ID: 10,
        NOMBRE: "Ana",
        APELLIDO: "López",
        FOTO: "data:image/jpeg;base64,Zm90by10ZXN0",
        TUTORES: expect.any(Array),
      })
    );

    expect(result.TUTORES).toHaveLength(2);

    expect(result.TUTORES[0]).toEqual(
      expect.objectContaining({
        tutorParentesco: "Madre",
        tutorNombre: "María López",
        madreSeguroMedico: "IMSS",
        acidoFolico: "Sí",
        citasControl: "8",
        hijoDtn: "Sí",
        familiarDtn: "No",
        expoToxicos: "Sí",
      })
    );

    expect(result.TUTORES[1]).toEqual(
      expect.objectContaining({
        tutorParentesco: "Padre",
        tutorNombre: "Juan Pérez",
        tutorSeguroMedico: "ISSSTE",
        madreSeguroMedico: "",
        acidoFolico: "",
      })
    );

    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("getNotificacionById retorna detalle sin foto ni tutores si no existen", async () => {
    mockExecute
      .mockResolvedValueOnce({
        rows: [
          {
            NOTIFICACION_ID: 2,
            ESTADO_PROCESO: "pendiente",
            FECHA_CREACION: "09/06/2026 10:00",
            PACIENTE_ID: 20,
            NOMBRE: "Luis",
            APELLIDO: "García",
            FOTOGRAFIA: null,
          },
        ],
      })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });

    const result = await getNotificacionById("2");

    expect(result).toEqual(
      expect.objectContaining({
        NOTIFICACION_ID: 2,
        PACIENTE_ID: 20,
        NOMBRE: "Luis",
        APELLIDO: "García",
        FOTO: null,
        TUTORES: [],
      })
    );

    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("aprobarNotificacion actualiza estado a aprobado y retorna true", async () => {
    mockExecute.mockResolvedValue({
      rowsAffected: 1,
    });

    const result = await aprobarNotificacion("5");

    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE NOTIFICACION SET estado_proceso = :estado"),
      { estado: "aprobado", notificacionId: 5 },
      { autoCommit: true }
    );

    expect(result).toBe(true);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("aprobarNotificacion retorna false si no actualiza filas", async () => {
    mockExecute.mockResolvedValue({
      rowsAffected: 0,
    });

    const result = await aprobarNotificacion("5");

    expect(result).toBe(false);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("rechazarNotificacion actualiza estado a rechazado y retorna true", async () => {
    mockExecute.mockResolvedValue({
      rowsAffected: 1,
    });

    const result = await rechazarNotificacion("6");

    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE NOTIFICACION SET estado_proceso = :estado"),
      { estado: "rechazado", notificacionId: 6 },
      { autoCommit: true }
    );

    expect(result).toBe(true);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("eliminarNotificacionesAntiguas retorna 0 si no hay pacientes antiguos", async () => {
    mockExecute.mockResolvedValueOnce({
      rows: [],
    });

    const result = await eliminarNotificacionesAntiguas();

    expect(mockExecute).toHaveBeenCalledTimes(1);

    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("SELECT DISTINCT paciente_id"),
      {},
      { outFormat: "OUT_FORMAT_OBJECT" }
    );

    expect(result).toBe(0);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("eliminarNotificacionesAntiguas elimina información relacionada y retorna cantidad de pacientes", async () => {
    mockExecute
      .mockResolvedValueOnce({
        rows: [{ PACIENTE_ID: 10 }, { PACIENTE_ID: 20 }],
      })
      .mockResolvedValue({ rowsAffected: 1 });

    const result = await eliminarNotificacionesAntiguas();

    expect(result).toBe(2);

    expect(mockExecute).toHaveBeenCalledTimes(8);

    expect(mockExecute).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("SELECT DISTINCT paciente_id"),
      {},
      { outFormat: "OUT_FORMAT_OBJECT" }
    );

    expect(mockExecute).toHaveBeenNthCalledWith(
      2,
      "DELETE FROM NOTIFICACION WHERE paciente_id IN (:id0,:id1)",
      { id0: 10, id1: 20 },
      { autoCommit: true }
    );

    expect(mockExecute).toHaveBeenNthCalledWith(
      8,
      "DELETE FROM PACIENTE WHERE paciente_id IN (:id0,:id1)",
      { id0: 10, id1: 20 },
      { autoCommit: true }
    );

    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("cierra conexión y lanza error si falla getNotificaciones", async () => {
    mockExecute.mockRejectedValue(new Error("Error Oracle"));

    await expect(getNotificaciones()).rejects.toThrow("Error Oracle");

    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("cierra conexión y lanza error si falla aprobarNotificacion", async () => {
    mockExecute.mockRejectedValue(new Error("Error update"));

    await expect(aprobarNotificacion("1")).rejects.toThrow("Error update");

    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("cierra conexión y lanza error si falla eliminarNotificacionesAntiguas", async () => {
    mockExecute.mockRejectedValue(new Error("Error delete"));

    await expect(eliminarNotificacionesAntiguas()).rejects.toThrow(
      "Error delete"
    );

    expect(mockClose).toHaveBeenCalledTimes(1);
  });
});