import React from 'react';
import Sidebar from './componentes/sidebar/sidebar';
import './App.css';
import Header from './componentes/header/header';

function App() {
  return (
    <div className="layout">
      <Sidebar />

      <div className="main">
        <Header />

        <div className="content">
          {/* tus cards aquí */}
        </div>
      </div>
    </div>
  );
}

export default App;
