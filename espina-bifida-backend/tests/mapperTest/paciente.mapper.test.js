import { describe, test, expect } from "@jest/globals";
import { mapPacienteToCard } from "../../modulos/paciente/paciente.mapper.js";

describe("paciente.mapper.js", () => {
  test("mapPacienteToCard mapea correctamente un paciente activo con datos completos", () => {
    const row = {
      PACIENTE_ID: 7,
      NOMBRE: "Ana",
      APELLIDO: "López",
      CURP: "LOAA010101MNLXXX01",
      FOTOGRAFIA: Buffer.from("foto"),
      ESTATUS_MEMBRESIA: "activo",
      CIUDAD_RESIDENCIA: "Monterrey",
      ESTADO_RESIDENCIA: "Nuevo León",
      TOTAL_CONSULTAS: 5,
      FECHA_ULTIMA_VISITA: "2026-06-09",
      FECHA_NACIMIENTO: "2010-01-01",
      ETAPA_VIDA: "Adolescencia",
    };

    const result = mapPacienteToCard(row);

    expect(result).toEqual({
      id: 7,
      folio: "007",
      initials: "AL",
      foto: "/api/pacientes/7/foto",
      name: "Ana López",
      nombre: "Ana",
      apellido: "López",
      curp: "LOAA010101MNLXXX01",
      subtitle: "LOAA010101MNLXXX01",
      status: "Activo",
      location: "Monterrey, Nuevo León",
      totalConsultas: 5,
      ultimaVisita: "2026-06-09",
      fechaNacimiento: "2010-01-01",
      etapaVida: "Adolescencia",
    });
  });

  test("mapPacienteToCard mapea paciente inactivo cuando membresía no es activo", () => {
    const row = {
      PACIENTE_ID: 15,
      NOMBRE: "Juan",
      APELLIDO: "Pérez",
      CURP: "PEJJ010101HNLXXX01",
      FOTOGRAFIA: null,
      ESTATUS_MEMBRESIA: "inactivo",
      CIUDAD_RESIDENCIA: "Guadalupe",
      ESTADO_RESIDENCIA: "Nuevo León",
      TOTAL_CONSULTAS: 2,
      FECHA_ULTIMA_VISITA: null,
      FECHA_NACIMIENTO: "2009-05-10",
      ETAPA_VIDA: "Niñez",
    };

    const result = mapPacienteToCard(row);

    expect(result.status).toBe("Inactivo");
    expect(result.foto).toBeNull();
    expect(result.initials).toBe("JP");
    expect(result.name).toBe("Juan Pérez");
  });

  test("mapPacienteToCard acepta estatus activo aunque venga en mayúsculas", () => {
    const row = {
      PACIENTE_ID: 3,
      NOMBRE: "María",
      APELLIDO: "García",
      CURP: "GAMM010101MNLXXX01",
      ESTATUS_MEMBRESIA: "ACTIVO",
    };

    const result = mapPacienteToCard(row);

    expect(result.status).toBe("Activo");
  });

  test("mapPacienteToCard usa valores por defecto si faltan datos", () => {
    const row = {
      PACIENTE_ID: 1,
      NOMBRE: "",
      APELLIDO: "",
      CURP: "",
      FOTOGRAFIA: null,
      ESTATUS_MEMBRESIA: null,
      CIUDAD_RESIDENCIA: null,
      ESTADO_RESIDENCIA: null,
      TOTAL_CONSULTAS: null,
      FECHA_ULTIMA_VISITA: null,
      FECHA_NACIMIENTO: null,
      ETAPA_VIDA: null,
    };

    const result = mapPacienteToCard(row);

    expect(result).toEqual({
      id: 1,
      folio: "001",
      initials: "SN",
      foto: null,
      name: "Sin nombre",
      nombre: "",
      apellido: "",
      curp: "Sin CURP",
      subtitle: "Sin CURP",
      status: "Inactivo",
      location: "",
      totalConsultas: 0,
      ultimaVisita: null,
      fechaNacimiento: null,
      etapaVida: "Sin especificar",
    });
  });

  test("mapPacienteToCard funciona si solo tiene nombre", () => {
    const row = {
      PACIENTE_ID: 20,
      NOMBRE: "Carlos",
      APELLIDO: "",
      CURP: null,
      FOTOGRAFIA: null,
      ESTATUS_MEMBRESIA: null,
    };

    const result = mapPacienteToCard(row);

    expect(result.name).toBe("Carlos");
    expect(result.initials).toBe("C");
    expect(result.nombre).toBe("Carlos");
    expect(result.apellido).toBe("");
    expect(result.curp).toBe("Sin CURP");
  });

  test("mapPacienteToCard funciona si solo tiene apellido", () => {
    const row = {
      PACIENTE_ID: 21,
      NOMBRE: "",
      APELLIDO: "Ramírez",
      CURP: null,
      FOTOGRAFIA: null,
      ESTATUS_MEMBRESIA: null,
    };

    const result = mapPacienteToCard(row);

    expect(result.name).toBe("Ramírez");
    expect(result.initials).toBe("R");
    expect(result.nombre).toBe("");
    expect(result.apellido).toBe("Ramírez");
  });

  test("mapPacienteToCard genera folio con ceros a la izquierda", () => {
    const row = {
      PACIENTE_ID: 45,
      NOMBRE: "Luis",
      APELLIDO: "Martínez",
      CURP: "CURPTEST",
    };

    const result = mapPacienteToCard(row);

    expect(result.folio).toBe("045");
  });

  test("mapPacienteToCard no agrega ceros si el id ya tiene tres o más dígitos", () => {
    const row = {
      PACIENTE_ID: 1234,
      NOMBRE: "Luis",
      APELLIDO: "Martínez",
      CURP: "CURPTEST",
    };

    const result = mapPacienteToCard(row);

    expect(result.folio).toBe("1234");
  });

  test("mapPacienteToCard crea location solo con ciudad si no hay estado", () => {
    const row = {
      PACIENTE_ID: 8,
      NOMBRE: "Ana",
      APELLIDO: "López",
      CIUDAD_RESIDENCIA: "Monterrey",
      ESTADO_RESIDENCIA: null,
    };

    const result = mapPacienteToCard(row);

    expect(result.location).toBe("Monterrey");
  });

  test("mapPacienteToCard crea location solo con estado si no hay ciudad", () => {
    const row = {
      PACIENTE_ID: 9,
      NOMBRE: "Ana",
      APELLIDO: "López",
      CIUDAD_RESIDENCIA: null,
      ESTADO_RESIDENCIA: "Nuevo León",
    };

    const result = mapPacienteToCard(row);

    expect(result.location).toBe("Nuevo León");
  });
});