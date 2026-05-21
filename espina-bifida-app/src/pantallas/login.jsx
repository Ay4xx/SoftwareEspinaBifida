import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Completa todos los campos");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: String(email).trim(),
          password: String(password),
        }),
      });

      const data = await response.json();

      console.log("LOGIN RESPONSE:", data);

      if (data.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("usuario", JSON.stringify(data.data));
        localStorage.removeItem("guest");

        window.dispatchEvent(new Event("usuario-login"));

        const tipoUsuario = data.data?.tipoUsuario?.trim().toUpperCase();

        console.log("TIPO USUARIO:", tipoUsuario);

        if (tipoUsuario === "ADMINISTRADOR") {
          navigate("/usuarios");
        } else if (tipoUsuario === "COORDINADOR") {
          navigate("/usuarios");
        } else if (tipoUsuario === "SUPERADMIN") {
          navigate("/usuarios");
        }
      } else {
        setErrorMessage(data.message || "Credenciales incorrectas");
      }
    } catch (error) {
      console.error("Error en login:", error);
      setErrorMessage("No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    localStorage.setItem("guest", "true");
    navigate("/registro");
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

          {errorMessage && <p className="login-error">{errorMessage}</p>}

          <button
            type="button"
            className="guest-btn"
            onClick={handleGuestLogin}
          >
            Ingresar como invitado
          </button>

          <button type="submit" className="login-btn" disabled={loading}>
            <span className="login-icon">↪</span>
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;