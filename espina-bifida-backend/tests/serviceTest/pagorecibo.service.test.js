import { jest } from "@jest/globals";

const executeMock = jest.fn();
const closeMock = jest.fn();
const getConnection = jest.fn();

jest.unstable_mockModule("../../config/db.js", () => ({
  getConnection,
}));

const { guardarPagoService } = await import("../../modulos/pagorecibo/pagorecibo.service.js");

describe("pagorecibo.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getConnection.mockResolvedValue({
      execute: executeMock,
      close: closeMock,
    });
  });

  test("actualiza datos de pago y cierra conexión", async () => {
    const data = {
      eventoId: 15,
      montoPagado: 750,
      metodoPago: "Tarjeta",
      notas: "Pago con descuento",
      descuento: 50,
    };

    const result = await guardarPagoService(data);

    expect(getConnection).toHaveBeenCalledTimes(1);
    expect(executeMock).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE EVENTO_VISITA"),
      {
        montoPagado: 750,
        metodoPago: "Tarjeta",
        notas: "Pago con descuento",
        descuento: 50,
        eventoId: 15,
      },
      { autoCommit: true }
    );
    expect(result).toEqual({ success: true });
    expect(closeMock).toHaveBeenCalledTimes(1);
  });

  test("cierra conexión aunque execute falle", async () => {
    executeMock.mockRejectedValue(new Error("DB error"));

    await expect(
      guardarPagoService({ eventoId: 1, montoPagado: 100, metodoPago: "Efectivo", notas: "", descuento: 0 })
    ).rejects.toThrow("DB error");

    expect(closeMock).toHaveBeenCalledTimes(1);
  });
});
