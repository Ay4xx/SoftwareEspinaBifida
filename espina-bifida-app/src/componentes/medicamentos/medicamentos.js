import React, { useState } from "react";
import "./medicamentos.css";
import { useParams } from "react-router-dom";
import { Paperclip, X, Search } from "lucide-react";
import API_BASE from "../../config.js";

function Medicamentos() {
  const { pacienteId } = useParams();
  const [medicamentos, setMedicamentos] = useState([]);
  const [disponibles, setDisponibles] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [popup, setPopup] = useState(null);

  const abrirPopup = async () => {
    const ids = medicamentos.map((m) => m.MEDICINA_ID).join(",");
    const url = ids
  ? `${API_BASE}/api/medicamentos/disponibles?ids=${ids}`
  : `${API_BASE}/api/medicamentos/disponibles`;

    try {
      const res = await fetch(url);
      const json = await res.json();
      setDisponibles(json.data || []);
      setSeleccionados([]);
      setBusqueda("");
      setShowPopup(true);
    } catch (err) {
      console.error("Error al cargar medicamentos:", err);
    }
  };

  const toggleSeleccion = (med) => {
    const yaSeleccionado = seleccionados.find((s) => s.MEDICINA_ID === med.MEDICINA_ID);
    if (yaSeleccionado) {
      setSeleccionados(seleccionados.filter((s) => s.MEDICINA_ID !== med.MEDICINA_ID));
    } else {
      setSeleccionados([...seleccionados, med]);
    }
  };

  const confirmarSeleccion = () => {
    const nuevos = seleccionados.map((med) => ({ ...med, cantidad: 1 }));
    setMedicamentos([...medicamentos, ...nuevos]);
    setShowPopup(false);
  };

  const cancelarPopup = () => {
    setSeleccionados([]);
    setShowPopup(false);
  };

  const cancelarLista = () => {
    setMedicamentos([]);
  };

  const eliminar = (id) => {
    setMedicamentos(medicamentos.filter((m) => m.MEDICINA_ID !== id));
  };

  const cambiarCantidad = (id, valor) => {
    const cantidad = Math.max(1, parseInt(valor) || 1);
    const medicamento = medicamentos.find((m) => m.MEDICINA_ID === id);

    if (medicamento && cantidad > medicamento.CANTIDAD_TOTAL) {
      setPopup("exceso");
      return;
    }

    setMedicamentos(medicamentos.map((m) =>
      m.MEDICINA_ID === id ? { ...m, cantidad } : m
    ));
  };

  const getPrecio = (med) => `$${(med.PRECIO * med.cantidad).toFixed(2)}`;

  const total = medicamentos.reduce((acc, m) => acc + m.PRECIO * m.cantidad, 0);

  const disponiblesFiltrados = disponibles.filter((d) =>
    d.DESCRIPCION.toLowerCase().includes(busqueda.toLowerCase())
  );

  const guardarConsulta = async () => {
    if (medicamentos.length === 0) {
      setPopup("vacio");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/medicamentos/guardar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pacienteId, medicamentos }),
      });
      const json = await res.json();
      if (json.ok) {
        setMedicamentos([]);
        setPopup("exito");
      } else {
        alert("Error: " + json.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="med-wrapper">
      <div className="med-card">
        <div className="med-header">
          <h3 className="med-title">
            <Paperclip size={18} /> Medicamentos Recetados
          </h3>
          <button className="med-agregar" onClick={abrirPopup}>+ Agregar</button>
        </div>

        {medicamentos.length > 0 ? (
          <>
            <div className="med-table-header">
              <span>Medicamento</span>
              <span>Cantidad</span>
              <span>Precio</span>
              <span></span>
            </div>

            {medicamentos.map((m) => (
              <div key={m.MEDICINA_ID} className="med-row">
                <span className="med-nombre">{m.DESCRIPCION}</span>
                <input
                  type="number"
                  className="med-input"
                  value={m.cantidad}
                  min={1}
                  onChange={(e) => cambiarCantidad(m.MEDICINA_ID, e.target.value)}
                />
                <span className="med-precio">{getPrecio(m)}</span>
                <button className="med-delete" onClick={() => eliminar(m.MEDICINA_ID)}>✕</button>
              </div>
            ))}

            <div className="med-total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </>
        ) : (
          <p className="med-empty">No hay medicamentos agregados.</p>
        )}

        <div className="med-footer">
          <button className="med-cancelar" onClick={cancelarLista}>Cancelar</button>
          <button className="med-guardar" onClick={guardarConsulta}> Guardar Medicamento</button>
        </div>
      </div>

      {/* Popup éxito */}
      {popup === "exito" && (
        <div className="med-overlay">
          <div className="med-popup-msg" onClick={(e) => e.stopPropagation()}>
            <div className="med-popup-msg-icon"></div>
            <h4>¡Registro guardado!</h4>
            <p>La consulta fue registrada exitosamente.</p>
            <button className="med-popup-confirmar" onClick={() => setPopup(null)}>
              Aceptar
            </button>
          </div>
        </div>
      )}

      {/* Popup vacío */}
      {popup === "vacio" && (
        <div className="med-overlay">
          <div className="med-popup-msg" onClick={(e) => e.stopPropagation()}>
            <div className="med-popup-msg-icon"></div>
            <h4>¡Sin medicamentos!</h4>
            <p>Debes seleccionar al menos un medicamento antes de guardar.</p>
            <button className="med-popup-confirmar" onClick={() => setPopup(null)}>
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Popup exceso */}
      {popup === "exceso" && (
        <div className="med-overlay">
          <div className="med-popup-msg" onClick={(e) => e.stopPropagation()}>
            <div className="med-popup-msg-icon"></div>
            <h4>Cantidad no disponible</h4>
            <p>La cantidad ingresada supera el stock disponible en inventario.</p>
            <button className="med-popup-confirmar" onClick={() => setPopup(null)}>
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Popup selección */}
      {showPopup && (
        <div className="med-overlay">
          <div className="med-popup">

            <div className="med-popup-header">
              <h4>Seleccionar Medicamentos</h4>
              <button className="med-popup-close" onClick={() => setShowPopup(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="med-search">
              <Search size={16} className="med-search-icon" />
              <input
                type="text"
                placeholder="Buscar medicamento..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="med-search-input"
              />
            </div>

            <div className="med-popup-list">
              {disponiblesFiltrados.length === 0 ? (
                <p className="med-empty">No se encontraron medicamentos.</p>
              ) : (
                disponiblesFiltrados.map((d) => {
                  const marcado = seleccionados.find((s) => s.MEDICINA_ID === d.MEDICINA_ID);
                  return (
                    <div
                      key={d.MEDICINA_ID}
                      className={`med-popup-item ${marcado ? "selected" : ""}`}
                      onClick={() => toggleSeleccion(d)}
                    >
                      <input
                        type="checkbox"
                        checked={!!marcado}
                        onChange={() => toggleSeleccion(d)}
                        onClick={(e) => e.stopPropagation()}
                        className="med-checkbox"
                      />
                      <span className="med-popup-nombre">{d.DESCRIPCION}</span>
                      <span className="med-popup-precio">${d.PRECIO}</span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="med-popup-footer">
              <button className="med-popup-cancelar" onClick={cancelarPopup}>
                Cancelar
              </button>
              <button
                className="med-popup-confirmar"
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

export default Medicamentos;