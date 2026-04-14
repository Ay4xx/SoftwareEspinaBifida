import React, { useState, useEffect } from "react";
import "./registrocitas.css";
import { CalendarDays } from "lucide-react";

const horas = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00",
];

function getMinDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
}

function RegistrarConsulta() {
  const [medicos, setMedicos] = useState([]);
  const [form, setForm] = useState({
    fecha: getMinDate(), 
    hora: "",
    medico_id: "",
    especialidad: "",
  });

  useEffect(() => {
    fetch("http://localhost:3001/api/medicos")
      .then((r) => r.json())
      .then((res) => {
        const lista = Array.isArray(res.data) ? res.data : []; 
        setMedicos(lista);
      })
      .catch(console.error);
  }, []);

  const handleMedicoChange = (e) => {
    const medicoId = e.target.value;
    const medicoSeleccionado = medicos.find(
      (m) => String(m.MEDICO_ID) === String(medicoId)
    );
    setForm({
      ...form,
      medico_id: medicoId,
      especialidad: medicoSeleccionado ? medicoSeleccionado.ESPECIALIDAD : "",
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    console.log("Consulta registrada:", form);
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
    </div>
  );
}

export default RegistrarConsulta;