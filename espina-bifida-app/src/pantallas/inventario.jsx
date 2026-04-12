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

function ServiciosPanel() {
  const [activeTab, setActiveTab] = useState("citas");

  return (
    <div className="inventario-contenedor">

      {/* IZQUIERDA — Info del paciente */}
      <div className="inventario-izq">
        <VisualizarInfo paciente={pacientee} />
      </div>

      {/* DERECHA — Tabs y contenido */}
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