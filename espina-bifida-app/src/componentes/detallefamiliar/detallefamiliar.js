import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API_BASE from "../../config.js";
import "./detallefamiliar.css";

function VisualizarFamiliar() {
  const { pacienteId } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/familiar/${pacienteId}`)
      .then(res => res.json())
      .then(rows => {
        setData(rows[0]);
      })
      .catch(err => console.error(err));
  }, [pacienteId]);


  if (!data) return <p>Cargando...</p>;

  return (
    <div className="card-familiar">
      <div className="fam-header">
        <h3>Información Familiar</h3>
      </div>

      <div className="padres-container">
        <div className="section-card">
          <h4>Padre</h4>
          <div className="field-row"><span className="field-label">Edad</span><span className="field-value">{data.PADRE_EDAD}</span></div>
          <div className="field-row"><span className="field-label">Escolaridad</span><span className="field-value">{data.PADRE_ESCOLARIDAD}</span></div>
          <div className="field-row"><span className="field-label">Ocupación</span><span className="field-value">{data.PADRE_OCUPACION}</span></div>
          <div className="field-row"><span className="field-label">Lugar nacimiento</span><span className="field-value">{data.PADRE_LUGAR_NACIMIENTO}</span></div>
          <div className="field-row"><span className="field-label">Seguro</span><span className="field-value">{data.PADRE_SEGURO}</span></div>
        </div>

        <div className="section-card">
          <h4>Madre</h4>
          <div className="field-row"><span className="field-label">Edad</span><span className="field-value">{data.MADRE_EDAD}</span></div>
          <div className="field-row"><span className="field-label">Escolaridad</span><span className="field-value">{data.MADRE_ESCOLARIDAD}</span></div>
          <div className="field-row"><span className="field-label">Ocupación</span><span className="field-value">{data.MADRE_OCUPACION}</span></div>
          <div className="field-row"><span className="field-label">Lugar nacimiento</span><span className="field-value">{data.MADRE_LUGAR_NACIMIENTO}</span></div>
          <div className="field-row"><span className="field-label">Seguro</span><span className="field-value">{data.MADRE_SEGURO}</span></div>
          <div className="field-row"><span className="field-label">Ácido fólico</span><span className="field-value">{data.ACIDO_FOLICO}</span></div>
          <div className="field-row"><span className="field-label">Citas control</span><span className="field-value">{data.CITAS_CONTROL}</span></div>
        </div>
      </div>

      <div className="section-card antecedentes-card">
        <h4>Antecedentes</h4>
        <div className="field-row"><span className="field-label">Adicciones</span><span className="field-value">{data.ADICCIONES}</span></div>
        <div className="field-row"><span className="field-label">Hijo DTN</span><span className="field-value">{data.HIJO_DTN}</span></div>
        <div className="field-row"><span className="field-label">Familiar DTN</span><span className="field-value">{data.FAMILIAR_DTN}</span></div>
        <div className="field-row"><span className="field-label">Exposición tóxicos</span><span className="field-value">{data.EXPO_TOXICOS}</span></div>
        <div className="field-row"><span className="field-label">Descripción</span><span className="field-value">{data.DESCRIPCION_EXPO_TOXICOS}</span></div>
      </div>
    </div>
  );
}

export default VisualizarFamiliar;