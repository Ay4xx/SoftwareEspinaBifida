import React from 'react';
import Sidebar from './componentes/sidebar/sidebar';
import Header from './componentes/header/header';
import './App.css';
import Tabnav from './componentes/tabnav/tabnav';

import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate
} from 'react-router-dom';

import UsuariosPage from './pantallas/usuario/usuario';
import HistorialPage from './pantallas/historial';
import NotificacionesPage from './pantallas/notificaciones';
import Login from './pantallas/login';
import ServiciosPanel from './pantallas/inventario';
//import Login from './pages/login';

function AppContent() {
  const location = useLocation();
  const isLogin = location.pathname === '/login';

  if (isLogin) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    );
  }

  return (
    <div className="layout">
      <Sidebar />

      <div className="main">
        <Header />
          <div className="content">
            <Routes>
              <Route path="/" element={<UsuariosPage />} />
              <Route path="/historial" element={<HistorialPage />} />
              <Route path="/inventario" element={<ServiciosPanel />} />
            </Routes>
          </div>

        <div className="content">
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/usuarios" element={<UsuariosPage />} />
            <Route path="/historial" element={<HistorialPage />} />
            <Route path="/notificaciones" element={<NotificacionesPage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="*" element={<AppContent />} />
      </Routes>
    </Router>
  );
}

export default App;