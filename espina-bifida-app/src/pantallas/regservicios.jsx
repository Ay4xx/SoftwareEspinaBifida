import React, { useState } from "react";
import TabNav from '../componentes/tabnav/tabnav';
import RegistrarConsulta from '../componentes/registrocitas/registrocitas';
import Medicamentos from '../componentes/medicamentos/medicamentos';
import EquipoMedico from '../componentes/equipomedico/equipomedico';
import VisualizarInfo from '../componentes/detallepaciente/detallepaciente';
import VisualizarHistorial from '../componentes/historial/historial';
import VisualizarFamiliar from '../componentes/detallefamiliar/detallefamiliar';
import { FileText, Pill, Users, Clipboard, Stethoscope } from "lucide-react";
import "./regservicios.css";

const tabs = [
  { id: "infopaciente", label: "Información Familiar", icon: <Users size={16} /> },
  { id: "historial", label: "Historial", icon: <Clipboard size={16} /> },
  { id: "citas", label: "Citas", icon: <FileText size={16} /> },
  { id: "medicamentos", label: "Medicamentos", icon: <Pill size={16} /> },
  { id: "equipo", label: "Equipo médico", icon: <Stethoscope size={16} /> },
];

function ServiciosPanel() {
  const [activeTab, setActiveTab] = useState("infopaciente");

  return (
    <div className="inventario-contenedor">

      <div className="inventario-izq">
        <VisualizarInfo /> 
      </div>

      <div className="inventario-derecho">
        <TabNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="tab-content">
          {activeTab === "historial" &&  <VisualizarHistorial />}
          {activeTab === "infopaciente" && <VisualizarFamiliar />}
          {activeTab === "citas" && <RegistrarConsulta />}
          {activeTab === "medicamentos" && <Medicamentos />}
          {activeTab === "equipo" && <EquipoMedico />}
        </div>
      </div>

    </div>
  );
}

export default ServiciosPanel;