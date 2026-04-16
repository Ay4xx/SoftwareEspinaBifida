import React from "react";
import "./sidebar.css";
import {
  Users,
  Boxes,
  BarChart3,
  LogOut,
  PenBoxIcon,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const menuItems = [
  { name: "Usuarios", icon: Users, path: "/usuarios" },
  { name: "Registro", icon: PenBoxIcon, path: "/registro" },
  { name: "Inventario", icon: Boxes, path: "/inventario" },
  { name: "Estadísticas", icon: BarChart3, path: "/estadisticas" },
];

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  // Detect if current user is guest
  const token = localStorage.getItem("token");
  const isGuest = localStorage.getItem("guest") === "true";

  // Hide sidebar completely if guest or not logged in
  if (!token || isGuest) {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    localStorage.removeItem("guest");

    navigate("/");
  };

  return (
    <aside className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div className="logo">AE</div>
        <div>
          <h2>AEBNL</h2>
          <p>Espina Bífida NL</p>
        </div>
      </div>

      {/* Menu */}
      <div className="sidebar-menu">
        <p className="menu-title">Menú Principal</p>

        {menuItems.map((item, index) => {
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

      {/* Footer */}
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