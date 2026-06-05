import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import "./login.css";

const ResetPassword = () => {
    const [searchParams]  = useSearchParams();
    const token           = searchParams.get("token");

    const [tokenValido, setTokenValido]       = useState(null); 
    const [newPassword, setNewPassword]       = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage]     = useState("");
    const [success, setSuccess]               = useState(false);
    const [loading, setLoading]               = useState(false);

    const [verPassword, setVerPassword]       = useState(false);
    const [verConfirm, setVerConfirm]         = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
        setTokenValido(false);
        return;
        }

        fetch(`http://localhost:3001/api/forgot-password/validate?token=${token}`)
        .then((r) => r.json())
        .then((data) => setTokenValido(data.ok))
        .catch(() => setTokenValido(false));
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        if (!newPassword || !confirmPassword) {
        setErrorMessage("Completa todos los campos");
        return;
        }
        if (newPassword.length < 8) {
        setErrorMessage("La contraseña debe tener al menos 8 caracteres");
        return;
        }
        if (newPassword !== confirmPassword) {
        setErrorMessage("Las contraseñas no coinciden");
        return;
        }

        try {
        setLoading(true);
        const response = await fetch("http://localhost:3001/api/forgot-password/reset", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, newPassword }),
        });

        const data = await response.json();

        if (data.ok) {
            setSuccess(true);
            setTimeout(() => navigate("/login"), 3000);
        } else {
            setErrorMessage(data.message || "No se pudo actualizar la contraseña");
        }
        } catch {
        setErrorMessage("No se pudo conectar con el servidor");
        } finally {
        setLoading(false);
        }
    };

    // Cargando validación del token
    if (tokenValido === null) {
        return (
        <div className="login-page">
            <div className="login-card">
            <p className="login-subtitle" style={{ textAlign: "center", paddingTop: 20 }}>
                Verificando enlace...
            </p>
            </div>
        </div>
        );
    }

    // Token inválido o expirado
    if (tokenValido === false) {
        return (
        <div className="login-page">
            <div className="login-card">
            <div className="login-logo">
                <img src="/espinaLogo.png" alt="logo" />
            </div>
            <h1 className="login-title">Espina Bífida</h1>
            <div className="login-form" style={{ textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
                <p style={{ fontWeight: 500, marginBottom: 8 }}>Enlace inválido o expirado</p>
                <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 20 }}>
                Este enlace ya no es válido. Puede que haya expirado (1 hora) o ya fue utilizado.
                </p>
                <button
                type="button"
                className="login-btn"
                onClick={() => navigate("/forgot-password")}
                >
                Solicitar nuevo enlace
                </button>
            </div>
            </div>
        </div>
        );
    }

    // Contraseña cambiada con éxito
    if (success) {
        return (
        <div className="login-page">
            <div className="login-card">
            <div className="login-logo">
                <img src="/espinaLogo.png" alt="logo" />
            </div>
            <h1 className="login-title">Espina Bífida</h1>
            <div className="login-form" style={{ textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                <p style={{ fontWeight: 500, marginBottom: 8 }}>¡Contraseña actualizada!</p>
                <p style={{ fontSize: 14, color: "#6b7280" }}>
                Redirigiendo al inicio de sesión...
                </p>
            </div>
            </div>
        </div>
        );
    }

    // Formulario principal
    return (
        <div className="login-page">
        <div className="login-card">
            <div className="login-logo">
            <img src="/espinaLogo.png" alt="logo" />
            </div>

            <h1 className="login-title">Espina Bífida</h1>
            <p className="login-subtitle">Nueva contraseña</p>

            <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
                <label>Nueva contraseña</label>
                <div style={{ position: "relative" }}>
                <input
                    type={verPassword ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ width: "100%", paddingRight: 40, boxSizing: "border-box" }}
                />
                <button
                    type="button"
                    onClick={() => setVerPassword((v) => !v)}
                    style={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#6b7280",
                    cursor: "pointer",
                    padding: 4,
                    display: "flex",
                    alignItems: "center",
                    }}
                >
                    {verPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                </div>
            </div>

            <div className="input-group">
                <label>Confirmar contraseña</label>
                <div style={{ position: "relative" }}>
                <input
                    type={verConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ width: "100%", paddingRight: 40, boxSizing: "border-box" }}
                />
                <button
                    type="button"
                    onClick={() => setVerConfirm((v) => !v)}
                    style={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#6b7280",
                    cursor: "pointer",
                    padding: 4,
                    display: "flex",
                    alignItems: "center",
                    }}
                >
                    {verConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                </div>
            </div>

            {errorMessage && <p className="login-error">{errorMessage}</p>}

            <button type="submit" className="login-btn" disabled={loading}>
                {loading ? "Guardando..." : "Cambiar contraseña"}
            </button>
            </form>
        </div>
        </div>
    );
    };

export default ResetPassword;