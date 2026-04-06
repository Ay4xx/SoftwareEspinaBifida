import React from "react";
import "./notificaciones.css";
import { UserRound, MapPin, Phone, IdCard, Check } from "lucide-react";

const datos = [
  {
    id: 1,
    nombre: "Juan Pérez Sánchez",
    curp: "PESJ980312HNLRNN02",
    ciudad: "Monterrey, NL",
    telefono: "81 1234 5678",
    estado: "pendiente",
    tiempo: "Hace 5 min",
  },
  {
    id: 2,
    nombre: "María López Torres",
    curp: "LOTM010523MNLPRRX08",
    ciudad: "San Nicolás, NL",
    telefono: "81 9876 5432",
    estado: "pendiente",
    tiempo: "Hace 1 hora",
  },
  {
    id: 3,
    nombre: "Carlos Ramírez",
    curp: "RACA970201HNLRMR04",
    ciudad: "Guadalupe, NL",
    telefono: "81 4567 8910",
    estado: "aprobado",
    tiempo: "Ayer, 3:20 pm",
  },
];

function NotificacionesPage() {
  const renderEstado = (estado) => {
    if (estado === "pendiente") {
      return <span className="estado-badge pendiente">● Pendiente</span>;
    }
    return <span className="estado-badge aprobado">● Aprobado</span>;
  };

  const Tarjeta = ({ item }) => (
    <div className="noti-card">
      <div className={`noti-icon ${item.estado}`}>
        {item.estado === "aprobado" ? (
          <Check size={24} />
        ) : (
          <UserRound size={24} />
        )}
      </div>

      <div className="noti-body">
        <div className="noti-top">
          <h3>
            {item.estado === "pendiente"
              ? `Registro pendiente — ${item.nombre}`
              : `Registro aprobado — ${item.nombre}`}
          </h3>

          <div className="noti-header-right">
            {renderEstado(item.estado)}
            <span className="noti-time">{item.tiempo}</span>
          </div>
        </div>

        <p className="noti-description">
          {item.estado === "pendiente"
            ? "Un invitado ha completado su registro como paciente y está esperando aprobación."
            : "El paciente fue dado de alta exitosamente en el sistema."}
        </p>

        <div className="noti-tags">
          <span className="noti-tag">
            <IdCard size={14} /> {item.curp}
          </span>

          <span className="noti-tag">
            <MapPin size={14} /> {item.ciudad}
          </span>

          <span className="noti-tag">
            <Phone size={14} /> {item.telefono}
          </span>
        </div>

        {item.estado === "pendiente" && (
          <div className="noti-actions">
            <button className="btn-aprobar">Aprobar</button>
            <button className="btn-rechazar">Rechazar</button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="notificaciones-page">
      <div className="notificaciones-topbar">
        <div>
          <h1>Notificaciones</h1>
          <p>3 solicitudes pendientes de revisión</p>
        </div>

        <div className="filtros">
          <button className="activo">Todas</button>
          <button>Pendientes</button>
          <button>Resueltas</button>
        </div>
      </div>

      {datos.map((item) => (
        <Tarjeta key={item.id} item={item} />
      ))}
    </div>
  );
}

export default NotificacionesPage;