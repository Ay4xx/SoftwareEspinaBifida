import { createContext, useContext, useEffect, useState } from "react";

const NotificacionesContext = createContext();

const API_URL = "http://localhost:3001/api/notificaciones";

export function NotificacionesProvider({ children }) {
    const [pendientesCount, setPendientesCount] = useState(0);

    useEffect(() => {
        async function fetchPendientes() {
            try {
                const response = await fetch(API_URL);
                const result = await response.json();
                if (result.ok) {
                    const count = (result.data || []).filter(
                        (n) => (n.estado || "").toLowerCase() === "pendiente"
                    ).length;
                    setPendientesCount(count);
                }
            } catch (err) {
                console.error(err);
            }
        }
        fetchPendientes();
    }, []);

    return (
        <NotificacionesContext.Provider value={{ pendientesCount, setPendientesCount }}>
            {children}
        </NotificacionesContext.Provider>
    );
}

export function useNotificaciones() {
    return useContext(NotificacionesContext);
}