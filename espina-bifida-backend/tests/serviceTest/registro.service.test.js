import { jest, describe, test, expect, beforeEach } from "@jest/globals";

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

jest.unstable_mockModule("../../config/db.js", () => ({
  getConnection: mockGetConnection,
}));

const {
  crearPacientePaso1,
  actualizarPaso2,
  actualizarPaso3,
  actualizarPaso4,
  actualizarPaso5,
  guardarDocumentos,
} = await import("../../modulos/registro/registro.service.js");

describe("registro.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetConnection.mockResolvedValue(mockConn);
  });

  test("crearPacientePaso1 debe crear paciente y regresar pacienteId", async () => {
    mockExecute
      .mockResolvedValueOnce({ rows: [[0]] })
      .mockResolvedValueOnce({ outBinds: { id: [123] } });

    const result = await crearPacientePaso1({
      nombre: "Juan",
      apellido: "Pérez",
      genero: "Masculino",
      fechaNacimiento: "2010-01-01",
      curp: "CURP123",
    });

    expect(result).toEqual({ pacienteId: 123 });
    expect(mockExecute).toHaveBeenCalledTimes(2);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("crearPacientePaso1 debe eliminar notificación pendiente si recibe usuarioId", async () => {
    mockExecute
      .mockResolvedValueOnce({ rows: [[0]] })
      .mockResolvedValueOnce({ outBinds: { id: [55] } })
      .mockResolvedValueOnce({});

    const result = await crearPacientePaso1({
      nombre: "Ana",
      apellido: "López",
      genero: "Femenino",
      fechaNacimiento: "2015-05-10",
      curp: "CURP456",
      usuarioId: 10,
    });

    expect(result).toEqual({ pacienteId: 55 });
    expect(mockExecute).toHaveBeenCalledTimes(3);

    const deleteCall = mockExecute.mock.calls[2][0];
    expect(deleteCall).toContain("DELETE FROM NOTIFICACION");
  });

  test("crearPacientePaso1 debe lanzar error si CURP ya existe", async () => {
    mockExecute.mockResolvedValueOnce({ rows: [[1]] });

    await expect(
      crearPacientePaso1({
        nombre: "Juan",
        apellido: "Pérez",
        genero: "Masculino",
        fechaNacimiento: "2010-01-01",
        curp: "CURP123",
      })
    ).rejects.toMatchObject({
      code: "CURP_DUPLICADO",
      message: "Ya existe un paciente registrado con ese CURP.",
    });

    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("actualizarPaso2 debe actualizar datos de contacto convirtiendo vacíos a null", async () => {
    mockExecute.mockResolvedValueOnce({});

    await actualizarPaso2(1, {
      direccion: "",
      ciudad: "Monterrey",
      estado: "Nuevo León",
      codigoPostal: "N/A",
      emergenciaContacto: "Mamá",
      emergenciaTelefono: "",
      telefonoCasa: undefined,
      telefonoCelular: "8112345678",
      correo: "test@mail.com",
    });

    expect(mockExecute).toHaveBeenCalledTimes(1);

    const binds = mockExecute.mock.calls[0][1];

    expect(binds).toEqual({
      direccion: null,
      ciudad: "Monterrey",
      estado: "Nuevo León",
      codigoPostal: null,
      emergenciaContacto: "Mamá",
      emergenciaTelefono: null,
      telefonoCasa: null,
      telefonoCelular: "8112345678",
      correo: "test@mail.com",
      pacienteId: 1,
    });

    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("actualizarPaso3 debe actualizar datos médicos y hacer commit", async () => {
    mockExecute
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [] });

    await actualizarPaso3(1, {
      lugarNacimiento: "Monterrey",
      hospitalNacimiento: "Hospital A",
      tipoSangre: "O+",
      usaValvula: "Sí",
      notas: "",
      tipoEspinaBifida: "Mielomeningocele",
    });

    expect(mockExecute).toHaveBeenCalled();
    expect(mockCommit).toHaveBeenCalledTimes(1);
    expect(mockRollback).not.toHaveBeenCalled();

    const binds = mockExecute.mock.calls[0][1];

    expect(binds.valvula).toBe("SI");
    expect(binds.notas).toBe(null);
  });

  test("actualizarPaso3 debe insertar padecimiento si no existe relación previa", async () => {
    mockExecute
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ PADECIMIENTO_ID: 9 }] })
      .mockResolvedValueOnce({ rows: [{ TOTAL: 0 }] })
      .mockResolvedValueOnce({});

    await actualizarPaso3(1, {
      lugarNacimiento: "Monterrey",
      hospitalNacimiento: "Hospital A",
      tipoSangre: "O+",
      usaValvula: "No",
      notas: "Notas",
      tipoEspinaBifida: "Mielomeningocele",
    });

    expect(mockExecute).toHaveBeenCalledTimes(4);

    const insertRelacion = mockExecute.mock.calls[3][0];
    expect(insertRelacion).toContain("INSERT INTO PACIENTE_PADECIMIENTO");

    expect(mockCommit).toHaveBeenCalledTimes(1);
  });

  test("actualizarPaso3 debe actualizar descripción si tipoEspinaBifida es OTROS", async () => {
    mockExecute
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ PADECIMIENTO_ID: 3 }] })
      .mockResolvedValueOnce({ rows: [{ TOTAL: 1 }] })
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({});

    await actualizarPaso3(1, {
      lugarNacimiento: "Monterrey",
      hospitalNacimiento: "Hospital A",
      tipoSangre: "A+",
      usaValvula: "No",
      notas: "Notas",
      tipoEspinaBifida: "OTROS",
      otrosPadecimiento: "Otro padecimiento",
    });

    expect(mockExecute).toHaveBeenCalledTimes(5);

    const updateDescripcion = mockExecute.mock.calls[4][0];
    expect(updateDescripcion).toContain("UPDATE PADECIMIENTOEB SET DESCRIPCION");

    expect(mockCommit).toHaveBeenCalledTimes(1);
  });

  test("actualizarPaso3 debe hacer rollback si ocurre error", async () => {
    mockExecute.mockRejectedValueOnce(new Error("DB error"));

    await expect(
      actualizarPaso3(1, {
        lugarNacimiento: "Monterrey",
        hospitalNacimiento: "Hospital A",
        tipoSangre: "O+",
        usaValvula: "Sí",
      })
    ).rejects.toThrow("DB error");

    expect(mockRollback).toHaveBeenCalledTimes(1);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("actualizarPaso4 debe insertar historial de madre y actualizar historial ambos", async () => {
    mockExecute
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ TOTAL: 1 }] })
      .mockResolvedValueOnce({});

    await actualizarPaso4(1, {
      tutorParentesco: "Madre",
      tutorNombre: "María",
      tutorLugarNacimiento: "Monterrey",
      tutorEdad: "40",
      tutorOcupacion: "Contadora",
      tutorEscolaridad: "Licenciatura",
      tutorSeguroMedico: "",
      madreSeguroMedico: "IMSS",
      cdEmbarazo: "Monterrey",
      acidoFolico: "Sí",
      citasControl: "5",
      adicciones: "No",
      hijoDtn: "Sí",
      familiarDtn: "No",
      expoToxicos: "No",
      descripcionExpoToxicos: "",
    });

    expect(mockExecute).toHaveBeenCalledTimes(3);

    expect(mockExecute.mock.calls[0][0]).toContain("INSERT INTO HISTORIAL_MADRE");
    expect(mockExecute.mock.calls[2][0]).toContain("UPDATE HISTORIAL_AMBOS");

    const madreBinds = mockExecute.mock.calls[0][1];
    expect(madreBinds.edad).toBe(40);
    expect(madreBinds.acidoFolico).toBe("S");
    expect(madreBinds.seguroMedico).toBe("IMSS");

    expect(mockCommit).toHaveBeenCalledTimes(1);
  });

  test("actualizarPaso4 debe insertar historial de padre e insertar historial ambos si no existe", async () => {
    mockExecute
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ TOTAL: 0 }] })
      .mockResolvedValueOnce({});

    await actualizarPaso4(1, {
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
    });

    expect(mockExecute.mock.calls[0][0]).toContain("INSERT INTO HISTORIAL_PADRE");
    expect(mockExecute.mock.calls[2][0]).toContain("INSERT INTO HISTORIAL_AMBOS");

    const ambosBinds = mockExecute.mock.calls[2][1];

    expect(ambosBinds.hijoDtn).toBe("NO");
    expect(ambosBinds.familiarDtn).toBe("NO");
    expect(ambosBinds.expoToxicos).toBe("SI");

    expect(mockCommit).toHaveBeenCalledTimes(1);
  });

  test("actualizarPaso5 debe guardar fotografía", async () => {
    mockExecute.mockResolvedValueOnce({});

    const buffer = Buffer.from("foto-test");

    await actualizarPaso5(1, buffer);

    expect(mockExecute).toHaveBeenCalledTimes(1);

    const sql = mockExecute.mock.calls[0][0];
    const binds = mockExecute.mock.calls[0][1];
    const options = mockExecute.mock.calls[0][2];

    expect(sql).toContain("UPDATE PACIENTE SET FOTOGRAFIA");
    expect(binds).toEqual({
      foto: buffer,
      pacienteId: 1,
    });
    expect(options).toEqual({ autoCommit: true });
  });

  test("guardarDocumentos no debe ejecutar UPDATE si no hay documentos", async () => {
    await guardarDocumentos(1, {});

    expect(mockExecute).not.toHaveBeenCalled();
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("guardarDocumentos debe actualizar solo los documentos enviados", async () => {
    mockExecute.mockResolvedValueOnce({});

    const docCurp = Buffer.from("curp");
    const docIneFamilia = Buffer.from("ine");

    await guardarDocumentos(1, {
      docCurp,
      docIneFamilia,
    });

    expect(mockExecute).toHaveBeenCalledTimes(1);

    const sql = mockExecute.mock.calls[0][0];
    const binds = mockExecute.mock.calls[0][1];

    expect(sql).toContain("DOC_CURP = :docCurp");
    expect(sql).toContain("DOC_INE_FAMILIA = :docIneFamilia");
    expect(sql).not.toContain("DOC_ACTA_NACIMIENTO");

    expect(binds).toEqual({
      pacienteId: 1,
      docCurp,
      docIneFamilia,
    });
  });
});