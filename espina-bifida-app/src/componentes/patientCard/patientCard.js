import { MapPin, Calendar, Plus, IdCard, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import placeholederPic from "../../assets/placeholder.png";
import "./patientCard.css";

function PatientCard({ patient }) {
  const navigate = useNavigate();

  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const esAdmin = usuario?.tipoUsuario?.trim().toUpperCase() === "ADMINISTRADOR";

  const formatDate = (dateString) => {
    if (!dateString) return "Sin registro";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleEditar = (e) => {
    e.stopPropagation(); 
    navigate("/registro", { state: { pacienteId: patient.id, modoRevision: true } });
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="user-info">
          <img
            className="avatar-circle"
            src={patient.foto ? `http://localhost:3001${patient.foto}` : placeholederPic}
            alt={patient.name}
          />
          <div>
            <h3>{patient.name}</h3>
            <p>{patient.subtitle}</p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {!esAdmin && (
            <button className="btn-editar" onClick={handleEditar} title="Editar paciente">
              <Pencil size={16} />
            </button>
          )}
          <span className={`status ${patient.status === "Activo" ? "active" : "inactive"}`}>
            {patient.status}
          </span>
        </div>
      </div>

      <div className="card-body">
        <div className="info">
          <MapPin size={16} />
          <span>{patient.location}</span>
        </div>
        <div className="info">
          <Calendar size={16} />
          <span>{formatDate(patient.ultimaVisita)}</span>
        </div>
      </div>

      <div className="card-extra">
        <span className="etapa-vida">{patient.etapaVida}</span>
      </div>

      <div className="card-footer">
        <button className="btn-secondary" onClick={() => navigate(`/historial/${patient.id}`)}>
          Historial
        </button>
        <button className="btn-primary" onClick={() => navigate(`/inventario/${patient.id}`)}>
          <Plus size={14} />
          Agregar
        </button>
      </div>
    </div>
  );
}

export default PatientCard;