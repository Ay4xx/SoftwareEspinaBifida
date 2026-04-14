import React, { useState } from "react";
import TabNav from '../componentes/tabnav/tabnav';
import RegistrarConsulta from '../componentes/registrocitas/registrocitas';
import Medicamentos from '../componentes/medicamentos/medicamentos';
import EquipoMedico from '../componentes/equipomedico/equipomedico';
import VisualizarInfo from '../componentes/detallepaciente/detallepaciente';
import { FileText, Pill, Users } from "lucide-react";
import "./inventario.css";

const tabs = [
  { id: "citas", label: "Citas", icon: <FileText size={16} /> },
  { id: "medicamentos", label: "Medicamentos", icon: <Pill size={16} /> },
  { id: "equipo", label: "Equipo médico", icon: <Users size={16} /> },
];

function ServiciosPanel() {
  const [activeTab, setActiveTab] = useState("citas");

  return (
    <div className="inventario-contenedor">

      <div className="inventario-izq">
        <VisualizarInfo /> 
      </div>

      <div className="inventario-derecho">
        <TabNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="tab-content">
          {activeTab === "citas" && <RegistrarConsulta />}
          {activeTab === "medicamentos" && <Medicamentos />}
          {activeTab === "equipo" && <EquipoMedico />}
        </div>
      </div>

    </div>
  );
}

export default ServiciosPanel;