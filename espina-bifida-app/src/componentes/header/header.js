import React from "react";
import "./header.css";
import { Bell } from "lucide-react";

function Header() {
  return (
    <div className="header">
      <div className="header-left">
        <h1>Módulo de Usuarios</h1>
      </div>

      <div className="header-right">
        <div className="icon-btn">
          <Bell size={18} />
        </div>

        <div className="avatar">AB</div>
      </div>
    </div>
  );
}

export default Header;