import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";

const API_FORGOT = "http://localhost:3001/api/forgot-password/request";

const ForgotPassword = () => {
  const [email,        setEmail]        = useState("");
  const [sent,         setSent]         = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email) { setErrorMessage("Ingresa tu correo electrónico"); return; }

    try {
      setLoading(true);
      const response = await fetch(API_FORGOT, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: email.trim() }),
      });
      const data = await response.json();
      if (data.ok) setSent(true);
      else setErrorMessage(data.message || "No se pudo enviar el correo");
    } catch {
      setErrorMessage("No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo"><img src="/espinaLogo.png" alt="logo" /></div>
        <h1 className="login-title">Espina Bífida</h1>
        <p className="login-subtitle">Recuperar contraseña</p>

        {!sent ? (
          <form onSubmit={handleSubmit} className="login-form">
            <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 12 }}>
              Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
            </p>
            <div className="input-group">
              <label>Correo electrónico</label>
              <input type="email" placeholder="maria.garcia@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            {errorMessage && <p className="login-error">{errorMessage}</p>}
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Enviando..." : "Enviar enlace"}
            </button>
            <button type="button" className="guest-btn" onClick={() => navigate("/login")} style={{ marginTop: 8 }}>
              ← Volver al inicio de sesión
            </button>
          </form>
        ) : (
          <div className="login-form" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📩</div>
            <p style={{ fontWeight: 500, marginBottom: 8 }}>Revisa tu correo</p>
            <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 20 }}>
              Si <strong>{email}</strong> está registrado, recibirás un enlace para restablecer tu contraseña. El enlace expira en 1 hora.
            </p>
            <button type="button" className="guest-btn" onClick={() => navigate("/login")}>
              ← Volver al inicio de sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
