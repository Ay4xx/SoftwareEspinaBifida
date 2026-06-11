import React, { useState } from "react";
import "./equipomedico.css";
import { useParams } from "react-router-dom";
import { Paperclip, X, Search } from "lucide-react";

function getMinDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
}

function EquipoMedico() {
  const { pacienteId } = useParams();
  const [equipos, setEquipos] = useState([]);
  const [disponibles, setDisponibles] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [popup, setPopup] = useState(null);

  const abrirPopup = async () => {
    const ids = equipos.map((e) => e.EQUIPO_M_ID).join(",");
    const url = ids
      ? `http://localhost:3001/api/equipomedico/disponibles?ids=${ids}`
      : `http://localhost:3001/api/equipomedico/disponibles`;

    try {
      const res = await fetch(url);
      const json = await res.json();
      setDisponibles(json.data || []);
      setSeleccionados([]);
      setBusqueda("");
      setShowPopup(true);
    } catch (err) {
      console.error("Error al cargar equipo médico:", err);
    }
  };

  const toggleSeleccion = (equipo) => {
    const yaSeleccionado = seleccionados.find((s) => s.EQUIPO_M_ID === equipo.EQUIPO_M_ID);
    if (yaSeleccionado) {
      setSeleccionados(seleccionados.filter((s) => s.EQUIPO_M_ID !== equipo.EQUIPO_M_ID));
    } else {
      setSeleccionados([...seleccionados, equipo]);
    }
  };

  const confirmarSeleccion = () => {
    const nuevos = seleccionados.map((e) => ({ ...e, cantidad: 1, fechaFinal: getMinDate() }));
    setEquipos([...equipos, ...nuevos]);
    setShowPopup(false);
  };

  const cancelarPopup = () => {
    setSeleccionados([]);
    setShowPopup(false);
  };

  const cancelarLista = () => {
    setEquipos([]);
  };

  const eliminar = (id) => {
    setEquipos(equipos.filter((e) => e.EQUIPO_M_ID !== id));
  };

  const cambiarCantidad = (id, valor) => {
    const cantidad = Math.max(1, parseInt(valor) || 1);
    const equipo = equipos.find((e) => e.EQUIPO_M_ID === id);

    if (equipo && cantidad > equipo.CANTIDAD_TOTAL) {
      setPopup("exceso");
      return;
    }

    setEquipos(equipos.map((e) => e.EQUIPO_M_ID === id ? { ...e, cantidad } : e));
  };

  const cambiarFecha = (id, valor) => {
    setEquipos(equipos.map((e) => e.EQUIPO_M_ID === id ? { ...e, fechaFinal: valor } : e));
  };

  const getPrecio = (e) => `$${(e.PRECIO * e.cantidad).toFixed(2)}`;

  const total = equipos.reduce((acc, e) => acc + e.PRECIO * e.cantidad, 0);

  const disponiblesFiltrados = disponibles.filter((d) =>
    d.DESCRIPCION.toLowerCase().includes(busqueda.toLowerCase())
  );

  const guardarConsultaEquipo = async () => {
    if (equipos.length === 0) {
      setPopup("vacio");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/api/equipomedico/guardar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pacienteId, equipos }),
      });
      const json = await res.json();

      if (json.ok) {
        setEquipos([]);
        setPopup("exito");
      } else {
        alert("Error: " + json.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="equipo-wrapper">
      <div className="equipo-card">
        <div className="equipo-header">
          <h3 className="equipo-title">
            <Paperclip size={18} /> Préstamo de Comodato
          </h3>
          <button className="equipo-agregar" onClick={abrirPopup}>+ Agregar</button>
        </div>

        {equipos.length > 0 ? (
          <>
            <div className="equipo-table-header">
              <span>Comodato</span>
              <span>Cantidad</span>
              <span>Precio</span>
              <span>Fecha Estimada</span>
              <span></span>
            </div>

            {equipos.map((e) => (
              <div key={e.EQUIPO_M_ID} className="equipo-row">
                <span className="equipo-nombre">{e.DESCRIPCION}</span>
                <input
                  type="number"
                  className="equipo-input"
                  value={e.cantidad}
                  min={1}
                  onChange={(ev) => cambiarCantidad(e.EQUIPO_M_ID, ev.target.value)}
                />
                <span className="equipo-precio">{getPrecio(e)}</span>
                <input
                  type="date"
                  className="equipo-fecha"
                  value={e.fechaFinal}
                  min={getMinDate()}
                  onChange={(ev) => cambiarFecha(e.EQUIPO_M_ID, ev.target.value)}
                />
                <button className="equipo-delete" onClick={() => eliminar(e.EQUIPO_M_ID)}>✕</button>
              </div>
            ))}

            <div className="equipo-total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </>
        ) : (
          <p className="equipo-empty">No hay comodato agregado.</p>
        )}

        <div className="equipo-footer">
          <button className="equipo-cancelar" onClick={cancelarLista}>Cancelar</button>
          <button className="equipo-guardar" onClick={guardarConsultaEquipo}> Guardar Comodato</button>
        </div>
      </div>

      {/* Popup éxito */}
      {popup === "exito" && (
        <div className="equipo-overlay">
          <div className="equipo-popup-msg" onClick={(e) => e.stopPropagation()}>
            <div className="equipo-popup-msg-icon"></div>
            <h4>¡Registro guardado!</h4>
            <p>El préstamo de comodato fue registrado exitosamente.</p>
            <button className="equipo-popup-confirmar" onClick={() => setPopup(null)}>
              Aceptar
            </button>
          </div>
        </div>
      )}

      {/* Popup vacío */}
      {popup === "vacio" && (
        <div className="equipo-overlay">
          <div className="equipo-popup-msg" onClick={(e) => e.stopPropagation()}>
            <div className="equipo-popup-msg-icon"></div>
            <h4>¡Sin comodato!</h4>
            <p>Debes seleccionar al menos un comodato antes de guardar.</p>
            <button className="equipo-popup-confirmar" onClick={() => setPopup(null)}>
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Popup exceso */}
      {popup === "exceso" && (
        <div className="equipo-overlay">
          <div className="equipo-popup-msg" onClick={(e) => e.stopPropagation()}>
            <div className="equipo-popup-msg-icon"></div>
            <h4>Cantidad no disponible</h4>
            <p>La cantidad ingresada supera el stock disponible en inventario.</p>
            <button className="equipo-popup-confirmar" onClick={() => setPopup(null)}>
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Popup selección */}
      {showPopup && (
        <div className="equipo-overlay">
          <div className="equipo-popup">

            <div className="equipo-popup-header">
              <h4>Seleccionar Comodato</h4>
              <button className="equipo-popup-close" onClick={() => setShowPopup(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="equipo-search">
              <Search size={16} className="equipo-search-icon" />
              <input
                type="text"
                placeholder="Buscar comodato..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="equipo-search-input"
              />
            </div>

            <div className="equipo-popup-list">
              {disponiblesFiltrados.length === 0 ? (
                <p className="equipo-empty">No se encontró comodato.</p>
              ) : (
                disponiblesFiltrados.map((d) => {
                  const marcado = seleccionados.find((s) => s.EQUIPO_M_ID === d.EQUIPO_M_ID);
                  return (
                    <div
                      key={d.EQUIPO_M_ID}
                      className={`equipo-popup-item ${marcado ? "selected" : ""}`}
                      onClick={() => toggleSeleccion(d)}
                    >
                      <input
                        type="checkbox"
                        checked={!!marcado}
                        onChange={() => toggleSeleccion(d)}
                        onClick={(e) => e.stopPropagation()}
                        className="equipo-checkbox"
                      />
                      <span className="equipo-popup-nombre">{d.DESCRIPCION}</span>
                      <span className="equipo-popup-precio">${d.PRECIO}</span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="equipo-popup-footer">
              <button className="equipo-popup-cancelar" onClick={cancelarPopup}>Cancelar</button>
              <button
                className="equipo-popup-confirmar"
                onClick={confirmarSeleccion}
                disabled={seleccionados.length === 0}
              >
                Agregar ({seleccionados.length})
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default EquipoMedico;