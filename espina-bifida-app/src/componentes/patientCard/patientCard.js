import React, { useEffect, useState } from "react";
import { MapPin, Calendar, Plus, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import placeholederPic from "../../assets/placeholder.png";
import "./patientCard.css";

function PatientCard({ patient }) {
  const navigate = useNavigate();
  const [showMembershipEditor, setShowMembershipEditor] = useState(false);
  const [membershipStatus, setMembershipStatus] = useState(patient.status);
  const [membershipDate, setMembershipDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    setMembershipStatus(patient.status);
  }, [patient.status]);

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

  const isMembresiaActiva = membershipStatus === "Activo";

  const toggleMembershipEditor = (e) => {
    e.stopPropagation();
    setShowMembershipEditor((current) => !current);
    setFeedback("");
  };

  const handleActivateMembership = async () => {
    setIsSubmitting(true);
    setFeedback("");
    try {
      const response = await fetch(
        `http://localhost:3001/api/membresia/activar/${patient.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fechaInicio: membershipDate }),
        }
      );
      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.message || "Error al activar la membresía");
      }
      setMembershipStatus("Activo");
      setFeedback("Membresía activada correctamente.");
    } catch (error) {
      setFeedback(error.message || "No se pudo activar la membresía.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivateMembership = async () => {
    setIsSubmitting(true);
    setFeedback("");
    try {
      const response = await fetch(
        `http://localhost:3001/api/membresia/desactivar/${patient.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.message || "Error al desactivar la membresía");
      }
      setMembershipStatus("Inactivo");
      setFeedback("Membresía desactivada correctamente.");
    } catch (error) {
      setFeedback(error.message || "No se pudo desactivar la membresía.");
    } finally {
      setIsSubmitting(false);
    }
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
            <p>{patient.curp || patient.subtitle}</p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {!esAdmin && (
            <button className="btn-editar" onClick={handleEditar} title="Editar paciente">
              <Pencil size={16} />
            </button>
          )}
          <span
            className={`status ${isMembresiaActiva ? "active" : "inactive"}`}
            onClick={toggleMembershipEditor}
            title="Actualizar membresía"
          >
            {membershipStatus}
          </span>
        </div>
      </div>

      {showMembershipEditor && (
        <div className="membership-editor" onClick={(e) => e.stopPropagation()}>
          {isMembresiaActiva ? (
            <>
              <p className="membership-title">Membresía activa</p>
              <p className="membership-text">Puedes desactivar esta membresía desde aquí.</p>
              <button
                className="btn-secondary"
                onClick={handleDeactivateMembership}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Procesando..." : "Desactivar membresía"}
              </button>
            </>
          ) : (
            <>
              <label className="membership-label" htmlFor={`membership-date-${patient.id}`}>
                Fecha de inicio
              </label>
              <input
                id={`membership-date-${patient.id}`}
                className="membership-date"
                type="date"
                value={membershipDate}
                onChange={(e) => setMembershipDate(e.target.value)}
              />
              <button
                className="btn-primary"
                onClick={handleActivateMembership}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Procesando..." : "Activar membresía"}
              </button>
            </>
          )}
          {feedback && <p className="membership-feedback">{feedback}</p>}
        </div>
      )}

      <div className="card-body">
        <div className="info">
          <MapPin size={16} />
          <span>{patient.location}</span>
        </div>
        <div className="info">
          <Calendar size={16} />
          <span>{formatDate(patient.fechaNacimiento)}</span>
        </div>
      </div>

      <div className="card-footer">
        
        <button className="btn-primary" onClick={() => navigate(`/inventario/${patient.id}`)}>
          <Plus size={14} />
          Agregar
        </button>
      </div>
    </div>
  );
}

export default PatientCard;