import { jest, describe, beforeEach, afterEach, test, expect } from "@jest/globals";

const mockEliminarNotificacionesAntiguas = jest.fn();

jest.unstable_mockModule("../../modulos/notificaciones/notificaciones.service.js", () => ({
  eliminarNotificacionesAntiguas: mockEliminarNotificacionesAntiguas,
}));

const { iniciarJobLimpieza } = await import("../../modulos/notificaciones/notificaciones.job.js");

describe("notificaciones.job.js", () => {
  let consoleLogSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  test("ejecuta limpieza inicial al arrancar el job", async () => {
    mockEliminarNotificacionesAntiguas.mockResolvedValue(0);

    iniciarJobLimpieza();

    await Promise.resolve();

    expect(mockEliminarNotificacionesAntiguas).toHaveBeenCalledTimes(1);
  });

  test("programa limpieza periódica cada 24 horas", async () => {
    mockEliminarNotificacionesAntiguas.mockResolvedValue(0);

    iniciarJobLimpieza();

    await Promise.resolve();

    expect(mockEliminarNotificacionesAntiguas).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(24 * 60 * 60 * 1000);

    await Promise.resolve();

    expect(mockEliminarNotificacionesAntiguas).toHaveBeenCalledTimes(2);
  });

  test("muestra mensaje de inicio del job", () => {
    mockEliminarNotificacionesAntiguas.mockResolvedValue(0);

    iniciarJobLimpieza();

    expect(consoleLogSpy).toHaveBeenCalledWith(
      "Limpieza automática de notificaciones iniciada"
    );
  });

  test("captura error de limpieza inicial", async () => {
    const error = new Error("Error inicial");

    mockEliminarNotificacionesAntiguas.mockRejectedValueOnce(error);

    iniciarJobLimpieza();

    await Promise.resolve();
    await Promise.resolve();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      " Error en limpieza inicial:",
      error
    );
  });

  test("captura error de limpieza periódica", async () => {
    const error = new Error("Error periódico");

    mockEliminarNotificacionesAntiguas
      .mockResolvedValueOnce(0)
      .mockRejectedValueOnce(error);

    iniciarJobLimpieza();

    await Promise.resolve();

    jest.advanceTimersByTime(24 * 60 * 60 * 1000);

    await Promise.resolve();
    await Promise.resolve();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error en limpieza periódica:",
      error
    );
  });
});