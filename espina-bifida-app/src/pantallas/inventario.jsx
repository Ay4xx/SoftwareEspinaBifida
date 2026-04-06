import React, { useState } from "react";
import TabNav from '../componentes/tabnav/tabnav'; // 
import RegistrarConsulta from '../componentes/registrocitas/registrocitas';
import { FileText, Pill, Users } from "lucide-react";


const tabs = [
  { id: "citas", label: "Citas", icon: <FileText size={16} /> },
  { id: "medicamentos", label: "Medicamentos", icon: <Pill size={16} /> },
  { id: "equipo", label: "Equipo médico", icon: <Users size={16} /> },
];

function ServiciosPanel() {
  const [activeTab, setActiveTab] = useState("citas");

  return (
    <div>
      <TabNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="tab-content">
        {activeTab === "citas" &&  <RegistrarConsulta />}
        {activeTab === "medicamentos" && <div>Contenido de Medicamentos</div>}
        {activeTab === "equipo" && <div>Contenido de Equipo médico</div>}
      </div>
    </div>
  );
}

export default ServiciosPanel;