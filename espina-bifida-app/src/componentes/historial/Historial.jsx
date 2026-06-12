import { useParams } from "react-router-dom";
import "./historial.css";
import React, { useEffect, useState } from "react";
import API_BASE from "../../config.js";
import ModalPago from "./ModalPago";
import ModalGenerarRecibo from "./ModalRecibo";
import { calcularTotal } from "./helper";

function VisualizarHistorial() {
  const { pacienteId } = useParams();

  const [data, setData] = useState({});
  const [modalData, setModalData] = useState(null);
  const [reciboModal, setReciboModal] = useState(false);

  const [popup, setPopup] = useState(null);

  const [popupData, setPopupData] = useState({
    titulo: "",
    mensaje: "",
    eventoId: null,
  });

  const cargarHistorial = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/historial/${pacienteId}`);
      const rows = await response.json();
      setData(transformarDatos(rows));
    } catch (err) {
      console.error(err);
    }
  };

  const borrarVisita = async (eventoId) => {
    setPopup("confirmar");

    setPopupData({
      titulo: "Cancelar visita",
      mensaje:
        "Se cancelarán los servicios asociados y se restaurará el inventario utilizado.",
      eventoId,
    });
  };

  const confirmarBorrado = async () => {

    try {

      const response = await fetch(
        `${API_BASE}/api/historial/${pacienteId}/${popupData.eventoId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error();
      }

      await cargarHistorial();

      setPopup("exito");

      setPopupData({
        titulo: "Visita cancelada",
        mensaje: "La visita fue cancelada correctamente."
      });

    } catch (error) {

      console.error(error);

      setPopup("error");

      setPopupData({
        titulo: "Error",
        mensaje:
          "No se pudo cancelar la visita."
      });
    }
  };

  useEffect(() => {
    if (pacienteId) {
      cargarHistorial();
    }
  }, [pacienteId]);

  const years = Object.keys(data).sort((a, b) => b - a);

  const todasLasVisitas = years.flatMap((year) =>
    data[year].map((v) => ({ ...v, year }))
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

          <button
            className="btn-pdf"
            onClick={() => setReciboModal(true)}
          >
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
                        <ItemRow
                          key={idx}
                          nombre={s.nombre}
                          cantidad={s.cantidad}
                          precio={s.precio}
                          badgeClass="badge-servicio"
                          badgeLabel="Servicio"
                        />
                      ))}

                      {visita.medicamentos.map((m, idx) => (
                        <ItemRow
                          key={idx}
                          nombre={m.nombre}
                          cantidad={m.cantidad}
                          precio={m.precio}
                          badgeClass="badge-medicamento"
                          badgeLabel="Medicamento"
                        />
                      ))}

                      {visita.equipo.map((e, idx) => (
                        <ItemRow
                          key={idx}
                          nombre={e.nombre}
                          cantidad={e.cantidad}
                          precio={e.precio}
                          badgeClass="badge-equipo"
                          badgeLabel="Equipo"
                        />
                      ))}
                    </ul>

                    <hr className="divider" />

                    <div className="footer-visita">
                      <p className="total">
                        Total:{" "}
                        <strong>
                          $
                          {calcularTotal(visita).toLocaleString("es-MX")}
                        </strong>
                      </p>

                     {visita.montoRecibido ? (
                            <p className="monto-pagado-real">
                              Pagado: <strong>${visita.montoRecibido.toLocaleString("es-MX")}</strong>
                            </p>
                          ) : (
                            <button
                              className="btn-modificar-pago"
                              onClick={() => abrirModal(visita, year)}
                            >
                              Realizar pago
                            </button>
                          )}
                          
                          {visita.notas && (
                            <div className="nota-visita">
                              <strong>Notas:</strong> {visita.notas}
                            </div>
                          )}

                          {!visita.montoRecibido && (
                            <button
                              className="btn-borrar-visita"
                              onClick={() => borrarVisita(visita.eventoId)}
                            >
                              Cancelar
                            </button>
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

      {popup && (
        <div
          className="hist-popup-overlay"
        >
          <div
            className="hist-popup"
            onClick={(e) => e.stopPropagation()}
          >

            <div
              className={`hist-popup-icon ${
                popup === "error"
                  ? "error"
                  : popup === "confirmar"
                  ? "warning"
                  : "success"
              }`}
            >
              {popup === "confirmar"
                ? "!"
                : popup === "error"
                ? "✕"
                : "✓"}
            </div>

            <h3>{popupData.titulo}</h3>

            <p>{popupData.mensaje}</p>

            {popup === "confirmar" ? (
              <div className="hist-popup-actions">

                <button
                  className="hist-btn-secondary"
                  onClick={() => setPopup(null)}
                >
                  Cancelar
                </button>

                <button
                  className="hist-btn-danger"
                  onClick={confirmarBorrado}
                >
                  Eliminar
                </button>

              </div>
            ) : (
              <button
                className="hist-btn-primary"
                onClick={() => setPopup(null)}
              >
                Aceptar
              </button>
            )}

          </div>
        </div>
      )}
    </>
  );
}

function transformarDatos(rows) {
  const resultado = {};

  rows.forEach((item) => {
    const fecha = new Date(item.FECHA_EVENTO);
    const year = fecha.getFullYear();

    if (!resultado[year]) resultado[year] = [];

    let visita = resultado[year].find(
      (v) => v.eventoId === item.EVENTO_ID
    );

    if (!visita) {
      visita = {
        eventoId: item.EVENTO_ID,
        fecha: fecha.toLocaleDateString("es-MX"),
        montoRecibido: item.MONTO_RECIBIDO,
        notas: item.NOTAS,
        servicios: [],
        medicamentos: [],
        equipo: [],
      };

      resultado[year].push(visita);
    }

    const registro = {
      nombre: item.NOMBRE,
      precio: item.PRECIO,
      cantidad: item.CANTIDAD,
    };

    if (item.TIPO === "servicio")
      visita.servicios.push(registro);

    if (item.TIPO === "medicamento")
      visita.medicamentos.push(registro);

    if (item.TIPO === "equipo")
      visita.equipo.push(registro);
  });

  return resultado;
}

function ItemRow({
  nombre,
  precio,
  cantidad,
  badgeClass,
  badgeLabel,
}) {
  return (
    <li>
      <div className="item-left">
        <span className={`badge ${badgeClass}`}>
          {badgeLabel}
        </span>

        {nombre}

        {cantidad > 1 && (
          <span className="item-cantidad">
            x{cantidad}
          </span>
        )}
      </div>

      <span className="item-price">
        ${precio.toLocaleString("es-MX")}
      </span>
    </li>
  );
}

export default VisualizarHistorial;