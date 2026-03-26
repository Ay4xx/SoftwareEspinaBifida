import React from "react";
import "./sidebar.css";
import {
  Users,
  ClipboardList,
  Boxes,
  BarChart3,
  LogOut,
} from "lucide-react";
import AEBNLogo from "../../assets/logo_AEBNL.png";

const menuItems = [
  { name: "Usuarios", icon: Users, active: true },
  { name: "Registro", icon: ClipboardList },
  { name: "Inventario", icon: Boxes },
  { name: "Estadísticas", icon: BarChart3 },
];

function Sidebar() {
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

          return (
            <div
              key={index}
              className={`menu-item ${item.active ? "active" : ""}`}
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <p className="menu-title">Sistema</p>

        <div className="menu-item logout">
          <LogOut size={18} />
          <span>Cerrar sesión</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;