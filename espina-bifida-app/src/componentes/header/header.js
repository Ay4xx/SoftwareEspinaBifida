import React from "react";
import "./header.css";
import { Bell, Search } from "lucide-react";

function Header() {
  return (
    <div className="header">
      <div className="header-left">
        <h1>Módulo de Usuarios</h1>

        <div className="tabs">
          <div className="tab active">
            Todos <span>15</span>
          </div>
          <div className="tab">
            Activos <span>8</span>
          </div>
          <div className="tab">
            Inactivos <span>4</span>
          </div>
        </div>
      </div>

      <div className="header-right">
        <div className="search">
          <Search size={18} />
          <input placeholder="Buscar paciente" />
        </div>

        <div className="icon-btn">
          <Bell size={18} />
        </div>

        <div className="avatar">AB</div>
      </div>
    </div>
  );
}

export default Header;