import React from "react";
import { Search } from "lucide-react";
import PatientCard from "../../componentes/patientCard/patientCard";
import "./usuario.css";

function UsuariosPage() {
  const patients = [
    {
      id: 1,
      initials: "CR",
      name: "María García López",
      subtitle: "Paciente registrado",
      status: "Activo",
      location: "CDMX",
      consultations: 12,
    },
    {
      id: 2,
      initials: "AG",
      name: "Ana García",
      subtitle: "Paciente registrado",
      status: "Activo",
      location: "Guadalajara",
      consultations: 8,
    },
    {
      id: 3,
      initials: "CR",
      name: "Carlos Ramírez",
      subtitle: "Paciente registrado",
      status: "Activo",
      location: "Nuevo León",
      consultations: 19,
    },
    {
      id: 4,
      initials: "AG",
      name: "Ana García",
      subtitle: "Paciente registrado",
      status: "Inactivo",
      location: "Tamaulipas",
      consultations: 2,
    },
  ];

  return (
    <div className="usuarios-page">
      <div className="usuarios-topbar">
        <div className="usuarios-tabs">
          <button className="tab active">
            Todos <span>15</span>
          </button>

          <button className="tab">
            Activos <span>8</span>
          </button>

          <button className="tab">
            Inactivos <span>4</span>
          </button>
        </div>

        <div className="usuarios-search">
          <Search size={18} />
          <input type="text" placeholder="Buscar paciente" />
        </div>
      </div>

      <div className="usuarios-grid">
        {patients.map((patient) => (
          <PatientCard key={patient.id} patient={patient} />
        ))}
      </div>
    </div>
  );
}

export default UsuariosPage;