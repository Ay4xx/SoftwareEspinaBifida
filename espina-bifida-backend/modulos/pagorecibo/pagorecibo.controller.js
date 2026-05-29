import { guardarPagoService } from "./pagorecibo.service.js";

export async function guardarPago(req, res) {
  try {

    const resultado = await guardarPagoService(req.body);

    res.status(200).json(resultado);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error al guardar pago"
    });
  }
}