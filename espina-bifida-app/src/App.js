import React from 'react';
import Sidebar from './componentes/sidebar/sidebar';
import './App.css';
import Header from './componentes/header/header';
import Credencial from './componentes/credencial/credencial';

function App() {
  return (
    <div className="layout">
      <Sidebar />

      <div className="main">
        <Header />

        <div className="content">
        </div>
      </div>
    </div>
  );
}

export default App;
