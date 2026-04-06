import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (email && password) {
      navigate("/usuarios");
    } else {
      alert("Completa todos los campos");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
            <img src="/espinaLogo.png" alt="logo" />
        </div>

        <h1 className="login-title">Espina Bífida</h1>
        <p className="login-subtitle">Sistema de gestión</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label>Correo electrónico</label>
            <input
              type="email"
              placeholder="maria.garcia@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="button" className="guest-btn">
            Ingresar como invitado
          </button>

          <button type="submit" className="login-btn">
            <span className="login-icon">↪</span>
            Iniciar sesión
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;