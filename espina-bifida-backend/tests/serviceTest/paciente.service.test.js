import { jest, describe, test, expect, beforeEach } from "@jest/globals";
import { EventEmitter } from "node:events";

const mockExecute = jest.fn();
const mockClose = jest.fn();
const mockCommit = jest.fn();
const mockRollback = jest.fn();

const mockConn = {
  execute: mockExecute,
  close: mockClose,
  commit: mockCommit,
  rollback: mockRollback,
};

const mockGetConnection = jest.fn();
const mockMapPacienteToCard = jest.fn();
const mockObtenerMembresiaPorPacienteId = jest.fn();

jest.unstable_mockModule("oracledb", () => ({
  default: {
    OUT_FORMAT_OBJECT: "OUT_FORMAT_OBJECT",
    STRING: "STRING",
    NUMBER: "NUMBER",
  },
  OUT_FORMAT_OBJECT: "OUT_FORMAT_OBJECT",
  STRING: "STRING",
  NUMBER: "NUMBER",
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

describe("paciente.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetConnection.mockResolvedValue(mockConn);
    mockMapPacienteToCard.mockImplementation((row) => ({
      id: row.PACIENTE_ID,
      nombre: row.NOMBRE,
      estatus: row.ESTATUS_MEMBRESIA,
    }));
  });

  test("getPacienteCards debe obtener pacientes y mapearlos", async () => {
    mockExecute.mockResolvedValueOnce({
      rows: [
        { PACIENTE_ID: 2, NOMBRE: "Ana", ESTATUS_MEMBRESIA: "activo" },
        { PACIENTE_ID: 1, NOMBRE: "Juan", ESTATUS_MEMBRESIA: "inactivo" },
      ],
    });

    const result = await getPacienteCards(" ana ");

    expect(mockExecute).toHaveBeenCalledTimes(1);

    const binds = mockExecute.mock.calls[0][1];
    expect(binds).toEqual({ search: "ana" });

    expect(result).toEqual([
      { id: 2, nombre: "Ana", estatus: "activo" },
      { id: 1, nombre: "Juan", estatus: "inactivo" },
    ]);

    expect(mockMapPacienteToCard).toHaveBeenCalledTimes(2);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("getPacienteCards debe mandar search null si viene vacío", async () => {
    mockExecute.mockResolvedValueOnce({ rows: [] });

    await getPacienteCards("   ");

    const binds = mockExecute.mock.calls[0][1];

    expect(binds).toEqual({ search: null });
  });

  test("getPacienteCredencial debe regresar null si no existe paciente", async () => {
    mockExecute.mockResolvedValueOnce({ rows: [] });

    const result = await getPacienteCredencial(99);

    expect(result).toBeNull();
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("getPacienteCredencial debe mapear la credencial correctamente", async () => {
    mockExecute.mockResolvedValueOnce({
      rows: [
        {
          FOLIO: "001",
          NOMBRE: "Juan",
          APELLIDO: "Pérez",
          DIRECCION: "Monterrey, Nuevo León",
          TELCASA: "123",
          PADRES: "María",
          FECHAEXPEDICION: "01/01/26",
          TIPOSANGRE: "O+",
          VALVULA: "Sí",
          ACCIDENTEAVISAR: "María",
          TELEFONOEMERGENCIA: "8112345678",
          CORREO: "juan@mail.com",
          FECHANACIMIENTO: "01/01/2010",
          LUGARNACIMIENTO: "Monterrey",
          HOSPITAL: "Hospital A",
        },
      ],
    });

    const result = await getPacienteCredencial(1);

    expect(result).toEqual({
      folio: "001",
      nombre: "Juan",
      apellido: "Pérez",
      nombreCompleto: "Juan Pérez",
      direccion: "Monterrey, Nuevo León",
      telCasa: "123",
      padres: "María",
      fechaExpedicion: "01/01/26",
      tipoSangre: "O+",
      valvula: "Sí",
      accidenteAvisar: "María",
      telefonoEmergencia: "8112345678",
      correo: "juan@mail.com",
      fechaNacimiento: "01/01/2010",
      lugarNacimiento: "Monterrey",
      hospital: "Hospital A",
    });
  });

  test("getPacienteDetail debe regresar null si no existe paciente", async () => {
    mockExecute.mockResolvedValueOnce({ rows: [] });

    const result = await getPacienteDetail(1);

    expect(result).toBeNull();
    expect(mockObtenerMembresiaPorPacienteId).not.toHaveBeenCalled();
  });

  test("getPacienteDetail debe obtener membresía y mapear paciente", async () => {
    mockExecute.mockResolvedValueOnce({
      rows: [
        {
          PACIENTE_ID: 1,
          NOMBRE: "Juan",
          APELLIDO: "Pérez",
        },
      ],
    });

    mockObtenerMembresiaPorPacienteId.mockResolvedValueOnce({
      ESTATUS: "activo",
    });

    const result = await getPacienteDetail(1);

    expect(mockObtenerMembresiaPorPacienteId).toHaveBeenCalledWith(1);
    expect(mockMapPacienteToCard).toHaveBeenCalledWith({
      PACIENTE_ID: 1,
      NOMBRE: "Juan",
      APELLIDO: "Pérez",
      ESTATUS_MEMBRESIA: "activo",
    });

    expect(result).toEqual({
      id: 1,
      nombre: "Juan",
      estatus: "activo",
    });
  });

  test("getPacienteDetalle debe regresar datos del paciente con fechas en ISO y foto", async () => {
    mockExecute.mockResolvedValueOnce({
      rows: [
        {
          PACIENTE_ID: 1,
          NOMBRE: "Juan",
          APELLIDO: "Pérez",
          EMAIL: "juan@mail.com",
          TELEFONO_CELULAR: "8112345678",
          ESTADO_RESIDENCIA: "Nuevo León",
          FECHA_ALTA: "2026-01-01T00:00:00.000Z",
          VIVE: "SI",
        },
      ],
    });

    mockObtenerMembresiaPorPacienteId.mockResolvedValueOnce({
      FECHA_INICIO: "2026-02-01T00:00:00.000Z",
      FECHA_FIN: "2026-12-31T00:00:00.000Z",
    });

    const result = await getPacienteDetalle(1);

    expect(result.PACIENTE_ID).toBe(1);
    expect(result.NOMBRE_COMPLETO).toBe("Juan Pérez");
    expect(result.EMAIL).toBe("juan@mail.com");
    expect(result.VIVE).toBe("SI");
    expect(result.FECHA_ALTA).toBe(new Date("2026-01-01T00:00:00.000Z").toISOString());
    expect(result.FECHA_INICIO).toBe(new Date("2026-02-01T00:00:00.000Z").toISOString());
    expect(result.FECHA_FIN).toBe(new Date("2026-12-31T00:00:00.000Z").toISOString());
    expect(result.foto).toBe("/api/pacientes/1/foto");
  });

  test("guardarFoto debe actualizar la fotografía", async () => {
    mockExecute.mockResolvedValueOnce({});

    const buffer = Buffer.from("foto");

    await guardarFoto(1, buffer);

    expect(mockExecute).toHaveBeenCalledTimes(1);

    const sql = mockExecute.mock.calls[0][0];
    const binds = mockExecute.mock.calls[0][1];
    const options = mockExecute.mock.calls[0][2];

    expect(sql).toContain("UPDATE PACIENTE SET FOTOGRAFIA");
    expect(binds).toEqual({
      foto: buffer,
      id: 1,
    });
    expect(options).toEqual({ autoCommit: true });
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("obtenerFoto debe regresar null si no existe paciente", async () => {
    mockExecute.mockResolvedValueOnce({ rows: [] });

    const result = await obtenerFoto(1);

    expect(result).toBeNull();
  });

  test("obtenerFoto debe regresar null si no hay fotografía", async () => {
    mockExecute.mockResolvedValueOnce({
      rows: [{ FOTOGRAFIA: null }],
    });

    const result = await obtenerFoto(1);

    expect(result).toBeNull();
  });

test("obtenerFoto debe convertir LOB a Buffer", async () => {
  const lob = new EventEmitter();

  mockExecute.mockResolvedValueOnce({
    rows: [{ FOTOGRAFIA: lob }],
  });

  const promise = obtenerFoto(1);

  // Espera a que obtenerFoto termine el await de conn.execute
  // y registre los listeners del LOB.
  await new Promise((resolve) => setImmediate(resolve));

  lob.emit("data", Buffer.from("hola "));
  lob.emit("data", Buffer.from("mundo"));
  lob.emit("end");

  const result = await promise;

  expect(Buffer.isBuffer(result)).toBe(true);
  expect(result.toString()).toBe("hola mundo");
});

  test("updatePaciente debe actualizar datos básicos y hacer commit", async () => {
    mockExecute.mockResolvedValueOnce({});

    await updatePaciente(
      1,
      {
        nombre: "Juan",
        apellido: "Pérez",
        curp: "CURP123",
        genero: "Masculino",
        fechaNacimiento: "2010-01-01",
        direccion: "Calle 1",
        ciudad: "Monterrey",
        estado: "Nuevo León",
        codigoPostal: "64000",
        telefonoCasa: "123",
        telefonoCelular: "8112345678",
        correo: "juan@mail.com",
        emergenciaContacto: "María",
        emergenciaTelefono: "8199999999",
        lugarNacimiento: "Monterrey",
        hospitalNacimiento: "Hospital A",
        tipoSangre: "O+",
        usaValvula: "Sí",
        notas: "Notas",
      },
      null
    );

    expect(mockExecute).toHaveBeenCalledTimes(1);

    const binds = mockExecute.mock.calls[0][1];

    expect(binds.nombre).toBe("Juan");
    expect(binds.apellido).toBe("Pérez");
    expect(binds.valvula).toBe("SI");
    expect(binds.pacienteId).toBe(1);

    expect(mockCommit).toHaveBeenCalledTimes(1);
    expect(mockRollback).not.toHaveBeenCalled();
  });

  test("updatePaciente debe actualizar o insertar padecimiento si se envía tipoEspinaBifida", async () => {
    mockExecute
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ PADECIMIENTO_ID: 5 }] })
      .mockResolvedValueOnce({ rows: [{ TOTAL: 0 }] })
      .mockResolvedValueOnce({});

    await updatePaciente(1, {
      nombre: "Juan",
      apellido: "Pérez",
      usaValvula: "No",
      tipoEspinaBifida: "Mielomeningocele",
    });

    expect(mockExecute).toHaveBeenCalledTimes(4);
    expect(mockExecute.mock.calls[3][0]).toContain("INSERT INTO PACIENTE_PADECIMIENTO");
    expect(mockCommit).toHaveBeenCalledTimes(1);
  });

  test("updatePaciente debe hacer rollback si ocurre error", async () => {
    mockExecute.mockRejectedValueOnce(new Error("DB error"));

    await expect(updatePaciente(1, { nombre: "Juan" })).rejects.toThrow("DB error");

    expect(mockRollback).toHaveBeenCalledTimes(1);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("getPacienteCompleto debe regresar null si no existe paciente", async () => {
    mockExecute.mockResolvedValueOnce({ rows: [] });

    const result = await getPacienteCompleto(1);

    expect(result).toBeNull();
  });

  test("getPacienteCompleto debe regresar paciente completo con tutores", async () => {
    mockExecute
      .mockResolvedValueOnce({
        rows: [
          {
            PACIENTE_ID: 1,
            NOMBRE: "Juan",
            APELLIDO: "Pérez",
            CURP: "CURP123",
            GENERO: "Masculino",
            FECHA_NACIMIENTO: "2010-01-01",
            DIRECCION: "Calle 1",
            CIUDAD_RESIDENCIA: "Monterrey",
            ESTADO_RESIDENCIA: "Nuevo León",
            CODIGO_POSTAL: "64000",
            TELEFONO_CASA: "123",
            TELEFONO_CELULAR: "8112345678",
            EMAIL: "juan@mail.com",
            EMERGENCIA_CONTACTO: "María",
            EMERGENCIA_TELEFONO: "8199999999",
            LUGAR_NACIMIENTO: "Monterrey",
            HOSPITAL_NACIMIENTO: "Hospital A",
            SANGRE_TIPO: "O+",
            VALVULA: "SI",
            NOTAS_ADICIONALES: "Notas",
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            TIPO_PADECIMIENTO: "Mielomeningocele",
            DESCRIPCION: "",
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            MADRE_ID: 1,
            NOMBRE: "María",
            LUGAR_NACIMIENTO: "Monterrey",
            ESCOLARIDAD: "Licenciatura",
            OCUPACION: "Contadora",
            EDAD: 40,
            SEGURO_MEDICO: "IMSS",
            CD_EMBARAZO: "Monterrey",
            ACIDO_FOLICO: "S",
            CITAS_CONTROL: 5,
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            PADRE_ID: 1,
            NOMBRE: "Pedro",
            LUGAR_NACIMIENTO: "Monterrey",
            ESCOLARIDAD: "Licenciatura",
            OCUPACION: "Ingeniero",
            EDAD: 42,
            SEGURO_MEDICO: "IMSS",
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            ADICCIONES: "No",
            HIJO_DTN: "SI",
            FAMILIAR_DTN: "NO",
            EXPO_TOXICOS: "NO",
            DESCRIPCION_EXPO_TOXICOS: "",
          },
        ],
      });

    const result = await getPacienteCompleto(1);

    expect(result.PACIENTE_ID).toBe(1);
    expect(result.NOMBRE).toBe("Juan");
    expect(result.TIPO_ESPINA_BIFIDA).toBe("Mielomeningocele");
    expect(result.FOTO).toBe("/api/pacientes/1/foto");

    expect(result.TUTORES).toHaveLength(2);
    expect(result.TUTORES[0].tutorParentesco).toBe("Madre");
    expect(result.TUTORES[0].tutorNombre).toBe("María");
    expect(result.TUTORES[0].acidoFolico).toBe("Sí");
    expect(result.TUTORES[0].hijoDtn).toBe("Sí");

    expect(result.TUTORES[1].tutorParentesco).toBe("Padre");
    expect(result.TUTORES[1].tutorNombre).toBe("Pedro");
  });

  test("updateHistorialMadre debe actualizar madre existente y ambos existente", async () => {
    mockExecute
      .mockResolvedValueOnce({ rows: [{ MADRE_ID: 1 }] })
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ TOTAL: 1 }] })
      .mockResolvedValueOnce({});

    await updateHistorialMadre(1, {
      tutores: [
        {
          tutorParentesco: "Madre",
          tutorNombre: "María",
          tutorLugarNacimiento: "Monterrey",
          tutorEdad: "40",
          tutorOcupacion: "Contadora",
          tutorEscolaridad: "Licenciatura",
          madreSeguroMedico: "IMSS",
          cdEmbarazo: "Monterrey",
          acidoFolico: "Sí",
          citasControl: "5",
          adicciones: "No",
          hijoDtn: "Sí",
          familiarDtn: "No",
          expoToxicos: "No",
          descripcionExpoToxicos: "",
        },
      ],
    });

    expect(mockExecute).toHaveBeenCalledTimes(4);
    expect(mockExecute.mock.calls[1][0]).toContain("UPDATE HISTORIAL_MADRE");
    expect(mockExecute.mock.calls[3][0]).toContain("UPDATE HISTORIAL_AMBOS");
    expect(mockCommit).toHaveBeenCalledTimes(1);
  });

  test("updateHistorialMadre debe insertar padre si no existe", async () => {
    mockExecute
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ TOTAL: 0 }] })
      .mockResolvedValueOnce({});

    await updateHistorialMadre(1, {
      tutores: [
        {
          tutorParentesco: "Padre",
          tutorNombre: "Pedro",
          tutorLugarNacimiento: "Monterrey",
          tutorEdad: "42",
          tutorOcupacion: "Ingeniero",
          tutorEscolaridad: "Licenciatura",
          tutorSeguroMedico: "IMSS",
          adicciones: "No",
          hijoDtn: "No",
          familiarDtn: "No",
          expoToxicos: "Sí",
          descripcionExpoToxicos: "Químicos",
        },
      ],
    });

    expect(mockExecute.mock.calls[1][0]).toContain("INSERT INTO HISTORIAL_PADRE");
    expect(mockExecute.mock.calls[3][0]).toContain("INSERT INTO HISTORIAL_AMBOS");
    expect(mockCommit).toHaveBeenCalledTimes(1);
  });

  test("updateHistorialMadre debe hacer rollback si ocurre error", async () => {
    mockExecute.mockRejectedValueOnce(new Error("DB error"));

    await expect(
      updateHistorialMadre(1, {
        tutores: [
          {
            tutorParentesco: "Madre",
            tutorNombre: "María",
          },
        ],
      })
    ).rejects.toThrow("DB error");

    expect(mockRollback).toHaveBeenCalledTimes(1);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });
});