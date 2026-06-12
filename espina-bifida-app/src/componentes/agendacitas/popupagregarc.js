import React, { useState, useEffect, useRef } from "react";
import "./popupagregarc.css";
import { X } from "lucide-react";
import API_BASE from "../../config.js";

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
  const [searchPaciente, setSearchPaciente] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    };

    const resetForm = () => {
    setFormData({
      id_paciente: "",
      hora_cita: "",
      estatus_cita: "PENDIENTE",
      motivo: "",
      notas: "",
    });

    setSearchPaciente("");
    setSearchResults([]);
    setIsSearching(false);
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    // Try to resolve patient id from the typed search text if not selected
    let idToUse = formData.id_paciente;
    if (!idToUse && searchPaciente) {
      const m = searchPaciente.match(/\((\d+)\)\s*$/);
      if (m) idToUse = m[1];
      else if (/^\d+$/.test(searchPaciente.trim())) idToUse = searchPaciente.trim();
    }

    if (!idToUse) {
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

      const response = await fetch(`${API_BASE}/api/citas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          id_paciente: idToUse,
          fecha_cita: fecha,
        }),
      });

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

        setSearchPaciente("");
        setSearchResults([]);
        setIsSearching(false);
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
            onClick={() => {
              resetForm();
              onClose();
            }}
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
            <label>Paciente</label>

            <input
              type="text"
              name="id_paciente"
              placeholder="ID o nombre del paciente"
              value={searchPaciente || formData.id_paciente}
              onChange={(e) => {
                const v = e.target.value;
                setSearchPaciente(v);

                // If input is only digits, treat as ID
                if (/^\d+$/.test(v.trim())) {
                  handleChange({ target: { name: "id_paciente", value: v.trim() } });
                  setSearchResults([]);
                  setIsSearching(false);
                } else {
                  // clear id while user types a name
                  handleChange({ target: { name: "id_paciente", value: "" } });

                  // debounce search
                  if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
                  if (v.trim()) {
                    setIsSearching(true);
                    searchTimeoutRef.current = setTimeout(async () => {
                      try {
                        const resp = await fetch(`${API_BASE}/api/pacientes/cards?search=${encodeURIComponent(v.trim())}`);
                        const json = await resp.json();
                        if (json.ok && Array.isArray(json.data)) {
                          setSearchResults(json.data);
                        } else {
                          setSearchResults([]);
                        }
                      } catch (err) {
                        console.error("Error buscando pacientes:", err);
                        setSearchResults([]);
                      }
                    }, 300);
                  } else {
                    setSearchResults([]);
                    setIsSearching(false);
                  }
                }
              }}
              required
            />

            {searchResults && searchResults.length > 0 && (
              <ul className="paciente-search-results">
                {searchResults.map((p) => (
                  <li
                    key={p.id}
                    className="paciente-search-item"
                    onClick={() => {
                      const display = `${p.nombre} ${p.apellido} (${p.id})`;
                      setSearchPaciente(display);
                      handleChange({
                        target: {
                          name: "id_paciente",
                          value: String(p.id),
                        },
                      });
                      setSearchResults([]);
                      setIsSearching(false);
                    }}
                  >
                    <div className="paciente-nombre">
                      {p.nombre} {p.apellido}
                    </div>

                    <div className="paciente-id">
                      ID #{p.id}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {isSearching && searchPaciente &&
            searchResults.length === 0 && (
              <div className="paciente-no-results">
                No se encontraron pacientes
              </div>
            )}
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
              onClick={() => {
                resetForm();
                onClose();
              }}
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
        <div className="med-overlay">

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