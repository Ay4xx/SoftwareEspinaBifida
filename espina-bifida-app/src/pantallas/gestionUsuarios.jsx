import { useState, useEffect } from "react";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import "./gestionUsuarios.css";

const API = "http://localhost:3001/api/gestion-usuarios";

const toBackRol = (rol) => rol;

const toFrontRol = (tipoUsuario) => {
  const t = tipoUsuario?.toUpperCase();
  if (t === "ADMINISTRADOR") return "ADMINISTRADOR";
  if (t === "SUPERADMIN")    return "SUPERADMIN";
  return "COORDINADOR";
};

function getToken() {
  return localStorage.getItem("token") || "";
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

const ROLES = [
  {
    id: "COORDINADOR",
    label: "Coordinador",
    desc: "Gestión de pacientes, agenda y reportes básicos.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
    color: "coord",
  },
  {
    id: "ADMINISTRADOR",
    label: "Administrador",
    desc: "Acceso completo: usuarios, inventario y configuración.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 2l2.4 4.8L20 8l-4 3.9.9 5.5L12 14.9l-4.9 2.6.9-5.5L4 8l5.6-1.2L12 2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    ),
    color: "admin",
  },
];

function ModalUsuario({ modo, usuario, onClose, onGuardar }) {
  const esEditar = modo === "editar";

  const [form, setForm] = useState({
    nombre:            usuario?.nombre   || "",
    username:          usuario?.username || "",
    password:          "",
    confirmarPassword: "",
    rol:               usuario?.rol      || "COORDINADOR",
  });
  const [error,    setError]    = useState("");
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const reglasPassword = [
    { label: "Mínimo 8 caracteres",                    ok: form.password.length >= 8 },
    { label: "Al menos una mayúscula",                  ok: /[A-Z]/.test(form.password) },
    { label: "Al menos un número",                      ok: /[0-9]/.test(form.password) },
    { label: "Al menos un carácter especial (@#$%...)", ok: /[^A-Za-z0-9]/.test(form.password) },
  ];

  const passwordValida = reglasPassword.every((r) => r.ok);
  const coinciden      = form.password === form.confirmarPassword && form.confirmarPassword !== "";

  const handleGuardar = async () => {
    setError("");

    if (!form.nombre.trim())   return setError("El nombre es requerido");
    if (!form.username.trim()) return setError("El correo es requerido");

    if (!esEditar) {
      if (!form.password)  return setError("La contraseña es requerida");
      if (!passwordValida) return setError("La contraseña no cumple los requisitos");
      if (!coinciden)      return setError("Las contraseñas no coinciden");
    }

    setCargando(true);
    try {
      await onGuardar({
        nombre:            form.nombre.trim(),
        username:          form.username.trim(),
        password:          form.password,
        confirmarPassword: form.confirmarPassword,
        tipoUsuario:       toBackRol(form.rol),
      });
      onClose();
    } catch (err) {
      setError(err.message || "Error al guardar");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">{esEditar ? "Editar usuario" : "Nuevo usuario"}</h3>
            <p className="modal-sub">
              {esEditar ? usuario.nombre || usuario.username : "Completa los datos del nuevo usuario"}
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">

          {/* Nombre y correo en la misma fila */}
          <div className="field-row">
            <div className="field">
              <label className="field-label">
                Nombre completo <span className="required">*</span>
              </label>
              <input
                className="field-input"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Ej. Sofía Ramírez"
              />
            </div>
            <div className="field">
              <label className="field-label">
                Correo electrónico <span className="required">*</span>
              </label>
              <input
                className="field-input"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="correo@aebnl.mx"
              />
            </div>
          </div>

          {/* Contraseña — solo al crear */}
          {!esEditar && (
            <>
              <div className="field">
                <label className="field-label">
                  Contraseña <span className="required">*</span>
                </label>
                <input
                  className={`field-input ${
                    form.password
                      ? passwordValida ? "input-ok" : "input-error"
                      : ""
                  }`}
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Mínimo 8 caracteres"
                />
                {form.password && (
                  <div className="password-rules">
                    {reglasPassword.filter(r => !r.ok).map((r) => (
                      <span key={r.label} className="rule fail">
                        {r.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="field">
                <label className="field-label">
                  Confirmar contraseña <span className="required">*</span>
                </label>
                <input
                  className={`field-input ${
                    form.confirmarPassword
                      ? coinciden ? "input-ok" : "input-error"
                      : ""
                  }`}
                  name="confirmarPassword"
                  type="password"
                  value={form.confirmarPassword}
                  onChange={handleChange}
                  placeholder="Repite la contraseña"
                />
                {form.confirmarPassword && (
                  <div className={`password-match-popup ${coinciden ? "match-ok" : "match-fail"}`}>
                    {coinciden
                      ? "Las contraseñas coinciden"
                      : "Las contraseñas no coinciden"}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Tipo de usuario */}
          <div className="field">
            <label className="field-label">
              Tipo de usuario <span className="required">*</span>
            </label>
            <div className="role-grid">
              {ROLES.map((rol) => (
                <div
                  key={rol.id}
                  className={`role-card ${form.rol === rol.id ? "selected" : ""} ${rol.color}`}
                  onClick={() => setForm({ ...form, rol: rol.id })}
                >
                  <div className="role-check">
                    {form.rol === rol.id && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2.5 2.5 3.5-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <div className={`role-icon ${rol.color}`}>{rol.icon}</div>
                  <div className="role-label">{rol.label}</div>
                  <div className="role-desc">{rol.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}
        </div>

        <div className="modal-footer">
          <p className="footer-note">
            Los campos con <span className="required">*</span> son obligatorios
          </p>
          <div className="footer-actions">
            <button className="btn-cancel" onClick={onClose} disabled={cargando}>
              Cancelar
            </button>
            <button className="btn-save" onClick={handleGuardar} disabled={cargando}>
              {cargando ? "Guardando..." : esEditar ? "Guardar cambios" : "Crear usuario"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [search,   setSearch]   = useState("");
  const [modal,    setModal]    = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error,    setError]    = useState("");

  const cargarUsuarios = async (busqueda = "") => {
    setCargando(true);
    setError("");
    try {
      const res  = await fetch(`${API}?busqueda=${busqueda}&limite=50`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.message);

      setUsuarios(
        data.usuarios.map((u) => ({
          id:       u.id,
          nombre:   u.nombre,
          username: u.username,
          rol:      toFrontRol(u.tipoUsuario),
          creado:   u.fechaRegistro
            ? new Date(u.fechaRegistro).toLocaleDateString("es-MX", {
                day: "2-digit", month: "short", year: "numeric",
              })
            : "—",
        }))
      );
    } catch (err) {
      setError("No se pudieron cargar los usuarios");
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarUsuarios(); }, []);

  const filtrados = usuarios.filter((u) =>
    (u.nombre  || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.username || "").toLowerCase().includes(search.toLowerCase())
  );

  const iniciales = (nombre, username) => {
    if (nombre?.trim()) {
      return nombre.split(" ").slice(0, 2).map((n) => n[0]?.toUpperCase()).join("");
    }
    return username?.split(/[@.]/).slice(0, 2).map((n) => n[0]?.toUpperCase()).join("") || "?";
  };

  const avatarClass = (rol) => {
    if (rol === "ADMINISTRADOR") return "av-purple";
    if (rol === "SUPERADMIN")    return "av-super";
    return "av-blue";
  };

  const badgeClass = (rol) => {
    if (rol === "ADMINISTRADOR") return "badge-admin";
    if (rol === "SUPERADMIN")    return "badge-super";
    return "badge-coord";
  };

  const badgeLabel = (rol) => {
    if (rol === "ADMINISTRADOR") return "Administrador";
    if (rol === "SUPERADMIN")    return "Super Admin";
    return "Coordinador";
  };


  const handleCrear = async (form) => {
    const res  = await fetch(API, {
      method:  "POST",
      headers: authHeaders(),
      body:    JSON.stringify(form),
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.message);
    await cargarUsuarios(search);
  };

  const handleEditar = async (form) => {
    const res  = await fetch(`${API}/${modal.usuario.id}`, {
      method:  "PUT",
      headers: authHeaders(),
      body:    JSON.stringify({
        nombre:      form.nombre,
        username:    form.username,
        tipoUsuario: form.tipoUsuario,
      }),
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.message);
    await cargarUsuarios(search);
  };

  const handleBorrar = async (id) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este usuario?")) return;
    try {
      const res  = await fetch(`${API}/${id}`, {
        method:  "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.message);
      setUsuarios((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      alert(err.message || "Error al eliminar usuario");
    }
  };

  return (
    <div className="gestion-page">
      <div className="gestion-content">
        <div className="gestion-toolbar">
          <div className="usuarios-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Buscar usuario..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn-nuevo" onClick={() => setModal({ modo: "nuevo" })}>
            <Plus size={14} />
            Nuevo usuario
          </button>
        </div>

        {error && (
          <p className="form-error" style={{ marginBottom: 12 }}>{error}</p>
        )}

        <div className="tabla-wrap">
          {cargando ? (
            <p style={{ textAlign: "center", padding: "40px", color: "#888" }}>
              Cargando usuarios...
            </p>
          ) : (
            <table className="tabla">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Creado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="user-cell">
                        <div className={`avatar ${avatarClass(u.rol)}`}>
                          {iniciales(u.nombre, u.username)}
                        </div>
                        <div>
                          {/* Muestra nombre si existe, si no el correo */}
                          <div className="uname">{u.nombre || u.username}</div>
                          {u.nombre && (
                            <div className="uemail">{u.username}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${badgeClass(u.rol)}`}>
                        {badgeLabel(u.rol)}
                      </span>
                    </td>
                    <td className="fecha">{u.creado}</td>
                    <td>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                        {u.rol !== "SUPERADMIN" && (
                          <>
                            <button
                              className="btn-editar"
                              onClick={() => setModal({ modo: "editar", usuario: u })}
                            >
                              <Pencil size={13} /> Editar
                            </button>
                            <button className="btn-borrar" onClick={() => handleBorrar(u.id)}>
                              <Trash2 size={13} /> Borrar
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtrados.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "32px", color: "#888" }}>
                      No se encontraron usuarios
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && (
        <ModalUsuario
          modo={modal.modo}
          usuario={modal.usuario}
          onClose={() => setModal(null)}
          onGuardar={modal.modo === "nuevo" ? handleCrear : handleEditar}
        />
      )}
    </div>
  );
}

export default GestionUsuarios;