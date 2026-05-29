import React, { useState } from "react";

function ModalPago({ data, pacienteId, onClose }) {
  const [form, setForm] = useState({
    metodoPago: "",
    montoAbonado: "",
    notas: "",
  });

  const [popup, setPopup] = useState(null);
  const [popupMensaje, setPopupMensaje] = useState("");

  const descuento =
    form.montoAbonado !== ""
      ? Math.max(
          0,
          data.total - parseFloat(form.montoAbonado || 0)
        )
      : null;

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleGuardarPago = async () => {
    if (!form.metodoPago) {
      setPopup("error");
      setPopupMensaje(
        "Debes seleccionar un método de pago."
      );
      return;
    }

    if (
      !form.montoAbonado ||
      Number(form.montoAbonado) <= 0
    ) {
      setPopup("error");
      setPopupMensaje(
        "Debes ingresar un monto válido."
      );
      return;
    }

    try {
      const body = {
        eventoId: data.eventoId,
        pacienteId,
        montoPagado: Number(form.montoAbonado),
        metodoPago: form.metodoPago,
        notas: form.notas,
        descuento,
      };

      const response = await fetch(
        "http://localhost:3001/api/pagos/guardar",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        throw new Error();
      }

      setPopup("exito");
      setPopupMensaje(
        "El pago fue registrado exitosamente."
      );
    } catch (error) {
      setPopup("error");
      setPopupMensaje(
        "No se pudo guardar el pago."
      );
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={handleBackdropClick}
    >
      <div className="modal-pago">
        <div className="modal-header">
          <div>
            <h2 className="modal-titulo">
              Realizar Pago
            </h2>

            <p className="modal-subtitulo">
              Visita del {data.fecha} · Total:{" "}
              <strong>
                ${data.total.toLocaleString("es-MX")}
              </strong>
            </p>
          </div>

          <button
            className="modal-close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-field">
            <label>Método de pago</label>

            <select
              name="metodoPago"
              value={form.metodoPago}
              onChange={handleChange}
            >
              <option value="">
                — Seleccionar —
              </option>

              <option value="efectivo">
                Efectivo
              </option>

              <option value="tarjeta_debito">
                Tarjeta de débito
              </option>

              <option value="tarjeta_credito">
                Tarjeta de crédito
              </option>

              <option value="transferencia">
                Transferencia / SPEI
              </option>

              <option value="cheque">
                Cheque
              </option>
            </select>
          </div>

          <div className="modal-row">
            <div className="modal-field">
              <label>Monto abonado ($)</label>

              <input
                type="number"
                name="montoAbonado"
                placeholder={`Máx. ${data.total.toLocaleString(
                  "es-MX"
                )}`}
                min="0"
                max={data.total}
                value={form.montoAbonado}
                onChange={handleChange}
              />
            </div>

            <div className="modal-field">
              <label>Monto Restante ($)</label>

              <input
                type="text"
                readOnly
                value={
                  descuento !== null
                    ? `$${descuento.toLocaleString(
                        "es-MX"
                      )}`
                    : "—"
                }
                className="input-readonly"
              />
            </div>
          </div>

          <div className="modal-field">
            <label>Notas</label>

            <textarea
              name="notas"
              rows={3}
              placeholder="Observaciones sobre el pago…"
              value={form.notas}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="btn-cancelar"
            onClick={onClose}
          >
            Cancelar
          </button>

          <button
            className="btn-guardar"
            onClick={handleGuardarPago}
          >
            Guardar pago
          </button>
        </div>
      </div>

      {popup && (
        <div
          className="med-overlay"
          onClick={() => setPopup(null)}
        >
          <div
            className="med-popup-msg"
            onClick={(e) => e.stopPropagation()}
          >
            <h4>
              {popup === "exito"
                ? "¡Pago registrado!"
                : "Campos incompletos"}
            </h4>

            <p>{popupMensaje}</p>

            <button
              className="med-popup-confirmar"
              onClick={() => {
                setPopup(null);

                if (popup === "exito") {
                  window.location.reload();
                }
              }}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ModalPago;
