// src/components/Equipo/Certificado/Reporte/Termometros/ReporteGraficasInfrarrojo.tsx
import React, { useMemo } from "react";
import "./styles.css";
import backgroundCertificado from "@/assets/background/marcaReporte.png";
import { type TempSectionResult } from "@/Routes/Calibration/Equipos/Termometros/components/TempSection";

interface ReporteGraficasInfrarrojoProps {
  observaciones: string;
}

const ReporteGraficasInfrarrojo: React.FC<ReporteGraficasInfrarrojoProps> = ({
  observaciones,
}) => {


  // Dimensiones más pequeñas para los gráficos
 
  return (
    <div className="page report-page">
      <div
        className="watermark-bg"
        style={{ backgroundImage: `url(${backgroundCertificado})` }}
      >
        <div className="content">
          {/* Observaciones del metrólogo */}
          <div className="section-block mt-large">
            <h3 className="result-subtitle">OBSERVACIONES DEL METRÓLOGO</h3>
            <div className="observations-box">
              <p style={{ whiteSpace: "pre-wrap" }}>
                {observaciones && observaciones.trim() !== ""
                  ? observaciones
                  : "Sin observaciones registradas."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReporteGraficasInfrarrojo;
