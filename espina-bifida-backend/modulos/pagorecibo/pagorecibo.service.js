import { getConnection } from "../../config/db.js";

export async function guardarPagoService(data) {

  let conn;

  try {

    conn = await getConnection();

    await conn.execute(
      `
      UPDATE EVENTO_VISITA
      SET
        MONTO_RECIBIDO = :montoPagado,
        METODO_PAGO = :metodoPago,
        NOTAS = :notas,
        DESCUENTO = :descuento
      WHERE EVENTO_ID = :eventoId
      `,
      {
        montoPagado: data.montoPagado,
        metodoPago: data.metodoPago,
        notas: data.notas,
        descuento: data.descuento,
        eventoId: data.eventoId
      },
      {
        autoCommit: true
      }
    );

    return {
      success: true
    };

  } finally {

    if (conn) {
      await conn.close();
    }
  }
}