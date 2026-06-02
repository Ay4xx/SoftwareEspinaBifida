import { describe, test, expect } from "@jest/globals";
import { mapPacienteToCard } from "../../modulos/paciente/paciente.mapper.js";

describe("paciente.mapper.js", () => {
  test("mapPacienteToCard debe mapear correctamente un paciente activo", () => {
    const row = {
      PACIENTE_ID: 7,
      NOMBRE: "Juan",
      APELLIDO: "Pérez",
      FOTOGRAFIA: Buffer.from("foto"),
      ESTATUS_MEMBRESIA: "activo",
      CIUDAD_RESIDENCIA: "Monterrey",
      ESTADO_RESIDENCIA: "Nuevo León",
      TOTAL_CONSULTAS: 3,
      FECHA_ULTIMA_VISITA: "2026-05-20",
    };

    const result = mapPacienteToCard(row);

    expect(result).toEqual({
      id: 7,
      folio: "007",
      initials: "JP",
      foto: "/api/pacientes/7/foto",
      name: "Juan Pérez",
      nombre: "Juan",
      apellido: "Pérez",
      subtitle: "Paciente registrado",
      status: "Activo",
      location: "Monterrey, Nuevo León",
      totalConsultas: 3,
      ultimaVisita: "2026-05-20",
    });
  });

  test("mapPacienteToCard debe regresar Inactivo si no tiene membresía activa", () => {
    const row = {
      PACIENTE_ID: 1,
      NOMBRE: "Ana",
      APELLIDO: "López",
      FOTOGRAFIA: null,
      ESTATUS_MEMBRESIA: "inactivo",
      CIUDAD_RESIDENCIA: "San Pedro",
      ESTADO_RESIDENCIA: null,
      TOTAL_CONSULTAS: null,
      FECHA_ULTIMA_VISITA: null,
    };

    const result = mapPacienteToCard(row);

    expect(result.status).toBe("Inactivo");
    expect(result.foto).toBeNull();
    expect(result.location).toBe("San Pedro");
    expect(result.totalConsultas).toBe(0);
  });

  test("mapPacienteToCard debe manejar nombre vacío", () => {
    const row = {
      PACIENTE_ID: 12,
      NOMBRE: "",
      APELLIDO: "",
      FOTOGRAFIA: null,
      ESTATUS_MEMBRESIA: null,
      CIUDAD_RESIDENCIA: null,
      ESTADO_RESIDENCIA: null,
      TOTAL_CONSULTAS: 0,
      FECHA_ULTIMA_VISITA: null,
    };

    const result = mapPacienteToCard(row);

    expect(result.name).toBe("Sin nombre");
    expect(result.initials).toBe("SN");
    expect(result.folio).toBe("012");
    expect(result.status).toBe("Inactivo");
  });
});