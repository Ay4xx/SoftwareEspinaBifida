import { jest, describe, beforeEach, afterEach, test, expect } from "@jest/globals";

const mockGetCitasByFecha = jest.fn();
const mockCrearCita = jest.fn();
const mockActualizarEstatusCita = jest.fn();
const mockEliminarCita = jest.fn();
const mockGetCitaById = jest.fn();

jest.unstable_mockModule("../../modulos/agendacitas/agendacitas.service.js", () => ({
  getCitasByFecha: mockGetCitasByFecha,
  crearCita: mockCrearCita,
  actualizarEstatusCita: mockActualizarEstatusCita,
  eliminarCita: mockEliminarCita,
  getCitaById: mockGetCitaById,
}));

const {
  obtenerCitasPorFecha,
  obtenerCitaPorId,
  crearNuevaCita,
  actualizarEstatus,
  eliminarCitaController,
} = await import("../../modulos/agendacitas/agendacitas.controller.js");

function crearMockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("agendacitas.controller.js", () => {
  let consoleErrorSpy;
  let consoleLogSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  describe("obtenerCitasPorFecha", () => {
    test("debe obtener citas por fecha correctamente", async () => {
      const req = {
        query: {
          fecha: "2026-05-29",
        },
      };
      const res = crearMockRes();

      const citas = [
        {
          id_cita: 1,
          id_paciente: 10,
          nombre: "Juan",
          hora_cita: "10:00",
        },
      ];

      mockGetCitasByFecha.mockResolvedValue(citas);

      await obtenerCitasPorFecha(req, res);

      expect(mockGetCitasByFecha).toHaveBeenCalledWith("2026-05-29");
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        citas,
      });
    });

    test("debe responder 400 si falta fecha", async () => {
      const req = {
        query: {},
      };
      const res = crearMockRes();

      await obtenerCitasPorFecha(req, res);

      expect(mockGetCitasByFecha).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "La fecha es requerida",
      });
    });

    test("debe responder 500 si falla getCitasByFecha", async () => {
      const req = {
        query: {
          fecha: "2026-05-29",
        },
      };
      const res = crearMockRes();

      mockGetCitasByFecha.mockRejectedValue(new Error("DB error"));

      await obtenerCitasPorFecha(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Error obteniendo citas",
      });
    });
  });

  describe("obtenerCitaPorId", () => {
    test("debe obtener cita por id correctamente", async () => {
      const req = {
        params: {
          id: "1",
        },
      };
      const res = crearMockRes();

      const cita = {
        ID_CITA: 1,
        ID_PACIENTE: 10,
        NOMBRE: "Juan",
        HORA_CITA: "10:00",
      };

      mockGetCitaById.mockResolvedValue(cita);

      await obtenerCitaPorId(req, res);

      expect(mockGetCitaById).toHaveBeenCalledWith("1");
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        cita,
      });
    });

    test("debe responder 404 si no existe cita", async () => {
      const req = {
        params: {
          id: "99",
        },
      };
      const res = crearMockRes();

      mockGetCitaById.mockResolvedValue(null);

      await obtenerCitaPorId(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Cita no encontrada",
      });
    });

    test("debe responder 500 si falla getCitaById", async () => {
      const req = {
        params: {
          id: "1",
        },
      };
      const res = crearMockRes();

      mockGetCitaById.mockRejectedValue(new Error("DB error"));

      await obtenerCitaPorId(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Error obteniendo cita",
      });
    });
  });

  describe("crearNuevaCita", () => {
    test("debe crear cita correctamente", async () => {
      const req = {
        body: {
          id_paciente: "10",
          fecha_cita: "2026-05-29",
          hora_cita: "10:00",
          motivo: "Consulta general",
          notas: "Llegar temprano",
        },
      };
      const res = crearMockRes();

      const nuevaCita = {
        ok: true,
        id_cita: 5,
      };

      mockCrearCita.mockResolvedValue(nuevaCita);

      await crearNuevaCita(req, res);

      expect(mockCrearCita).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        message: "Cita creada correctamente",
        id_cita: 5,
      });
    });

    test("debe responder 400 si falta id_paciente", async () => {
      const req = {
        body: {
          fecha_cita: "2026-05-29",
          hora_cita: "10:00",
        },
      };
      const res = crearMockRes();

      await crearNuevaCita(req, res);

      expect(mockCrearCita).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "id_paciente, fecha_cita y hora_cita son requeridos",
      });
    });

    test("debe responder 400 si falta fecha_cita", async () => {
      const req = {
        body: {
          id_paciente: "10",
          hora_cita: "10:00",
        },
      };
      const res = crearMockRes();

      await crearNuevaCita(req, res);

      expect(mockCrearCita).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "id_paciente, fecha_cita y hora_cita son requeridos",
      });
    });

    test("debe responder 400 si falta hora_cita", async () => {
      const req = {
        body: {
          id_paciente: "10",
          fecha_cita: "2026-05-29",
        },
      };
      const res = crearMockRes();

      await crearNuevaCita(req, res);

      expect(mockCrearCita).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "id_paciente, fecha_cita y hora_cita son requeridos",
      });
    });

    test("debe responder 500 si falla crearCita", async () => {
      const req = {
        body: {
          id_paciente: "10",
          fecha_cita: "2026-05-29",
          hora_cita: "10:00",
        },
      };
      const res = crearMockRes();

      mockCrearCita.mockRejectedValue(new Error("DB error"));

      await crearNuevaCita(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Error creando cita",
      });
    });
  });

  describe("actualizarEstatus", () => {
    test("debe actualizar estatus correctamente", async () => {
      const req = {
        params: {
          id: "5",
        },
        body: {
          estatus_cita: "CONFIRMADA",
        },
      };
      const res = crearMockRes();

      mockActualizarEstatusCita.mockResolvedValue({ ok: true });

      await actualizarEstatus(req, res);

      expect(mockActualizarEstatusCita).toHaveBeenCalledWith("5", "CONFIRMADA");
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        message: "Estatus actualizado correctamente",
      });
    });

    test("debe responder 400 si falta estatus_cita", async () => {
      const req = {
        params: {
          id: "5",
        },
        body: {},
      };
      const res = crearMockRes();

      await actualizarEstatus(req, res);

      expect(mockActualizarEstatusCita).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "El estatus de la cita es requerido",
      });
    });

    test("debe responder 500 si falla actualizarEstatusCita", async () => {
      const req = {
        params: {
          id: "5",
        },
        body: {
          estatus_cita: "CANCELADA",
        },
      };
      const res = crearMockRes();

      mockActualizarEstatusCita.mockRejectedValue(new Error("DB error"));

      await actualizarEstatus(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Error actualizando estatus",
      });
    });
  });

  describe("eliminarCitaController", () => {
    test("debe eliminar cita correctamente", async () => {
      const req = {
        params: {
          id: "7",
        },
      };
      const res = crearMockRes();

      mockEliminarCita.mockResolvedValue({ ok: true });

      await eliminarCitaController(req, res);

      expect(mockEliminarCita).toHaveBeenCalledWith("7");
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        message: "Cita eliminada correctamente",
      });
    });

    test("debe responder 500 si falla eliminarCita", async () => {
      const req = {
        params: {
          id: "7",
        },
      };
      const res = crearMockRes();

      mockEliminarCita.mockRejectedValue(new Error("DB error"));

      await eliminarCitaController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Error eliminando cita",
      });
    });
  });
});