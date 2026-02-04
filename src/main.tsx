import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App";
import { SelectionProvider } from "./context/SelectionContext";
import CalibrationForm from "./Routes/Calibration/Form/CalibrationForm";
import Choose from "./Routes/Calibration/Start/Choose";
import Basculas from "./Routes/Calibration/Equipos/Basculas/Basculas";
import Dashboard from "./Routes/Dashboard/Dashboard";
import CertificadoDetail2 from "./Routes/View/CertificadoDetail2";
import CloudPage from "./Routes/Cloud/CloudPage";
import PublicPanel from "./Routes/View/PublicPanel.tsx";
import Manage from "./Routes/Folders/Manage.tsx";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      {/* 1. El Provider envuelve TODO */}
      <SelectionProvider>
        {/* 2. El Header va aquí para que se vea en TODAS las páginas 
               y pueda consumir el contexto */}
        {/* <HeaderChoose /> */}

        {/* 3. El contenido cambiante va aquí */}
        <div className="main-content">
          {" "}
          {/* Opcional: para dar margen si el header es fixed */}
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/calibration" element={<CalibrationForm />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/choose" element={<Choose />} />
            <Route path="/basculas" element={<Basculas />} />
            <Route path="/manage/folders" element={<Manage />} />
            <Route path="/cloud" element={<CloudPage />} />
            <Route path="/panel/:idHospital" element={<PublicPanel />} />
            <Route
              path="/view/:idCertificado"
              element={<CertificadoDetail2 />}
            />
            <Route
              path="/certificado/:idCertificado"
              element={<CertificadoDetail2 />}
            />
          </Routes>
        </div>
      </SelectionProvider>
    </BrowserRouter>
  </StrictMode>
);
