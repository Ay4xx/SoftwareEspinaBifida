import { useParams } from "react-router-dom";
import "./historial.css";
import React, { useEffect, useState } from "react";
import html2pdf from "html2pdf.js";

function VisualizarHistorial() {
  const { pacienteId } = useParams();
  const [data, setData] = useState({});
  const [modalData, setModalData] = useState(null);       // modal modificar pago
  const [reciboModal, setReciboModal] = useState(false);  // modal seleccionar fecha recibo

  useEffect(() => {
    fetch(`http://localhost:3001/api/historial/${pacienteId}`)
      .then(res => res.json())
      .then(rows => setData(transformarDatos(rows)))
      .catch(err => console.error(err));
  }, [pacienteId]);

  const years = Object.keys(data).sort((a, b) => b - a);

  // Lista plana de todas las visitas para el selector de fechas
  const todasLasVisitas = years.flatMap(year =>
    data[year].map(v => ({ ...v, year }))
  );

  const abrirModal = (visita, year) => {
    setModalData({
      eventoId: visita.eventoId,
      fecha: visita.fecha,
      year,
      total: calcularTotal(visita),
      servicios: visita.servicios,
      medicamentos: visita.medicamentos,
      equipo: visita.equipo,
    });
  };

  return (
    <>
      <div className="card-historial">
        <div className="historial-header">
          <h3>Historial de servicios</h3>
          <button className="btn-pdf" onClick={() => setReciboModal(true)}>
            Generar recibo
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
                        <ItemRow key={idx} nombre={s.nombre} cantidad={s.cantidad} precio={s.precio} badgeClass="badge-servicio" badgeLabel="Servicio" />
                      ))}
                      {visita.medicamentos.map((m, idx) => (
                        <ItemRow key={idx} nombre={m.nombre} cantidad={m.cantidad} precio={m.precio} badgeClass="badge-medicamento" badgeLabel="Medicamento" />
                      ))}
                      {visita.equipo.map((e, idx) => (
                        <ItemRow key={idx} nombre={e.nombre} cantidad={e.cantidad} precio={e.precio} badgeClass="badge-equipo" badgeLabel="Equipo" />
                      ))}
                    </ul>
                    <hr className="divider" />
                    <div className="footer-visita">
                      <p className="total">
                        Total
                        <strong>${calcularTotal(visita).toLocaleString("es-MX")}</strong>
                      </p>
                      {!visita.montoRecibido ? (
                        <button
                          className="btn-modificar-pago"
                          onClick={() => abrirModal(visita, year)}
                        >
                          Realizar pago
                        </button>
                      ) : (
                        <p className="monto-pagado-real">
                          Pagado: <strong>
                            ${Number(visita.montoRecibido).toLocaleString("es-MX")}
                          </strong>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {modalData && (
        <ModalPago
          data={modalData}
          pacienteId={pacienteId}
          onClose={() => setModalData(null)}
        />
      )}

      {reciboModal && (
        <ModalGenerarRecibo
          visitas={todasLasVisitas}
          pacienteId={pacienteId}
          onClose={() => setReciboModal(false)}
        />
      )}
    </>
  );
}

/* ─── Modal: Seleccionar fecha para generar recibo ──────────────────── */

// Convierte "26/5/2026" → { day:26, month:5, year:2026 }
function parseFechaES(fechaStr) {
  const [d, m, y] = fechaStr.split("/").map(Number);
  return { day: d, month: m, year: y };
}

function CalendarioRecibo({ visitas, fechaSeleccionada, onSelect }) {
  const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio",
                 "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const DIAS  = ["Lu","Ma","Mi","Ju","Vi","Sá","Do"];

  // Construir Set de fechas con visita: "día-mes-año"
  const fechasConVisita = new Set(
    visitas.map(v => {
      const p = parseFechaES(v.fecha);
      return `${p.day}-${p.month}-${p.year}`;
    })
  );

  // Mes/año inicial: el más reciente con visita
  const primeraVisita = visitas.length > 0 ? parseFechaES(visitas[0].fecha) : null;
  const hoy = new Date();
  const [viewMonth, setViewMonth] = useState(primeraVisita ? primeraVisita.month - 1 : hoy.getMonth());
  const [viewYear,  setViewYear]  = useState(primeraVisita ? primeraVisita.year  : hoy.getFullYear());

  const prevMes = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMes = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  // Días del mes
  const primerDia = new Date(viewYear, viewMonth, 1).getDay(); // 0=Dom
  const offset    = (primerDia + 6) % 7; // lunes como primer día
  const diasEnMes = new Date(viewYear, viewMonth + 1, 0).getDate();

  const celdas = [];
  for (let i = 0; i < offset; i++) celdas.push(null);
  for (let d = 1; d <= diasEnMes; d++) celdas.push(d);

  const tieneVisita = (day) =>
    fechasConVisita.has(`${day}-${viewMonth + 1}-${viewYear}`);

  const estaSeleccionado = (day) => {
    if (!fechaSeleccionada) return false;
    const p = parseFechaES(fechaSeleccionada);
    return p.day === day && p.month === viewMonth + 1 && p.year === viewYear;
  };

  const handleDayClick = (day) => {
    if (!tieneVisita(day)) return;
    const fechaStr = `${day}/${viewMonth + 1}/${viewYear}`;
    onSelect(fechaStr);
  };

  return (
    <div className="cal-wrapper">
      <div className="cal-nav">
        <button className="cal-nav-btn" onClick={prevMes}>‹</button>
        <span className="cal-mes-label">{MESES[viewMonth]} {viewYear}</span>
        <button className="cal-nav-btn" onClick={nextMes}>›</button>
      </div>

      <div className="cal-grid">
        {DIAS.map(d => (
          <div key={d} className="cal-dia-header">{d}</div>
        ))}
        {celdas.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const activo    = tieneVisita(day);
          const selected  = estaSeleccionado(day);
          return (
            <button
              key={day}
              className={`cal-dia ${activo ? "cal-dia--activo" : "cal-dia--disabled"} ${selected ? "cal-dia--selected" : ""}`}
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

  const visitaSeleccionada = visitas.find(v => v.fecha === fechaSeleccionada);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleGenerar = () => {
    if (!visitaSeleccionada) return;
    setGenerando(true);

    const total = calcularTotal(visitaSeleccionada);
    const filas = [
      ...visitaSeleccionada.servicios.map(s => ({ tipo: "Servicio", ...s })),
      ...visitaSeleccionada.medicamentos.map(m => ({ tipo: "Medicamento", ...m })),
      ...visitaSeleccionada.equipo.map(e => ({ tipo: "Equipo", ...e })),
    ];

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 32px; max-width: 600px; margin: auto; color: #1e293b;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px;">
          <div>
            <h1 style="margin:0; font-size:22px; color:#0f172a;">Recibo de visita</h1>
            <p style="margin:4px 0 0; color:#64748b; font-size:13px;">Paciente ID: ${pacienteId}</p>
          </div>
          <div style="text-align:right;">
            <p style="margin:0; font-size:13px; color:#64748b;">Fecha de visita</p>
            <p style="margin:2px 0 0; font-weight:700; font-size:15px;">${visitaSeleccionada.fecha}</p>
          </div>
        </div>
        <hr style="border:none; border-top:1px solid #e2e8f0; margin-bottom:20px;" />
        <table style="width:100%; border-collapse:collapse; font-size:13px;">
          <thead>
            <tr style="background:#f8fafc;">
              <th style="text-align:left; padding:8px 10px; color:#475569; font-weight:600; border-bottom:1px solid #e2e8f0;">Tipo</th>
              <th style="text-align:left; padding:8px 10px; color:#475569; font-weight:600; border-bottom:1px solid #e2e8f0;">Concepto</th>
              <th style="text-align:right; padding:8px 10px; color:#475569; font-weight:600; border-bottom:1px solid #e2e8f0;">Precio</th>
            </tr>
          </thead>
          <tbody>
            ${filas.map(f => `
              <tr>
                <td style="padding:8px 10px; border-bottom:1px solid #f1f5f9; color:#64748b;">${f.tipo}</td>
                <td style="padding:8px 10px; border-bottom:1px solid #f1f5f9;">${f.nombre}</td>
                <td style="padding:8px 10px; border-bottom:1px solid #f1f5f9; text-align:right;">$${f.precio.toLocaleString("es-MX")}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        <div style="margin-top:16px; text-align:right;">
          <span style="font-size:14px; color:#475569; margin-right:16px;">Total</span>
          <span style="font-size:20px; font-weight:700; color:#0f172a;">$${total.toLocaleString("es-MX")}</span>
        </div>
        <hr style="border:none; border-top:1px solid #e2e8f0; margin-top:24px;" />
        <p style="font-size:11px; color:#94a3b8; text-align:center; margin-top:12px;">
          Documento generado el ${new Date().toLocaleDateString("es-MX")}
        </p>
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
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
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
    <div className="modal-backdrop" onClick={handleBackdropClick}>
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
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <CalendarioRecibo
            visitas={visitas}
            fechaSeleccionada={fechaSeleccionada}
            onSelect={setFechaSeleccionada}
          />

          {visitaSeleccionada && (
            <div className="recibo-preview">
              <p className="recibo-preview-titulo">Resumen de la visita</p>
              <ul className="recibo-preview-lista">
                {[
                  ...visitaSeleccionada.servicios.map(s => ({ label: s.nombre, precio: s.precio })),
                  ...visitaSeleccionada.medicamentos.map(m => ({ label: m.nombre, precio: m.precio })),
                  ...visitaSeleccionada.equipo.map(e => ({ label: e.nombre, precio: e.precio })),
                ].map((item, i) => (
                  <li key={i}>
                    <span className="recibo-item-nombre">{item.label}</span>
                    <span className="recibo-item-precio">${item.precio.toLocaleString("es-MX")}</span>
                  </li>
                ))}
              </ul>
              <div className="recibo-preview-total">
                <span>Total</span>
                <strong>${calcularTotal(visitaSeleccionada).toLocaleString("es-MX")}</strong>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-cancelar" onClick={onClose}>Cancelar</button>
          <button
            className="btn-guardar"
            onClick={handleGenerar}
            disabled={!fechaSeleccionada || generando}
            style={{
              opacity: (!fechaSeleccionada || generando) ? 0.5 : 1,
              cursor: (!fechaSeleccionada || generando) ? "not-allowed" : "pointer"
            }}
          >
            {generando ? "Generando…" : "📄 Generar PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Modal de pago ─────────────────────────────────────────────────── */

function ModalPago({ data, pacienteId, onClose }) {
  const [form, setForm] = useState({
    metodoPago: "",
    montoAbonado: "",
    notas: "",
  });
  const [popup, setPopup] = useState(null);
  const [popupMensaje, setPopupMensaje] = useState("");

  const descuento = form.montoAbonado !== ""
    ? Math.max(0, data.total - parseFloat(form.montoAbonado || 0))
    : null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  //aqui mandar a llamar una funcion que guarde el monto recibido del evento id y paciente id
  const handleGuardarPago = async () => {

    if (!form.metodoPago) {
      setPopup("error");
      setPopupMensaje("Debes seleccionar un método de pago.");
      return;
    }

    if (!form.montoAbonado || Number(form.montoAbonado) <= 0) {
      setPopup("error");
      setPopupMensaje("Debes ingresar un monto válido.");
      return;
    }

    try {

      const body = {
        eventoId: data.eventoId,
        pacienteId,
        montoPagado: Number(form.montoAbonado),
        metodoPago: form.metodoPago,
        notas: form.notas,
        descuento
      };

      const response = await fetch(
        "http://localhost:3001/api/pagos/guardar",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body)
        }
      );

      if (!response.ok) {
        throw new Error();
      }

      setPopup("exito");
      setPopupMensaje("El pago fue registrado exitosamente.");

    } catch (error) {

      setPopup("error");
      setPopupMensaje("No se pudo guardar el pago.");
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-pago">
        <div className="modal-header">
          <div>
            <h2 className="modal-titulo">Realizar Pago</h2>
            <p className="modal-subtitulo">
              Visita del {data.fecha} · Total:{" "}
              <strong>${data.total.toLocaleString("es-MX")}</strong>
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="modal-field">
            <label>Método de pago</label>
            <select name="metodoPago" value={form.metodoPago} onChange={handleChange}>
              <option value="">— Seleccionar —</option>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta_debito">Tarjeta de débito</option>
              <option value="tarjeta_credito">Tarjeta de crédito</option>
              <option value="transferencia">Transferencia / SPEI</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>

          <div className="modal-row">
            <div className="modal-field">
              <label>Monto abonado ($)</label>
              <input
                type="number"
                name="montoAbonado"
                placeholder={`Máx. ${data.total.toLocaleString("es-MX")}`}
                min="0"
                max={data.total}
                value={form.montoAbonado}
                onChange={handleChange}
              />
            </div>
            <div className="modal-field">
              <label>Descuento ($)</label>
              <input
                type="text"
                readOnly
                value={descuento !== null ? `$${descuento.toLocaleString("es-MX")}` : "—"}
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
          <button className="btn-cancelar" onClick={onClose}>Cancelar</button>
          <button className="btn-guardar" onClick={handleGuardarPago}>Guardar pago</button>
        </div>
      </div>

      {popup && (
        <div className="med-overlay" onClick={() => setPopup(null)}>
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

/* ─── Helpers ───────────────────────────────────────────────────────── */

function transformarDatos(rows) {
  const resultado = {};
  rows.forEach(item => {
    const fecha = new Date(item.FECHA_EVENTO);
    const year = fecha.getFullYear();
    if (!resultado[year]) resultado[year] = [];
    let visita = resultado[year].find(
      v => v.eventoId === item.EVENTO_ID
    );
    if (!visita) {
      visita = { 
        eventoId: item.EVENTO_ID,
        fecha: fecha.toLocaleDateString("es-MX"),
        montoRecibido: item.MONTO_RECIBIDO, 
        servicios: [], medicamentos: [], equipo: [] };
      resultado[year].push(visita);
    }
    const registro = { nombre: item.NOMBRE, precio: item.PRECIO, cantidad: item.CANTIDAD };
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

function ItemRow({ nombre, precio, cantidad, badgeClass, badgeLabel }) {
  return (
    <li>
      <div className="item-left">
        <span className={`badge ${badgeClass}`}>{badgeLabel}</span>
        {nombre} {cantidad > 1 && <span className="item-cantidad">x{cantidad}</span>}
      </div>
      <span className="item-price">${precio.toLocaleString("es-MX")}</span>
    </li>
  );
}

export default VisualizarHistorial;