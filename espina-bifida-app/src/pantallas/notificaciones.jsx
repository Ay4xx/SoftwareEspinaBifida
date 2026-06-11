import { useEffect, useMemo, useState } from "react";
import "./notificaciones.css";
import { UserRound, MapPin, Phone, IdCard, Check, Bell, Search } from "lucide-react";
import { useNotificaciones } from "./notificacionesContext";
import { useNavigate } from "react-router-dom";
import API_BASE from "../config.js";

const API_URL =  `${API_BASE}/api/notificaciones`;


// ── Helpers ───────────────────────────────────────────────────────────────────

function parseFechaBackend(fechaTexto) {
  if (!fechaTexto) return null;
  const match = /^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?$/.exec(fechaTexto);
  if (!match) return null;
  const [, dd, mm, yyyy, hh = "00", mi = "00"] = match;
  return new Date(Date.UTC(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(mi)));
}

function formatearTiempo(fechaTexto) {
  if (!fechaTexto) return "Sin fecha";
  const fecha = parseFechaBackend(fechaTexto);
  if (!fecha) return fechaTexto;
  const diffMs   = new Date() - fecha;
  const diffMin  = Math.floor(diffMs / 60000);
  const diffHoras = Math.floor(diffMs / 3600000);
  const diffDias  = Math.floor(diffMs / 86400000);
  if (diffMin  < 60) return `Hace ${diffMin} minuto${diffMin !== 1 ? "s" : ""}`;
  if (diffHoras < 24) return `Hace ${diffHoras} hora${diffHoras > 1 ? "s" : ""}`;
  if (diffDias  < 7)  return `Hace ${diffDias} día${diffDias > 1 ? "s" : ""}`;
  return fecha.toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function mapearNotificacion(item) {
  return {
    id:               item.id,
    nombre:           `${item.paciente?.nombre || ""} ${item.paciente?.apellido || ""}`.trim() || "Sin nombre",
    curp:             item.paciente?.curp      || "",
    ciudad:           item.paciente?.ubicacion || "",
    telefono:         item.paciente?.telefono  || "",
    foto:             item.paciente?.foto      || null,
    estado:           (item.estado || "pendiente").toLowerCase(),
    tiempo:           formatearTiempo(item.fechaCreacion),
    fechaCreacionRaw: item.fechaCreacion,
    leida:            (item.estado || "pendiente").toLowerCase() !== "pendiente",
  };
}

// ── Textos por estado ─────────────────────────────────────────────────────────

const ESTADO_CONFIG = {
  pendiente: {
    badge:       <span className="estado-badge pendiente">● Pendiente</span>,
    titulo:      (nombre) => `Registro pendiente — ${nombre}`,
    descripcion: "Un invitado ha completado su registro como paciente y está esperando aprobación para ser dado de alta en el sistema.",
  },
  aprobado: {
    badge:       <span className="estado-badge aprobado">● Aprobado</span>,
    titulo:      (nombre) => `Registro aprobado — ${nombre}`,
    descripcion: "El paciente fue dado de alta exitosamente y ya aparece en el catálogo del sistema.",
  },
  rechazado: {
    badge:       <span className="estado-badge rechazado">● Rechazado</span>,
    titulo:      (nombre) => `Registro rechazado — ${nombre}`,
    descripcion: "El registro del paciente fue rechazado y ya no está pendiente de revisión.",
  },
};

const getEstadoConfig = (estado) => ESTADO_CONFIG[estado] || ESTADO_CONFIG.rechazado;

// ── Subcomponentes ────────────────────────────────────────────────────────────

function EstadoVacio({ mensaje }) {
  return (
    <div className="notificaciones-page">
      <div className="sin-notificaciones"><Bell size={20} /><span>{mensaje}</span></div>
    </div>
  );
}

function TarjetaNotificacion({ item, onClickCard }) {
  const config = getEstadoConfig(item.estado);

  return (
    <div className="noti-card" onClick={() => onClickCard(item)} style={{ cursor: "pointer" }}>
      <div className={`noti-icon ${item.estado}`}>
        {item.foto ? (
          <img
            src={item.foto}
            alt={item.nombre}
            style={{ width: "50px", height: "50px", borderRadius: "14px", objectFit: "cover" }}
            onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
          />
        ) : null}
        <span style={{ display: item.foto ? "none" : "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
          {item.estado === "aprobado" ? <Check size={28} /> : <UserRound size={28} />}
        </span>
      </div>
      <div className="noti-body">
        <div className="noti-top">
          <div className="noti-header-left">
            <h3>{config.titulo(item.nombre)}</h3>
          </div>
          <div className="noti-header-right">
            {config.badge}
            <span className="noti-time">{item.tiempo}</span>
            {!item.leida && <span className="noti-dot" />}
          </div>
        </div>
        <p className="noti-description">{config.descripcion}</p>
        <div className="noti-tags">
          <span className="noti-tag"><IdCard size={16} />CURP: {item.curp}</span>
          <span className="noti-tag"><MapPin size={16} />{item.ciudad}</span>
          <span className="noti-tag"><Phone size={16} />{item.telefono}</span>
        </div>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────

function NotificacionesPage() {
  const [filtro,         setFiltro]         = useState("pendientes");
  const [busqueda,       setBusqueda]       = useState("");
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState("");

  const { setPendientesCount, refrescarBadge } = useNotificaciones();
  const navigate = useNavigate();

  useEffect(() => {
    refrescarBadge();
    cargarNotificaciones();
    const intervalo = setInterval(() => {
      setNotificaciones((prev) =>
        prev.map((n) => ({ ...n, tiempo: formatearTiempo(n.fechaCreacionRaw) }))
      );
    }, 10000);
    return () => clearInterval(intervalo);
  }, []);

  async function cargarNotificaciones() {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(API_URL);
      const result   = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.message || "No se pudieron cargar las notificaciones");

      const dataMapeada = (result.data || [])
        .map(mapearNotificacion)
        .sort((a, b) => parseFechaBackend(b.fechaCreacionRaw) - parseFechaBackend(a.fechaCreacionRaw));

      setNotificaciones(dataMapeada);
      setPendientesCount(dataMapeada.filter((n) => n.estado === "pendiente").length);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al cargar notificaciones");
    } finally {
      setLoading(false);
    }
  }

  const handleClickCard = (item) => {
    if (item.estado === "aprobado") return;
    navigate("/registro", { state: { notificacionId: item.id, modoRevision: true } });
  };

  const totalPendientes = notificaciones.filter((n) => n.estado === "pendiente").length;
  const totalResueltas  = notificaciones.filter((n) => n.estado !== "pendiente").length;

  const notificacionesFiltradas = useMemo(() => {
    let resultado = notificaciones;
    if (filtro === "pendientes") resultado = resultado.filter((n) => n.estado === "pendiente");
    if (filtro === "resueltas")  resultado = resultado.filter((n) => n.estado !== "pendiente");
    if (busqueda.trim()) {
      const b = busqueda.toLowerCase();
      resultado = resultado.filter(
        (n) => n.nombre.toLowerCase().includes(b) || n.curp.toLowerCase().includes(b)
      );
    }
    return resultado;
  }, [filtro, busqueda, notificaciones]);

  if (loading) return <EstadoVacio mensaje="Cargando notificaciones..." />;
  if (error)   return <EstadoVacio mensaje={error} />;

  return (
    <div className="notificaciones-page">
      <div className="notificaciones-topbar">
        <div className="filtros">
          <button className={filtro === "pendientes" ? "activo" : ""} onClick={() => setFiltro("pendientes")}>
            Pendientes <span>{totalPendientes}</span>
          </button>
          <button className={filtro === "resueltas" ? "activo" : ""} onClick={() => setFiltro("resueltas")}>
            Rechazadas <span>{totalResueltas}</span>
          </button>
        </div>

        <div className="noti-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar notificación"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      <div className="seccion-notis">
        <h4>{filtro === "resueltas" ? "Rechazadas" : "Pendientes"}</h4>
        {notificacionesFiltradas.length > 0 ? (
          notificacionesFiltradas.map((item) => (
            <TarjetaNotificacion key={item.id} item={item} onClickCard={handleClickCard} />
          ))
        ) : (
          <div className="sin-notificaciones">
            <Bell size={20} />
            <span>No hay notificaciones {filtro === "resueltas" ? "resueltas" : "pendientes"}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificacionesPage;
