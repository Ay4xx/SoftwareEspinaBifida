import { mapPacienteToCard } from "../modulos/paciente/paciente.mapper.js";

describe("PACIENTE MAPPER", () => {
  test("debe mapear correctamente", () => {
    const row = {
      PACIENTE_ID: 1,
      NOMBRE: "Juan",
      APELLIDO: "Pérez",
      CIUDAD_RESIDENCIA: "Monterrey",
      ESTADO_RESIDENCIA: "NL",
      ESTATUS_MEMBRESIA: "activo",
    };

    const result = mapPacienteToCard(row);

    expect(result.id).toBe(1);
    expect(result.folio).toBe("001");
    expect(result.initials).toBe("JP");
    expect(result.name).toBe("Juan Pérez");
    expect(result.nombre).toBe("Juan");
    expect(result.apellido).toBe("Pérez");
    expect(result.subtitle).toBe("Paciente registrado");
    expect(result.status).toBe("Activo");
    expect(result.location).toBe("Monterrey, NL");
    expect(result.totalConsultas).toBe(0);
    expect(result.ultimaVisita).toBe(null);
  });

  test("debe poner Inactivo si la membresía no es activa", () => {
    const row = {
      PACIENTE_ID: 2,
      NOMBRE: "María",
      APELLIDO: "López",
      ESTATUS_MEMBRESIA: "vencida",
    };

    const result = mapPacienteToCard(row);

    expect(result.status).toBe("Inactivo");
  });

  test("debe poner Inactivo si la membresía no existe", () => {
    const row = {
      PACIENTE_ID: 6,
      NOMBRE: "Carlos",
      APELLIDO: "Ruiz",
    };

    const result = mapPacienteToCard(row);

    expect(result.status).toBe("Inactivo");
  });

  test("debe construir url de foto cuando existe fotografia", () => {
    const row = {
      PACIENTE_ID: 4,
      NOMBRE: "Luis",
      FOTOGRAFIA: Buffer.from("fake"),
    };

    const result = mapPacienteToCard(row);

    expect(result.foto).toBe("/api/pacientes/4/foto");
  });

  test("debe manejar foto nula", () => {
    const row = {
      PACIENTE_ID: 4,
      NOMBRE: "Luis",
    };

    const result = mapPacienteToCard(row);

    expect(result.foto).toBe(null);
  });

  test("debe manejar nombre vacío", () => {
    const row = {
      PACIENTE_ID: 3,
    };

    const result = mapPacienteToCard(row);

    expect(result.name).toBe("Sin nombre");
    expect(result.initials).toBe("SN");
    expect(result.folio).toBe("003");
  });

  test("debe manejar solo nombre sin apellido", () => {
    const row = {
      PACIENTE_ID: 7,
      NOMBRE: "Ana",
    };

    const result = mapPacienteToCard(row);

    expect(result.name).toBe("Ana");
    expect(result.initials).toBe("A");
  });

  test("debe manejar valores por default", () => {
    const row = {
      PACIENTE_ID: 5,
      NOMBRE: "Ana",
    };

    const result = mapPacienteToCard(row);

    expect(result.totalConsultas).toBe(0);
    expect(result.location).toBe("");
    expect(result.ultimaVisita).toBe(null);
  });

  test("debe mapear totalConsultas y ultimaVisita cuando existen", () => {
    const row = {
      PACIENTE_ID: 8,
      NOMBRE: "Elena",
      APELLIDO: "García",
      TOTAL_CONSULTAS: 12,
      FECHA_ULTIMA_VISITA: "2026-04-10T00:00:00.000Z",
    };

    const result = mapPacienteToCard(row);

    expect(result.totalConsultas).toBe(12);
    expect(result.ultimaVisita).toBe("2026-04-10T00:00:00.000Z");
  });
});