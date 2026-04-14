import { useEffect, useMemo, useState } from "react";
import "./notificaciones.css";
import { UserRound, MapPin, Phone, IdCard, Check, Bell } from "lucide-react";
import { useNotificaciones } from "./notificacionesContext";

const API_URL = "http://localhost:3001/api/notificaciones";

function NotificacionesPage() {
  const [filtro, setFiltro] = useState("todas");
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { setPendientesCount } = useNotificaciones();

  useEffect(() => {
  cargarNotificaciones();

  const intervalo = setInterval(() => {
    setNotificaciones((prev) =>
      prev.map((n) => ({
        ...n,
        tiempo: formatearTiempo(n.fechaCreacionRaw),
      }))
    );
  }, 60000); // actualiza cada minuto

  return () => clearInterval(intervalo);
}, []);

  async function cargarNotificaciones() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);
      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.message || "No se pudieron cargar las notificaciones");
      }

      const dataMapeada = (result.data || []).map((item) => ({
        id: item.id,
        nombre: item.paciente?.nombre || "Sin nombre",
        curp: item.paciente?.curp || "",
        ciudad: item.paciente?.ubicacion || "",
        telefono: item.paciente?.telefono || "",
        estado: (item.estado || "pendiente").toLowerCase(),
        tiempo: formatearTiempo(item.fechaCreacion),
        fechaCreacionRaw: item.fechaCreacion,
        leida: (item.estado || "pendiente").toLowerCase() !== "pendiente",
      }));

      setNotificaciones(dataMapeada);

      const count = dataMapeada.filter((n) => n.estado === "pendiente").length;
      setPendientesCount(count);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al cargar notificaciones");
    } finally {
      setLoading(false);
    }
  }

  function formatearTiempo(fechaTexto) {
    if (!fechaTexto) return "Sin fecha";

    const fecha = parseFechaBackend(fechaTexto);
    if (!fecha) return fechaTexto;

    const ahora = new Date();
    const diffMs = ahora - fecha;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMs / 3600000);
    const diffDias = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return "Hace un momento";
    if (diffMin < 60) return `Hace ${diffMin} min`;
    if (diffHoras < 24) return `Hace ${diffHoras} hora${diffHoras > 1 ? "s" : ""}`;
    if (diffDias === 1) return "Ayer";
    if (diffDias < 7) return `Hace ${diffDias} días`;

    return fecha.toLocaleDateString();
  }

  function parseFechaBackend(fechaTexto) {
    const match = /^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?$/.exec(fechaTexto);
    if (!match) return null;

    const [, dd, mm, yyyy, hh = "00", mi = "00"] = match;
    return new Date(
      Number(yyyy),
      Number(mm) - 1,
      Number(dd),
      Number(hh),
      Number(mi)
    );
  }

  const pendientesCount = useMemo(() => {
    return notificaciones.filter((n) => n.estado === "pendiente").length;
  }, [notificaciones]);

  const notificacionesFiltradas = useMemo(() => {
    if (filtro === "pendientes") {
      return notificaciones.filter((n) => n.estado === "pendiente");
    }
    if (filtro === "resueltas") {
      return notificaciones.filter((n) => n.estado !== "pendiente");
    }
    return notificaciones;
  }, [filtro, notificaciones]);

  const nuevas = notificacionesFiltradas.filter((n) => !n.leida);
  const anteriores = notificacionesFiltradas.filter((n) => n.leida);

  async function aprobarRegistro(id) {
    try {
      const response = await fetch(`${API_URL}/${id}/aprobar`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.message || "No se pudo aprobar la notificación");
      }

      setNotificaciones((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, estado: "aprobado", leida: true, tiempo: "Hace un momento" }
            : item
        )
      );
      setPendientesCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
      alert(err.message || "Error al aprobar");
    }
  }

  async function rechazarRegistro(id) {
    try {
      const response = await fetch(`${API_URL}/${id}/rechazar`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.message || "No se pudo rechazar la notificación");
      }

      setNotificaciones((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, estado: "rechazado", leida: true, tiempo: "Hace un momento" }
            : item
        )
      );
      setPendientesCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
      alert(err.message || "Error al rechazar");
    }
  }

  function renderEstado(estado) {
    if (estado === "pendiente") {
      return <span className="estado-badge pendiente">● Pendiente</span>;
    }
    if (estado === "aprobado") {
      return <span className="estado-badge aprobado">● Aprobado</span>;
    }
    return <span className="estado-badge rechazado">● Rechazado</span>;
  }

  function renderTitulo(item) {
    if (item.estado === "pendiente") return `Registro pendiente — ${item.nombre}`;
    if (item.estado === "aprobado") return `Registro aprobado — ${item.nombre}`;
    return `Registro rechazado — ${item.nombre}`;
  }

  function renderDescripcion(item) {
    if (item.estado === "pendiente") {
      return "Un invitado ha completado su registro como paciente y está esperando aprobación para ser dado de alta en el sistema.";
    }
    if (item.estado === "aprobado") {
      return "El paciente fue dado de alta exitosamente y ya aparece en el catálogo del sistema.";
    }
    return "El registro del paciente fue rechazado y ya no está pendiente de revisión.";
  }

  function TarjetaNotificacion({ item }) {
    return (
      <div className="noti-card">
        <div className={`noti-icon ${item.estado}`}>
          {item.estado === "aprobado" ? <Check size={28} /> : <UserRound size={28} />}
        </div>

        <div className="noti-body">
          <div className="noti-top">
            <div className="noti-header-left">
              <h3>{renderTitulo(item)}</h3>
            </div>

            <div className="noti-header-right">
              {renderEstado(item.estado)}
              <span className="noti-time">{item.tiempo}</span>
              {!item.leida && <span className="noti-dot" />}
            </div>
          </div>

          <p className="noti-description">{renderDescripcion(item)}</p>

          <div className="noti-tags">
            <span className="noti-tag">
              <IdCard size={16} />
              CURP: {item.curp}
            </span>
            <span className="noti-tag">
              <MapPin size={16} />
              {item.ciudad}
            </span>
            <span className="noti-tag">
              <Phone size={16} />
              {item.telefono}
            </span>
          </div>

          {item.estado === "pendiente" && (
            <div className="noti-actions">
              <button className="btn-aprobar" onClick={() => aprobarRegistro(item.id)}>
                Aprobar
              </button>
              <button className="btn-rechazar" onClick={() => rechazarRegistro(item.id)}>
                Rechazar
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="notificaciones-page">
        <div className="sin-notificaciones">
          <Bell size={20} />
          <span>Cargando notificaciones...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notificaciones-page">
        <div className="sin-notificaciones">
          <Bell size={20} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="notificaciones-page">
      <div className="notificaciones-topbar">
        <div>
          <h1>Notificaciones</h1>
          <p>{pendientesCount} solicitudes pendientes de revisión</p>
        </div>

        <div className="filtros">
          <button
            className={filtro === "todas" ? "activo" : ""}
            onClick={() => setFiltro("todas")}
          >
            Todas
          </button>
          <button
            className={filtro === "pendientes" ? "activo" : ""}
            onClick={() => setFiltro("pendientes")}
          >
            Pendientes
          </button>
          <button
            className={filtro === "resueltas" ? "activo" : ""}
            onClick={() => setFiltro("resueltas")}
          >
            Resueltas
          </button>
        </div>
      </div>

      <div className="seccion-notis">
        <h4>Nuevas</h4>
        {nuevas.length > 0 ? (
          nuevas.map((item) => <TarjetaNotificacion key={item.id} item={item} />)
        ) : (
          <div className="sin-notificaciones">
            <Bell size={20} />
            <span>No hay notificaciones nuevas</span>
          </div>
        )}
      </div>

      <div className="seccion-notis">
        <h4>Anteriores</h4>
        {anteriores.length > 0 ? (
          anteriores.map((item) => <TarjetaNotificacion key={item.id} item={item} />)
        ) : (
          <div className="sin-notificaciones">
            <Bell size={20} />
            <span>No hay notificaciones anteriores</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificacionesPage;