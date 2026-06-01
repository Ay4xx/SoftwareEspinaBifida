import { describe, test, expect } from "@jest/globals";
import { mapNotificacionToCard } from "../../modulos/notificaciones/notificaciones.mapper.js";

describe("notificaciones.mapper.js", () => {
  test("debe mapear una notificación completa correctamente", () => {
    const row = {
      NOTIFICACION_ID: 1,
      PACIENTE_ID: 10,
      USUARIO_ID: 5,
      TITULO: "Registro pendiente",
      MENSAJE: "Paciente esperando aprobación",
      ESTADO_PROCESO: "pendiente",
      FECHA_CREACION: "29/05/2026 14:30",
      NOMBRE: "Juan",
      APELLIDO: "Pérez",
      CURP: "JUAP000101HNLXXX01",
      CIUDAD_RESIDENCIA: "Monterrey",
      ESTADO_RESIDENCIA: "Nuevo León",
      TELEFONO_CELULAR: "8111111111",
      TELEFONO_CASA: "8122222222",
    };

    const result = mapNotificacionToCard(row);

    expect(result).toEqual({
      id: 1,
      pacienteId: 10,
      usuarioId: 5,
      titulo: "Registro pendiente",
      mensaje: "Paciente esperando aprobación",
      estado: "pendiente",
      fechaCreacion: "29/05/2026 14:30",
      paciente: {
        nombre: "Juan",
        apellido: "Pérez",
        curp: "JUAP000101HNLXXX01",
        ubicacion: "Monterrey, Nuevo León",
        telefono: "8111111111",
        foto: "http://localhost:3001/api/pacientes/10/foto",
      },
    });
  });

  test("debe usar valores por defecto si faltan datos", () => {
    const row = {
      NOTIFICACION_ID: 2,
      PACIENTE_ID: null,
      USUARIO_ID: null,
      TITULO: null,
      MENSAJE: null,
      ESTADO_PROCESO: null,
      FECHA_CREACION: null,
      NOMBRE: null,
      APELLIDO: null,
      CURP: null,
      CIUDAD_RESIDENCIA: null,
      ESTADO_RESIDENCIA: null,
      TELEFONO_CELULAR: null,
      TELEFONO_CASA: null,
    };

    const result = mapNotificacionToCard(row);

    expect(result).toEqual({
      id: 2,
      pacienteId: null,
      usuarioId: null,
      titulo: "Notificación",
      mensaje: "",
      estado: "pendiente",
      fechaCreacion: null,
      paciente: {
        nombre: "Sin nombre",
        apellido: "",
        curp: "",
        ubicacion: "",
        telefono: "",
        foto: null,
      },
    });
  });

  test("debe usar teléfono de casa si no hay celular", () => {
    const row = {
      NOTIFICACION_ID: 3,
      PACIENTE_ID: 20,
      USUARIO_ID: 1,
      TITULO: "Aviso",
      MENSAJE: "Mensaje",
      ESTADO_PROCESO: "pendiente",
      FECHA_CREACION: "29/05/2026",
      NOMBRE: "Ana",
      APELLIDO: "López",
      CURP: "",
      CIUDAD_RESIDENCIA: "San Pedro",
      ESTADO_RESIDENCIA: "",
      TELEFONO_CELULAR: null,
      TELEFONO_CASA: "8188888888",
    };

    const result = mapNotificacionToCard(row);

    expect(result.paciente.telefono).toBe("8188888888");
    expect(result.paciente.ubicacion).toBe("San Pedro");
  });
});