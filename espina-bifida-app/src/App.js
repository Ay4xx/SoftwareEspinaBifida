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
import ServiciosPanel from "./pantallas/regservicios";
import InventarioPage from "./pantallas/inventario";
import Credencial from "./componentes/credencial/credencial";
import { NotificacionesProvider } from "./pantallas/notificacionesContext";
import GestionUsuarios from "./pantallas/gestionUsuarios";


function getRol() {
  try {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    return usuario?.tipoUsuario?.toUpperCase() || null;
  } catch {
    return null;
  }
}

function RutaProtegida({ element, rolesPermitidos }) {
  const token = localStorage.getItem("token");
  const rol   = getRol();

  if (!token) return <Navigate to="/login" />;

  if (!rolesPermitidos.includes(rol)) {
    if (rol === "COORDINADOR") return <Navigate to="/usuarios" />;
    if (rol === "ADMINISTRADOR") return <Navigate to="/usuarios" />;
    if (rol === "SUPERADMIN") return <Navigate to="/usuarios" />;
    return <Navigate to="/login" />;
  }

  return element;
}

function AppContent() {
  const location = useLocation();

  const token   = localStorage.getItem("token");
  const isGuest = localStorage.getItem("guest") === "true";

  const showBars = !!token && !isGuest;
  const isLogin  = location.pathname === "/login";

  if (isLogin) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    );
  }

  return (
    <div className={showBars ? "layout" : "layout guest-layout"}>
      {showBars && <Sidebar />}

      <div className={showBars ? "main" : "main guest-main"}>
        {showBars && <Header />}

        <div className={showBars ? "content" : "content guest-content"}>
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />

            {/* Coordinador + Admin + SuperAdmin */}
            <Route
              path="/usuarios"
              element={
                <RutaProtegida
                  element={<UsuariosPage />}
                  rolesPermitidos={["COORDINADOR", "ADMINISTRADOR", "SUPERADMIN"]}
                />
              }
            />
            <Route
              path="/historial"
              element={
                <RutaProtegida
                  element={<HistorialPage />}
                  rolesPermitidos={["COORDINADOR", "ADMINISTRADOR", "SUPERADMIN"]}
                />
              }
            />
            <Route
              path="/inventario"
              element={
                <RutaProtegida
                  element={<ServiciosPanel />}
                  rolesPermitidos={["COORDINADOR", "ADMINISTRADOR", "SUPERADMIN"]}
                />
              }
            />

            {/* Solo Coordinador + SuperAdmin */}
            <Route
              path="/registro"
              element={
                <RutaProtegida
                  element={<RegistroPage />}
                  rolesPermitidos={["COORDINADOR", "SUPERADMIN"]}
                />
              }
            />
            <Route
              path="/notificaciones"
              element={
                <RutaProtegida
                  element={<NotificacionesPage />}
                  rolesPermitidos={["COORDINADOR", "SUPERADMIN"]}
                />
              }
            />

            {/* Solo Admin + SuperAdmin */}
            <Route
              path="/gestion-usuarios"
              element={
                <RutaProtegida
                  element={<GestionUsuarios />}
                  rolesPermitidos={["ADMINISTRADOR", "SUPERADMIN"]}
                />
              }
            />

            {/* Rutas dinámicas */}
            <Route path="/credencial/:pacienteId" element={<Credencial />} />
            <Route
              path="/inventario/:pacienteId"
              element={
                <RutaProtegida
                  element={<ServiciosPanel />}
                  rolesPermitidos={["COORDINADOR", "ADMINISTRADOR", "SUPERADMIN"]}
                />
              }
            />
            <Route
              path="/historial/:pacienteId"
              element={
                <RutaProtegida
                  element={<HistorialPage />}
                  rolesPermitidos={["COORDINADOR", "ADMINISTRADOR", "SUPERADMIN"]}
                />
              }
            />

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