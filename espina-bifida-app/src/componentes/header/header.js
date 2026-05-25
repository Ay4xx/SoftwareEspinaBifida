import React, { useState, useEffect } from "react";
import "./header.css";
import { Bell, ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useNotificaciones } from "../../pantallas/notificacionesContext";

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { pendientesCount } = useNotificaciones();

  const token = localStorage.getItem("token");
  const isGuest = localStorage.getItem("guest") === "true";

  const [usuario, setUsuario] = useState(
    JSON.parse(localStorage.getItem("usuario") || "null")
  );

  useEffect(() => {
    const handleStorage = () => {
      setUsuario(JSON.parse(localStorage.getItem("usuario") || "null"));
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  if (!token || isGuest) {
    return null;
  }

  const esAdmin = usuario?.tipoUsuario?.trim().toUpperCase() === "ADMINISTRADOR";
  const modoRevision = location.pathname === "/registro" && location.state?.modoRevision;

  const getTitle = () => {
    if (location.pathname.startsWith("/historial")) {
      return "Módulo de Historial";
    }
    switch (location.pathname) {
      case "/":               return "Módulo de Pacientes";
      case "/usuarios":       return "Módulo de Pacientes";
      case "/inventario":     return "Módulo de Inventario";
      case "/estadisticas":   return "Módulo de Estadísticas";
      case "/registro":       return modoRevision ? "Volver a solicitudes" : "Módulo de Registro";
      case "/notificaciones": return "Solicitudes";
      case "/gestion-usuarios": return "Gestión de usuarios";
      case "/agendacitas":    return "Módulo de Agenda";
      default: return "Sistema";
    }
  };

  const getInitials = () => {
    if (!usuario) return "US";
    if (usuario.username) return usuario.username.substring(0, 2).toUpperCase();
    if (usuario.nombre) {
      return usuario.nombre
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0].toUpperCase())
        .join("");
    }
    return "US";
  };

  return (
    <div className="header">
      <div className="header-left">
        {modoRevision ? (
          <div
            className="header-back-title"
            onClick={() => navigate("/notificaciones")}
            style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
          >
            <ArrowLeft size={22} />
            <h1 style={{ margin: 0 }}>{getTitle()}</h1>
          </div>
        ) : (
          <h1>{getTitle()}</h1>
        )}
      </div>

      <div className="header-right">
        {!esAdmin && (
          <div
            className={`icon-btn ${pendientesCount > 0 ? "con-pendientes" : ""} ${
              location.pathname === "/notificaciones" ? "activo" : ""
            }`}
            onClick={() => navigate("/notificaciones")}
            style={{ cursor: "pointer" }}
          >
            <Bell size={18} />
            {pendientesCount > 0 && (
              <span className="notificacion-badge">
                {pendientesCount > 99 ? "99+" : pendientesCount}
              </span>
            )}
          </div>
        )}

        {usuario?.foto ? (
          <img
            src={usuario.foto}
            alt="avatar"
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              objectFit: "cover",
              cursor: "pointer",
            }}
          />
        ) : (
          <div className="avatar">{getInitials()}</div>
        )}
      </div>
    </div>
  );
}

export default Header;