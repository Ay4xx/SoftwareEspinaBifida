import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import PatientCard from "../../componentes/patientCard/patientCard";
import "./usuario.css";

function UsuariosPage() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("todos");

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch(
          `http://localhost:3001/api/pacientes/cards?search=${encodeURIComponent(search)}`
        );
        const data = await res.json();
        console.log("Respuesta backend:", data);
        console.log(data.data);
        setPatients(data.data || []);
      } catch (error) {
        console.error("Error cargando pacientes:", error);
      }
    };

    fetchPatients();
  }, [search]);

  const filteredPatients = patients.filter((p) => {
    if (tab === "activos") return p.status === "Activo";
    if (tab === "inactivos") return p.status === "Inactivo";
    return true;
  });

  return (
    <div className="usuarios-page">
      <div className="usuarios-topbar">
        <div className="usuarios-tabs">
          <button
            className={`tab ${tab === "todos" ? "active" : ""}`}
            onClick={() => setTab("todos")}
          >
            Todos <span>{patients.length}</span>
          </button>

          <button
            className={`tab ${tab === "activos" ? "active" : ""}`}
            onClick={() => setTab("activos")}
          >
            Activos <span>{patients.filter((p) => p.status === "Activo").length}</span>
          </button>

          <button
            className={`tab ${tab === "inactivos" ? "active" : ""}`}
            onClick={() => setTab("inactivos")}
          >
            Inactivos <span>{patients.filter((p) => p.status === "Inactivo").length}</span>
          </button>
        </div>

        <div className="usuarios-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar paciente"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="usuarios-grid">
        {filteredPatients.map((patient) => (
          <PatientCard key={patient.id} patient={patient} />
        ))}
      </div>
    </div>
  );
}

export default UsuariosPage;