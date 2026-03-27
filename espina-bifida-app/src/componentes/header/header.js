import React from "react";
import "./header.css";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();
  return (
    <div className="header">
      <div className="header-left">
        <h1>Módulo de Usuarios</h1>
      </div>

      <div className="header-right">
        <div 
        className="icon-btn"
        onClick={() => navigate("/notificaciones")}
        style={{cursor: "pointer" }}
        
        >
          <Bell size={18} />
        </div>

        <div className="avatar">AB</div>
      </div>
    </div>
  );
}

export default Header;