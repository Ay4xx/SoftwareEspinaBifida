import React, { useState } from "react";
import TabNav from "../componentes/tabnav/tabnav";
import VisualizarHistorial from '../componentes/historial/historial';
import VisualizarInfo from '../componentes/detallepaciente/detallepaciente';
import VisualizarFamiliar from '../componentes/detallefamiliar/detallefamiliar';
import { FileText, Pill } from "lucide-react";
import "./historialp.css";

const tabs = [
  { id: "infopaciente", label: "Información Familiar", icon: <FileText size={16} /> },
  { id: "historial", label: "Historial", icon: <Pill size={16} /> },
];


function HistorialPage() {
  const [activeTab, setActiveTab] = useState("historial");
  
  return (
    <div className="contenedor">
      <div className="lado-izq">
        <VisualizarInfo />

      </div>

      <div className="lado-derecho">
        <TabNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="tab-content">
          {activeTab === "historial" &&  <VisualizarHistorial />}
          {activeTab === "infopaciente" && <VisualizarFamiliar />}
        </div>
      </div>

    </div>
  );
}

export default HistorialPage;