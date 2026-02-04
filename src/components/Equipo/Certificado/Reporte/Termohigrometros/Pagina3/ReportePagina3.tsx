import React from "react";
import "./ReportePagina3.css";
import { type ThermoSectionResult } from "@/Routes/Calibration/Equipos/Termohigrometros/components/ThermoSection";
import backgroundCertificado from "@/assets/background/marcaReporte.png";

interface ReportePagina3Props {
  humedad: ThermoSectionResult | null;
  observaciones: string;
}

const ReportePagina3: React.FC<ReportePagina3Props> = ({
  humedad,
  observaciones,
}) => {
  const renderSection = (
    section: ThermoSectionResult | null,
    unit: string,
    titleOverride?: string,
  ) => {
    if (!section) {
      return (
        <p className="empty-row">No se registraron datos para esta magnitud.</p>
      );
    }

    return (
      <div className="section-block">
        <h3 className="result-subtitle">
          {titleOverride || section.title} ({unit})
        </h3>

        <table className="results-table2 compact">
          <thead>
            <tr>
              <th>PATRÓN ({unit})</th>
              <th>LECTURA EQUIPO ({unit})</th>
              <th>ERROR</th>
            </tr>
          </thead>
          <tbody>
            {section.data.map((row, index) => (
              <tr key={index}>
                <td className="font-mono">{row.patron}</td>
                <td className="font-mono">{row.lectura || "-"}</td>
                <td className="font-mono font-bold">{row.error ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="stats-caja">
          <div className="stat-item-caja">
            <span>Error promedio</span>
            <strong>{section.stats.errorPromedio}</strong>
          </div>
          <div className="stat-item-caja">
            <span>Desviación estándar</span>
            <strong>{section.stats.desviacionEstandar}</strong>
          </div>
          <div className="stat-item-caja">
            <span>Incertidumbre expandida</span>
            <strong>{section.stats.incertidumbreExpandida}</strong>
          </div>
          <div className="stat-item-caja">
            <span>Resolución</span>
            <strong>
              {section.stats.resolucion} {unit}
            </strong>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="page report-page">
      <div
        className="watermark-bg"
        style={{ backgroundImage: `url(${backgroundCertificado})` }}
      >
        <div className="content">
          <div className="page-header">
            <span className="page-number">Página 4 de 4</span>
          </div>

          <h2 className="main-title-results">
            RESULTADOS DE CALIBRACIÓN – TERMOHIGRÓMETRO
          </h2>

          {renderSection(humedad, "%HR", "Humedad Relativa")}

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

export default ReportePagina3;
