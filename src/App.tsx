import { useState } from "react";
import "./App.css";
import logoRDOL from "@/assets/logos/LogoRDOL.png";

export default function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);

  const VALID_USERNAME = "rdol";
  const VALID_PASSWORD = "79782845";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError("Por favor ingresa usuario y contraseña.");
      return;
    }

    // Validación en el cliente (lógica antes que backend)
    if (username.trim() === VALID_USERNAME && password === VALID_PASSWORD) {
      setAuthenticated(true);
      setPassword(""); // no mantener contraseña en estado si no es necesario
    } else {
      setError("Usuario o contraseña incorrectos.");
    }
  }

  function handleLogout() {
    setAuthenticated(false);
    setUsername("");
    setPassword("");
    setError(null);
  }

  if (authenticated) {
    return (
      <div className="app">
        <div className="card dashboard">
          <h1>Bienvenido</h1>
          <p className="muted">Sistema de calibración de equipos biomédicos</p>
          <p>
            Usuario: <strong>{VALID_USERNAME}</strong>
          </p>
          <div className="actions">
            <button className="btn" onClick={handleLogout}>
              Cerrar sesión
            </button>
            <button
              className="btn"
              onClick={() => {
                // marcar autorización "oculta" y navegar a /tables
                sessionStorage.setItem("authorized", "true");
                window.location.href = "/choose";
              }}
            >
              Acceder al sistema
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div
        className="card login-card"
        role="main"
        aria-labelledby="login-title"
      >
        <h1 id="login-title">Acceso al sistema</h1>
        <p className="muted">
          Ingrese sus credenciales para continuar (validación local)
        </p>

        <form onSubmit={handleSubmit} className="form">
          <label>
            Usuario
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="usuario"
              autoComplete="username"
            />
          </label>

          <label>
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="contraseña"
              autoComplete="current-password"
            />
          </label>

          {error && (
            <div className="error" role="alert">
              {error}
            </div>
          )}

          <div className="actions">
            <button className="btn" type="submit">
              Entrar
            </button>
          </div>

          <p className="hint">
            Demo: usuario <strong>rdol</strong> · contraseña{" "}
            <strong>79782845</strong>
          </p>
        </form>

        <footer className="brand">
          <small>Sistema de Calibración — Equipos Biomédicos</small>
        </footer>
      </div>
      <div>
        <img src={logoRDOL} alt="Logo" className="logo" />
      </div>
    </div>
  );
}
