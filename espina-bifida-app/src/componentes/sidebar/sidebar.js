import React from "react";
import "./sidebar.css";
import {
  Users,
  Boxes,
  BarChart3,
  LogOut,
  PenBoxIcon,
  CalendarDays,
  UserCog
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const menuItems = [
  {
    name: "Usuarios",
    icon: Users,
    path: "/usuarios",
    roles: ["ADMINISTRADOR", "COORDINADOR", "SUPERADMIN"],
  },
  {
    name: "Registro",
    icon: PenBoxIcon,
    path: "/registro",
    roles: ["COORDINADOR", "SUPERADMIN"],
  },
  {
    name: "Inventario",
    icon: Boxes,
    path: "/inventario",
    roles: ["ADMINISTRADOR", "COORDINADOR", "SUPERADMIN"],
  },
  {
    name: "Agenda",
    icon: CalendarDays,
    path: "/agendacitas",
    roles: ["COORDINADOR"],
  },
  {
    name: "Estadísticas",
    icon: BarChart3,
    path: "/estadisticas",
    roles: ["ADMINISTRADOR", "SUPERADMIN"],
  },
  {
    name: "Gestión de usuarios",
    icon: UserCog,
    path: "/gestion-usuarios",
    roles: ["ADMINISTRADOR", "SUPERADMIN"],
  },
];

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const isGuest = localStorage.getItem("guest") === "true";
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const tipoUsuario = usuario?.tipoUsuario?.trim().toUpperCase();

  if (!token || isGuest) {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    localStorage.removeItem("guest");
    navigate("/");
  };

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(tipoUsuario)
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">AE</div>
        <div>
          <h2>AEBNL</h2>
          <p>Espina Bífida NL</p>
        </div>
      </div>

      <div className="sidebar-menu">
        <p className="menu-title">Menú Principal</p>

        {filteredMenuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              to={item.path}
              key={index}
              className={`menu-item ${isActive ? "active" : ""}`}
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <p className="menu-title">Sistema</p>

        <div className="menu-item logout" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Cerrar sesión</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;