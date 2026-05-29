import React, { useState } from "react";
import "./popupagregarc.css";
import { X } from "lucide-react";

function PopupAgregarCita({
  isOpen,
  onClose,
  selectedDate,
  onSuccess,
}) {
  const [formData, setFormData] = useState({
    id_paciente: "",
    hora_cita: "",
    estatus_cita: "PENDIENTE",
    motivo: "",
    notas: "",
  });

  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState(null);
  const [popupMensaje, setPopupMensaje] = useState("");

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!formData.id_paciente) {
      setPopup("error");
      setPopupMensaje("Debes ingresar el ID del paciente.");
      return;
    }

    if (!formData.hora_cita) {
      setPopup("error");
      setPopupMensaje("Debes seleccionar una hora para la cita.");
      return;
    }

    if (!formData.motivo.trim()) {
      setPopup("error");
      setPopupMensaje("Debes escribir el motivo de la cita.");
      return;
    }

    try {

      setLoading(true);

      const fecha = selectedDate
        .toISOString()
        .split("T")[0];

      const response = await fetch(
        "http://localhost:3001/api/citas",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            ...formData,
            fecha_cita: fecha,
          }),
        }
      );

      const data = await response.json();

      if (data.ok) {

        setPopup("exito");

        setPopupMensaje(
          "La cita fue registrada exitosamente."
        );

        setFormData({
          id_paciente: "",
          hora_cita: "",
          estatus_cita: "PENDIENTE",
          motivo: "",
          notas: "",
        });
      }

    } catch (error) {

      console.error(
        "Error creando cita:",
        error
      );

      setPopup("error");

      setPopupMensaje(
        "No se pudo registrar la cita."
      );

    } finally {

      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">

      <div className="modal-container">

        {/* HEADER */}

        <div className="modal-header">

          <h2>Nueva cita</h2>

          <button
            className="close-btn"
            onClick={onClose}
          >
            <X size={22} />
          </button>

        </div>

        {/* FORM */}

        <form
          className="modal-form"
          onSubmit={handleSubmit}
        >

          {/* PACIENTE */}

          <div className="form-group">
            <label>ID Paciente</label>

            <input
              type="number"
              name="id_paciente"
              value={formData.id_paciente}
              onChange={handleChange}
              required
            />
          </div>

          {/* HORA */}

          <div className="form-group">
            <label>Hora</label>

            <input
              type="time"
              name="hora_cita"
              value={formData.hora_cita}
              onChange={handleChange}
              required
            />
          </div>

          {/* MOTIVO */}

          <div className="form-group">
            <label>Motivo</label>

            <input
              type="text"
              name="motivo"
              value={formData.motivo}
              onChange={handleChange}
            />
          </div>

          {/* NOTAS */}

          <div className="form-group">
            <label>Notas</label>

            <textarea
              name="notas"
              rows="4"
              value={formData.notas}
              onChange={handleChange}
            />
          </div>

          {/* BOTONES */}

          <div className="modal-actions">

            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="save-btn"
              disabled={loading}
            >
              {
                loading
                  ? "Guardando..."
                  : "Guardar cita"
              }
            </button>

          </div>

        </form>

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
                ? "¡Cita registrada!"
                : "Campos incompletos"}
            </h4>

            <p>{popupMensaje}</p>

            <button
              className="med-popup-confirmar"
              onClick={() => {

                setPopup(null);

                if (popup === "exito") {

                  onSuccess();

                  onClose();
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

export default PopupAgregarCita;