import React, { useState, useEffect } from "react";
import Calendario from "../componentes/agendacitas/calendario";
import PanelCitas from "../componentes/agendacitas/panelcitas";
import PopupAgregarCita from "../componentes/agendacitas/popupagregarc";
import API_BASE from "../config.js";
import "./agendacitasp.css";

function AgendaCitasPage() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [citas, setCitas] = useState([]);
    const [openPopup, setOpenPopup] = useState(false);

    useEffect(() => {
        obtenerCitas();
    }, [selectedDate]);

    const obtenerCitas = async () => {
        try {
            const fecha = selectedDate.toISOString().split("T")[0];
            const response = await fetch(`${API_BASE}/api/citas?fecha=${fecha}`);
            const data = await response.json();
            if (data.ok) {
                setCitas(data.citas);
            }
        } catch (error) {
            console.error("Error obteniendo citas:", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await fetch(`${API_BASE}/api/citas/${id}`, { method: "DELETE" });
            obtenerCitas();
        } catch (error) {
            console.error("Error eliminando cita:", error);
        }
    };

    const handleStatusChange = async (id, status) => {
        try {
            await fetch(`${API_BASE}/api/citas/${id}/estatus`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ estatus_cita: status }),
            });
            obtenerCitas();
        } catch (error) {
            console.error("Error actualizando estatus:", error);
        }
    };

    return (
        <div className="contenedor">
            <div className="lado-izq">
                <Calendario selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
            </div>
            <div className="lado-derecho">
                <PanelCitas
                    selectedDate={selectedDate}
                    citas={citas}
                    onAddPatient={() => setOpenPopup(true)}
                    onDeleteAppointment={handleDelete}
                    onStatusChange={handleStatusChange}
                />
                <PopupAgregarCita
                    isOpen={openPopup}
                    onClose={() => setOpenPopup(false)}
                    selectedDate={selectedDate}
                    onSuccess={obtenerCitas}
                />
            </div>
        </div>
    );
}

export default AgendaCitasPage;