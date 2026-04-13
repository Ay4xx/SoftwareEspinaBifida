import React, { useState } from "react";
import TabNav from "../componentes/tabnav/tabnav";
import VisualizarHistorial from '../componentes/historial/historial';
import VisualizarInfo from '../componentes/detallepaciente/detallepaciente'
import { FileText, Pill } from "lucide-react";
import "./historialp.css";

const tabs = [
  { id: "infopaciente", label: "Información General", icon: <FileText size={16} /> },
  { id: "historial", label: "Historial", icon: <Pill size={16} /> },
];

const pacientee = {
  nombre: "María García López",
  iniciales: "MG",
  curp: "MAGL031599MNL",
  email: "maria.garcia@email.com",
  telefono: "81 1234 5678",
  ubicacion: "Nuevo León",
  registro: "2022-03-15",
  estado: "Activo",
  vencimiento: "30-03-2026"
};

function HistorialPage() {
  const [activeTab, setActiveTab] = useState("historial");
  
  return (
    <div className="contenedor">
      <div className="lado-izq">
        <VisualizarInfo paciente={pacientee} />

      </div>

      <div className="lado-derecho">
        <TabNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="tab-content">
          {activeTab === "historial" &&  <VisualizarHistorial />}
          {activeTab === "infopaciente" && <div> pendiente por ahora</div>}
        </div>
      </div>

    </div>
  );
}

export default HistorialPage;