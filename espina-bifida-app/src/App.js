import React from "react";
import Sidebar from "./componentes/sidebar/sidebar";
import Header from "./componentes/header/header";
import "./App.css";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";

import UsuariosPage from "./pantallas/usuario/usuario";
import HistorialPage from "./pantallas/historial";
import NotificacionesPage from "./pantallas/notificaciones";
import RegistroPage from "./pantallas/registro";
import Login from "./pantallas/login";
import ServiciosPanel from "./pantallas/inventario";
import Credencial from "./componentes/credencial/credencial";
import AgendaCitasPage from "./pantallas/agendacitas";
import { NotificacionesProvider } from "./pantallas/notificacionesContext";

function AppContent() {
  const location = useLocation();

  const token = localStorage.getItem("token");
  const isGuest = localStorage.getItem("guest") === "true";

  const showBars = !!token && !isGuest;
  const isLogin = location.pathname === "/login";

  // Login page without sidebar/header
  if (isLogin) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    );
  }

  return (
    <div className={showBars ? "layout" : "layout guest-layout"}>
      {/* Sidebar only for authenticated users */}
      {showBars && <Sidebar />}

      <div className={showBars ? "main" : "main guest-main"}>
        {/* Header only for authenticated users */}
        {showBars && <Header />}

        <div className={showBars ? "content" : "content guest-content"}>
          <Routes>
            {/* Redirect root */}
            <Route path="/" element={<Navigate to="/login" />} />

            {/* Main routes */}
            <Route path="/usuarios" element={<UsuariosPage />} />
            <Route path="/registro" element={<RegistroPage />} />
            <Route path="/notificaciones" element={<NotificacionesPage />} />
            <Route path="/historial" element={<HistorialPage />} />
            <Route path="/inventario" element={<ServiciosPanel />} />
            <Route path="/agendacitas" element={<AgendaCitasPage />} />

            {/* Dynamic routes */}
            <Route path="/credencial/:pacienteId" element={<Credencial />} />
            <Route
              path="/inventario/:pacienteId"
              element={<ServiciosPanel />}
            />
            <Route
              path="/historial/:pacienteId"
              element={<HistorialPage />}
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <NotificacionesProvider>
      <Router>
        <Routes>
          <Route path="*" element={<AppContent />} />
        </Routes>
      </Router>
    </NotificacionesProvider>
  );
}

export default App;