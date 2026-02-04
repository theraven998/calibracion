import React from "react";
import "./Dashboard.css";

const Dashboard: React.FC = () => {
  const handleGenerate = () => {
    // Navega a la ruta de la pantalla Choose. Ajusta la ruta si tu router usa otra.
    window.location.href = "/calibration/start/choose";
  };
  const handleView = () => console.log("Ir a Ver Generados");
  const handleQR = () => console.log("Ir a QRs");
  const handleLogout = () => console.log("Cerrar Sesión");

  return (
    <div className="app">
      <div className="card dashboard-card">
        <div className="header-section">
          <h1>Panel de Certificados</h1>
          <p className="muted">Selecciona una opción para comenzar</p>
        </div>

        <div className="menu-grid">
          {/* Opción 1: Generar */}
          <button
            type="button"
            className="option-card"
            onClick={handleGenerate}
          >
            <div className="icon-container">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            </div>
            <div className="text-content">
              <h3>Generar Certificado</h3>
              <span>Calibrar nuevo equipo</span>
            </div>
            <div className="arrow-icon" aria-hidden>
              →
            </div>
          </button>

          {/* Opción 2: Ver Generados */}
          <button type="button" className="option-card" onClick={handleView}>
            <div className="icon-container">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <div className="text-content">
              <h3>Ver Certificados</h3>
              <span>Certificados almacenados en la nube</span>
            </div>
            <div className="arrow-icon" aria-hidden>
              →
            </div>
          </button>
        </div>
        {/* Opción 3: Gestionar Centros de Salud */}
        <button
          onClick={() => (window.location.href = "/manage/folders")}
          type="button"
          className="option-card"
        >
          <div className="icon-container">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 3h12v18H6z" />
              <line x1="9" y1="3" x2="9" y2="21" />
              <line x1="15" y1="3" x2="15" y2="21" />
              <line x1="6" y1="9" x2="18" y2="9" />
              <line x1="6" y1="15" x2="18" y2="15" />
              <path d="M10 6h4v4h-4z" />
              <path d="M10 12h4v4h-4z" />
              <path d="M10 18h4v2h-4z" />
            </svg>
          </div>
          <div className="text-content">
            <h3>Gestionar Centros</h3>
            <span>Administrar centros y carpetas</span>
          </div>
          <div className="arrow-icon" aria-hidden>
            →
          </div>
        </button>
        <div className="actions">
          <button
            type="button"
            className="btn logout-btn"
            onClick={handleLogout}
          >
            Cerrar Sesión
          </button>
        </div>

        <div className="brand dashboard-footer">
          <small>Sistema de calibracion V 1.0</small>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
