import { jest } from "@jest/globals";

const guardarPagoService = jest.fn();

jest.unstable_mockModule("../../modulos/pagorecibo/pagorecibo.service.js", () => ({
  guardarPagoService,
}));

const { guardarPago } = await import("../../modulos/pagorecibo/pagorecibo.controller.js");

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("pagorecibo.controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  test("guarda pago y responde 200", async () => {
    const body = {
      eventoId: 1,
      montoPagado: 500,
      metodoPago: "Efectivo",
      notas: "Pago completo",
      descuento: 0,
    };
    guardarPagoService.mockResolvedValue({ success: true });

    const req = { body };
    const res = mockResponse();

    await guardarPago(req, res);

    expect(guardarPagoService).toHaveBeenCalledWith(body);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  test("responde 500 si el servicio falla", async () => {
    guardarPagoService.mockRejectedValue(new Error("DB error"));

    const req = { body: { eventoId: 1 } };
    const res = mockResponse();

    await guardarPago(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Error al guardar pago" });
  });
});
