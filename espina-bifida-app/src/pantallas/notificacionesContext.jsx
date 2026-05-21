import { createContext, useContext, useEffect, useState, useCallback } from "react";

const NotificacionesContext = createContext();

const API_URL = "http://localhost:3001/api/notificaciones";
const SSE_URL = "http://localhost:3001/api/notificaciones-sse";

export function NotificacionesProvider({ children }) {
  const [pendientesCount, setPendientesCount] = useState(0);

  const fetchPendientes = useCallback(async () => {
    const isGuest = localStorage.getItem("guest") === "true";
    if (isGuest) return;

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
      console.error("[Badge] Error al obtener notificaciones:", err);
    }
  }, []);

  
  useEffect(() => {
    fetchPendientes();
  }, [fetchPendientes]);

  
  useEffect(() => {
    const handleLogin = () => fetchPendientes();
    window.addEventListener("usuario-login", handleLogin);
    return () => window.removeEventListener("usuario-login", handleLogin);
  }, [fetchPendientes]);

  
  useEffect(() => {
    const isGuest = localStorage.getItem("guest") === "true";
    if (isGuest) return;

    const eventSource = new EventSource(SSE_URL);

    eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.tipo === "actualizar") fetchPendientes();
      } catch (err) {
        console.error("[SSE] Error al parsear mensaje:", err);
      }
    };

    eventSource.onerror = () => {
      console.warn("[SSE] Conexión perdida, reintentando...");
    };

    return () => eventSource.close();
  }, [fetchPendientes]);

  return (
    <NotificacionesContext.Provider
      value={{ pendientesCount, setPendientesCount, refrescarBadge: fetchPendientes }}
    >
      {children}
    </NotificacionesContext.Provider>
  );
}

export function useNotificaciones() {
  return useContext(NotificacionesContext);
}