import React, { useState } from "react";
import html2pdf from "html2pdf.js";
import { calcularTotal } from "./helper";

function parseFechaES(fechaStr) {
  const [d, m, y] = fechaStr.split("/").map(Number);
  return { day: d, month: m, year: y };
}

function CalendarioRecibo({ visitas, fechaSeleccionada, onSelect }) {
  const MESES = [
    "Enero","Febrero","Marzo","Abril","Mayo","Junio",
    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
  ];

  const DIAS = ["Lu","Ma","Mi","Ju","Vi","Sá","Do"];

  const fechasConVisita = new Set(
    visitas.map(v => {
      const p = parseFechaES(v.fecha);
      return `${p.day}-${p.month}-${p.year}`;
    })
  );

  const primeraVisita =
    visitas.length > 0
      ? parseFechaES(visitas[0].fecha)
      : null;

  const hoy = new Date();

  const [viewMonth, setViewMonth] = useState(
    primeraVisita ? primeraVisita.month - 1 : hoy.getMonth()
  );

  const [viewYear, setViewYear] = useState(
    primeraVisita ? primeraVisita.year : hoy.getFullYear()
  );

  const prevMes = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const nextMes = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  const primerDia = new Date(viewYear, viewMonth, 1).getDay();
  const offset = (primerDia + 6) % 7;
  const diasEnMes = new Date(viewYear, viewMonth + 1, 0).getDate();

  const celdas = [];

  for (let i = 0; i < offset; i++) {
    celdas.push(null);
  }

  for (let d = 1; d <= diasEnMes; d++) {
    celdas.push(d);
  }

  const tieneVisita = (day) =>
    fechasConVisita.has(`${day}-${viewMonth + 1}-${viewYear}`);

  const estaSeleccionado = (day) => {
    if (!fechaSeleccionada) return false;

    const p = parseFechaES(fechaSeleccionada);

    return (
      p.day === day &&
      p.month === viewMonth + 1 &&
      p.year === viewYear
    );
  };

  const handleDayClick = (day) => {
    if (!tieneVisita(day)) return;

    onSelect(`${day}/${viewMonth + 1}/${viewYear}`);
  };

  return (
    <div className="cal-wrapper">
      <div className="cal-nav">
        <button className="cal-nav-btn" onClick={prevMes}>
          ‹
        </button>

        <span className="cal-mes-label">
          {MESES[viewMonth]} {viewYear}
        </span>

        <button className="cal-nav-btn" onClick={nextMes}>
          ›
        </button>
      </div>

      <div className="cal-grid">
        {DIAS.map((d) => (
          <div key={d} className="cal-dia-header">
            {d}
          </div>
        ))}

        {celdas.map((day, i) => {
          if (!day) {
            return <div key={`empty-${i}`} />;
          }

          const activo = tieneVisita(day);
          const selected = estaSeleccionado(day);

          return (
            <button
              key={day}
              className={`cal-dia ${
                activo ? "cal-dia--activo" : "cal-dia--disabled"
              } ${
                selected ? "cal-dia--selected" : ""
              }`}
              onClick={() => handleDayClick(day)}
              disabled={!activo}
            >
              {day}
              {activo && <span className="cal-dot" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ModalGenerarRecibo({ visitas, pacienteId, onClose }) {
  const [fechaSeleccionada, setFechaSeleccionada] = useState("");
  const [generando, setGenerando] = useState(false);

  const visitaSeleccionada =
    visitas.find(v => v.fecha === fechaSeleccionada);

  const handleGenerar = () => {
    if (!visitaSeleccionada) return;
    setGenerando(true);

    const total = calcularTotal(visitaSeleccionada);
    const montoPagado = visitaSeleccionada.montoRecibido ?? 0; // ← ajusta el nombre del campo
    const diferencia = montoPagado - total;

    const filas = [
      ...visitaSeleccionada.servicios.map(s => ({ tipo: "Servicio", ...s })),
      ...visitaSeleccionada.medicamentos.map(m => ({ tipo: "Medicamento", ...m })),
      ...visitaSeleccionada.equipo.map(e => ({ tipo: "Equipo", ...e })),
    ];

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 32px; max-width: 600px; margin: auto; color: #1e293b;">
        <h1>Recibo de visita</h1>
        <p>Paciente ID: ${pacienteId}</p>
        <p>Fecha: ${visitaSeleccionada.fecha}</p>

        <table style="width:100%; border-collapse:collapse;">
          <thead>
            <tr>
              <th style="text-align:left; border-bottom:1px solid #e2e8f0; padding:8px;">Tipo</th>
              <th style="text-align:left; border-bottom:1px solid #e2e8f0; padding:8px;">Concepto</th>
              <th style="text-align:right; border-bottom:1px solid #e2e8f0; padding:8px;">Precio</th>
            </tr>
          </thead>
          <tbody>
            ${filas.map(f => `
              <tr>
                <td style="padding:8px;">${f.tipo}</td>
                <td style="padding:8px;">${f.nombre}</td>
                <td style="padding:8px; text-align:right;">$${f.precio.toLocaleString("es-MX")}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <div style="margin-top:16px; border-top:2px solid #e2e8f0; padding-top:12px;">
          <p style="display:flex; justify-content:space-between;">
            <span>Subtotal esperado:</span>
            <strong>$${total.toLocaleString("es-MX")}</strong>
          </p>
          <p style="display:flex; justify-content:space-between;">
            <span>Monto recibido:</span>
            <strong>$${montoPagado.toLocaleString("es-MX")}</strong>
          </p>
          ${diferencia !== 0 ? `
          <p style="display:flex; justify-content:space-between;">
            <span>${diferencia < 0 ? 'Saldo pendiente' : 'Cambio'}:</span>
            <strong>$${Math.abs(diferencia).toLocaleString("es-MX")}</strong>
          </p>` : ''}
        </div>
      </div>
    `;

    const elemento = document.createElement("div");
    elemento.innerHTML = html;
    document.body.appendChild(elemento);

    const opt = {
      margin: 10,
      filename: `recibo_${pacienteId}_${visitaSeleccionada.fecha.replace(/\//g, "-")}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
    };

    html2pdf()
      .set(opt)
      .from(elemento)
      .save()
      .then(() => {
        document.body.removeChild(elemento);
        setGenerando(false);
        onClose();
      });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-pago" style={{ maxWidth: 440 }}>
        <div className="modal-header">
          <div>
            <h2 className="modal-titulo">Generar recibo</h2>

            <p className="modal-subtitulo">
              {fechaSeleccionada
                ? `Visita seleccionada: ${fechaSeleccionada}`
                : "Selecciona una fecha con visita"}
            </p>
          </div>

          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <CalendarioRecibo
            visitas={visitas}
            fechaSeleccionada={fechaSeleccionada}
            onSelect={setFechaSeleccionada}
          />

          {visitaSeleccionada && (
            <div className="recibo-preview">
              <p className="recibo-preview-titulo">
                Resumen de la visita
              </p>

              <ul className="recibo-preview-lista">
                {[
                  ...visitaSeleccionada.servicios.map(s => ({
                    label: s.nombre,
                    precio: s.precio,
                  })),
                  ...visitaSeleccionada.medicamentos.map(m => ({
                    label: m.nombre,
                    precio: m.precio,
                  })),
                  ...visitaSeleccionada.equipo.map(e => ({
                    label: e.nombre,
                    precio: e.precio,
                  })),
                ].map((item, i) => (
                  <li key={i}>
                    <span className="recibo-item-nombre">
                      {item.label}
                    </span>

                    <span className="recibo-item-precio">
                      ${item.precio.toLocaleString("es-MX")}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="recibo-preview-total">
                <span>Total</span>

                <strong>
                  $
                  {calcularTotal(visitaSeleccionada).toLocaleString(
                    "es-MX"
                  )}
                </strong>
              </div>
            </div>
          )}
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
            onClick={handleGenerar}
            disabled={!fechaSeleccionada || generando}
          >
            {generando
              ? "Generando…"
              : "Generar PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalGenerarRecibo;