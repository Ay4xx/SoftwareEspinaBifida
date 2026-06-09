import { jest, describe, test, expect, beforeEach, afterEach } from "@jest/globals";

const mockListen = jest.fn((port, callback) => {
  if (callback) callback();
  return { close: jest.fn() };
});

const mockIniciarJobLimpieza = jest.fn();
const mockDotenvConfig = jest.fn();

jest.unstable_mockModule("dotenv", () => ({
  default: {
    config: mockDotenvConfig,
  },
}));

jest.unstable_mockModule("./app.js", () => ({
  default: {
    listen: mockListen,
  },
}));

jest.unstable_mockModule("./modulos/notificaciones/notificaciones.job.js", () => ({
  iniciarJobLimpieza: mockIniciarJobLimpieza,
}));

describe("index.js", () => {
  const originalLog = console.log;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    console.log = jest.fn();
  });

  afterEach(() => {
    console.log = originalLog;
  });

  test("carga dotenv, inicia el servidor en puerto 3001 y arranca el job", async () => {
    await import("./index.js");

    expect(mockDotenvConfig).toHaveBeenCalledWith(
      expect.objectContaining({ path: expect.stringContaining(".env") })
    );

    expect(mockListen).toHaveBeenCalledWith(3001, expect.any(Function));
    expect(console.log).toHaveBeenCalledWith("Servidor corriendo puerto 3001");
    expect(mockIniciarJobLimpieza).toHaveBeenCalledTimes(1);
  });
});
