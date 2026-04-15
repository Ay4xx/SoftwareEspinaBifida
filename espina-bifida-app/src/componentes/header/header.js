import React from "react";
import "./header.css";
import { Bell } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useNotificaciones } from "../../pantallas/notificacionesContext";

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const {pendientesCount} = useNotificaciones();

  const getTitle = () => {
    switch (location.pathname) {
      case "/":
        return "Módulo de Usuarios";
      case "/historial":
        return "Módulo de Historial";
      case "/inventario":
        return "Módulo de Inventario";
      case "/estadisticas":
        return "Módulo de Estadísticas";
      case "/registro":
        return "Módulo de Registro";
      case "/notificaciones":
        return "Notificaciones";
      default:
        return "Sistema";
    }
  };

  return (
    <div className="header">
      <div className="header-left">
        <h1>{getTitle()}</h1>
      </div>

      <div className="header-right">
        <div
          className={`icon-btn ${pendientesCount > 0 ? "con-pendientes" : ""} ${location.pathname === "/notificaciones" ? "activo" : ""}`}
          onClick={() => navigate("/notificaciones")}
          style={{ cursor: "pointer" }}
        >
          <Bell size={18} />
        </div>

        <div className="avatar">AB</div>
      </div>
    </div>
  );
}

export default Header;