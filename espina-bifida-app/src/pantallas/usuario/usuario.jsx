import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useLocation } from "react-router-dom";
import PatientCard from "../../componentes/patientCard/patientCard";
import PatientCardSkeleton from "../../componentes/patientCard/patientCardSkeleton";
import "./usuario.css";

function UsuariosPage() {
  const location = useLocation();

  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `http://localhost:3001/api/pacientes/cards?search=${encodeURIComponent(search)}`
        );

        const data = await res.json();

        if (!data.ok) {
          throw new Error(data.message || "Error al cargar pacientes");
        }

        setPatients(data.data || []);
      } catch (error) {
        console.error("Error cargando pacientes:", error);
        setError("No se pudieron cargar los pacientes.");
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [search, location.key]);

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
            Activos{" "}
            <span>
              {patients.filter((p) => p.status === "Activo").length}
            </span>
          </button>

          <button
            className={`tab ${tab === "inactivos" ? "active" : ""}`}
            onClick={() => setTab("inactivos")}
          >
            Inactivos{" "}
            <span>
              {patients.filter((p) => p.status === "Inactivo").length}
            </span>
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

      {error && <p className="usuarios-error">{error}</p>}

      <div className="usuarios-grid">
        {loading
          ? Array.from({ length: 6 }).map((_, index) => (
              <PatientCardSkeleton key={index} />
            ))
          : filteredPatients.map((patient) => (
              <PatientCard key={patient.id} patient={patient} />
            ))}
      </div>
    </div>
  );
}

export default UsuariosPage;