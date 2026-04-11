import React from "react";
import "./historial.css";

const data = {
  2025: [
    {
      fecha: "10 enero 2025",
      servicios: [{ nombre: "Consulta médica", precio: 500 },{ nombre: "Consulta médica 2", precio: 500 }],
      medicamentos: [{ nombre: "Ibuprofeno", precio: 120 }],
      equipo: [{ nombre: "Muletas", precio: 800 }],
    },
  ],
  2024: [
    {
      fecha: "20 agosto 2024",
      servicios: [{ nombre: "Rehabilitación", precio: 300 }],
      medicamentos: [{ nombre: "Ibuprofeno", precio: 120 },{ nombre: "Paracetamol", precio: 150 }],
      equipo: [],
    },
  ],
};

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

function VisualizarHistorial() {
  const years = Object.keys(data).sort((a, b) => b - a);

  return (
    <div className="card-historial">
      <div className="historial-header">
        <h3>Historial de servicios</h3>
        <button className="btn-pdf">Exportar PDF</button>
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
                      <ItemRow
                        key={idx}
                        nombre={s.nombre}
                        precio={s.precio}
                        badgeClass="badge-servicio"
                        badgeLabel="Servicio"
                      />
                    ))}
                    {visita.medicamentos.map((m, idx) => (
                      <ItemRow
                        key={idx}
                        nombre={m.nombre}
                        precio={m.precio}
                        badgeClass="badge-medicamento"
                        badgeLabel="Medicamento"
                      />
                    ))}
                    {visita.equipo.map((e, idx) => (
                      <ItemRow
                        key={idx}
                        nombre={e.nombre}
                        precio={e.precio}
                        badgeClass="badge-equipo"
                        badgeLabel="Equipo"
                      />
                    ))}
                  </ul>

                  <hr className="divider" />

                  <p className="total">
                    Total
                    <strong>${calcularTotal(visita).toLocaleString("es-MX")}</strong>
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

export default VisualizarHistorial;