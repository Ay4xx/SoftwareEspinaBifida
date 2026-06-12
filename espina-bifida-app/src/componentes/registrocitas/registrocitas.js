import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./registrocitas.css";
import { CalendarDays } from "lucide-react";
import API_BASE from "../../config.js";

const horas = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00",
];

function getMinDate() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function RegistrarConsulta() {
  const { pacienteId } = useParams();
  const [medicos, setMedicos] = useState([]);
  const [popup, setPopup] = useState(null); // 'exito' | 'error' | 'vacio'
  const [form, setForm] = useState({
    fecha: getMinDate(),
    hora: "",
    medico_id: "",
    especialidad: "",
    servicio_id: "",
    cuota: 0,
  });

  useEffect(() => {
    fetch(`${API_BASE}/api/medicos`)
      .then((r) => r.json())
      .then((res) => setMedicos(Array.isArray(res.data) ? res.data : []))
      .catch(console.error);
  }, []);

  const handleMedicoChange = (e) => {
    const medicoId = e.target.value;
  
    const medicoSeleccionado = medicos.find(
      (m) => String(m.MEDICO_ID) === String(medicoId)
    );
  
    setForm(prev => ({
      ...prev,
      medico_id: medicoId,
      especialidad: medicoSeleccionado?.ESPECIALIDAD || "",
      servicio_id: medicoSeleccionado?.SERVICIO_ID || "",
      cuota: medicoSeleccionado?.COSTO|| "",
    }));
  };
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    console.log("handleSubmit ejecutado");

    const { fecha, hora, medico_id, servicio_id, cuota } = form;
    console.log("Valores del formulario:", form); //  log en navegador
  
    if (!fecha || !hora || !medico_id || !servicio_id) {
      setPopup("vacio");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/medicos/guardar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pacienteId,
          fechaEvento: fecha,
          cuota: cuota,
          servicioId: servicio_id,
          horaCita: hora,
        }),
        
      });

      const data = await response.json();
      if (data.ok) {
        setPopup("exito");
        setForm({ fecha: getMinDate(), hora: "", medico_id: "", especialidad: "", servicio_id: "", cuota:0 });
      } else {
        setPopup("error");
      }
    } catch (error) {
      console.error(error);
      setPopup("error");
    }
  };

  return (
    <div className="consulta-wrapper">
      <div className="consulta-card">
        <h3 className="consulta-title">
          <CalendarDays size={18} /> Registrar Consulta
        </h3>

        <div className="consulta-row">
          <div className="consulta-field">
            <label>Fecha de Visita</label>
            <input
              type="date"
              name="fecha"
              min={getMinDate()}
              value={form.fecha}
              onChange={handleChange}
            />
          </div>

          <div className="consulta-field">
            <label>Hora</label>
            <select name="hora" value={form.hora} onChange={handleChange}>
              <option value="">Seleccionar</option>
              {horas.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="consulta-row">
          <div className="consulta-field">
            <label>Médico</label>
            <select name="medico_id" value={form.medico_id} onChange={handleMedicoChange}>
              <option value="">Seleccionar</option>
              {medicos.map((m) => (
                <option key={m.MEDICO_ID} value={m.MEDICO_ID}>
                  {m.NOMBRE} {m.APELLIDO}
                </option>
              ))}
            </select>
          </div>

          <div className="consulta-field">
            <label>Especialidad</label>
            <input
              type="text"
              value={form.especialidad}
              readOnly
              placeholder=""
            />
          </div>
        </div>

        <button className="consulta-btn" onClick={handleSubmit}>
          Registrar Consulta
        </button>
      </div>

      {/* Popup éxito */}
      {popup === "exito" && (
        <div className="consulta-overlay" onClick={() => setPopup(null)}>
          <div className="consulta-popup-msg" onClick={(e) => e.stopPropagation()}>
            <div className="consulta-popup-icon"></div>
            <h4>Consulta registrada</h4>
            <p>La consulta fue guardada exitosamente.</p>
            <button className="consulta-popup-btn" onClick={() => setPopup(null)}>
              Aceptar
            </button>
          </div>
        </div>
      )}

      {/* Popup vacío */}
      {popup === "vacio" && (
        <div className="consulta-overlay" onClick={() => setPopup(null)}>
          <div className="consulta-popup-msg" onClick={(e) => e.stopPropagation()}>
            <div className="consulta-popup-icon"></div>
            <h4>Datos incompletos</h4>
            <p>Debes seleccionar fecha, hora y médico antes de registrar.</p>
            <button className="consulta-popup-btn" onClick={() => setPopup(null)}>
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Popup error */}
      {popup === "error" && (
        <div className="consulta-overlay" onClick={() => setPopup(null)}>
          <div className="consulta-popup-msg" onClick={(e) => e.stopPropagation()}>
            <div className="consulta-popup-icon"></div>
            <h4>Error</h4>
            <p>No se pudo registrar la consulta. Intenta de nuevo.</p>
            <button className="consulta-popup-btn" onClick={() => setPopup(null)}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RegistrarConsulta;