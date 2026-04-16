import { useParams } from "react-router-dom";
import "./historial.css";
import React, { useEffect, useState } from "react";
import html2pdf from "html2pdf.js";

function VisualizarHistorial() {
  const { pacienteId } = useParams();
  const [data, setData] = useState({});
  const exportarPDF = () => {
    const element = document.querySelector(".card-historial");

    const opt = {
      margin: 10,
      filename: `historial_paciente_${pacienteId}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    };

    html2pdf().set(opt).from(element).save();
  };

  useEffect(() => {
    fetch(`http://localhost:3001/api/historial/${pacienteId}`)
      .then(res => res.json())
      .then(rows => {
        setData(transformarDatos(rows));
      })
      .catch(err => console.error(err));
  }, [pacienteId]);

  const years = Object.keys(data).sort((a, b) => b - a);

  return (
    <div className="card-historial">
      <div className="historial-header">
        <h3>Historial de servicios</h3>
        <button className="btn-pdf" onClick={exportarPDF}>
          Exportar PDF
        </button>
      </div>

      {years.map((year) => (
        <div key={year}>
          <h4 className="year">{year}</h4>

          <div className="timeline">
            {data[year].map((visita, i) => (
              <div key={i} className="timeline-item">
                <div className="contenido">
                  <p className="fecha">{visita.fecha}</p>

                  <ul className="lista">
                    {visita.servicios.map((s, idx) => (
                      <ItemRow key={idx} nombre={s.nombre} precio={s.precio} badgeClass="badge-servicio" badgeLabel="Servicio" />
                    ))}
                    {visita.medicamentos.map((m, idx) => (
                      <ItemRow key={idx} nombre={m.nombre} precio={m.precio} badgeClass="badge-medicamento" badgeLabel="Medicamento" />
                    ))}
                    {visita.equipo.map((e, idx) => (
                      <ItemRow key={idx} nombre={e.nombre} precio={e.precio} badgeClass="badge-equipo" badgeLabel="Equipo" />
                    ))}
                  </ul>

                  <hr className="divider" />

                  <p className="total">
                    Total
                    <strong>
                      ${calcularTotal(visita).toLocaleString("es-MX")}
                    </strong>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function transformarDatos(rows) {
  const resultado = {};

  rows.forEach(item => {
    const fecha = new Date(item.FECHA_EVENTO);
    const year = fecha.getFullYear();

    if (!resultado[year]) resultado[year] = [];

    let visita = resultado[year].find(
      v => v.fecha === fecha.toLocaleDateString("es-MX")
    );

    if (!visita) {
      visita = {
        fecha: fecha.toLocaleDateString("es-MX"),
        servicios: [],
        medicamentos: [],
        equipo: []
      };
      resultado[year].push(visita);
    }

    const registro = {
      nombre: item.NOMBRE,
      precio: item.PRECIO
    };

    if (item.TIPO === "servicio") visita.servicios.push(registro);
    if (item.TIPO === "medicamento") visita.medicamentos.push(registro);
    if (item.TIPO === "equipo") visita.equipo.push(registro);
  });

  return resultado;
}

function calcularTotal(visita) {
  const suma = (arr) => arr.reduce((acc, item) => acc + item.precio, 0);
  return suma(visita.servicios) + suma(visita.medicamentos) + suma(visita.equipo);
}

function ItemRow({ nombre, precio, badgeClass, badgeLabel }) {
  return (
    <li>
      <div className="item-left">
        <span className={`badge ${badgeClass}`}>{badgeLabel}</span>
        {nombre}
      </div>
      <span className="item-price">${precio.toLocaleString("es-MX")}</span>
    </li>
  );
}


export default VisualizarHistorial;