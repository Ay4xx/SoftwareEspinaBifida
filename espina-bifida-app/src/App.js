import React from 'react';
import Sidebar from './componentes/sidebar/sidebar';
import './App.css';
import Header from './componentes/header/header';
import Credencial from './componentes/credencial/credencial';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import UsuariosPage from './pantallas/usuario';
import HistorialPage from './pantallas/historial';
import NotificacionesPage from './pantallas/notificaciones';
//import Login from './pages/login';

function App() {
  return (
    <Router>
      <div className="layout">
        <Sidebar />

        <div className="main">
          <Header />

          <div className="content">
            <Routes>
              <Route path="/" element={<UsuariosPage />} />
              <Route path="/historial" element={<HistorialPage />} />
              <Route path="/notificaciones" element={<NotificacionesPage/>} />
            </Routes>
          </div>

        </div>
      </div>
    </Router>
  );
}

export default App;
