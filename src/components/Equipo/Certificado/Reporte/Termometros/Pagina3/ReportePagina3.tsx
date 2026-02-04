// src/components/Equipo/Certificado/Reporte/Termometros/ReporteTermometro.tsx
import React from "react";
import { useMemo } from "react";
// import "./ReporteTermometro.css"; // Usa estilos similares a ReportePagina2.css
import { type TempSectionResult } from "@/Routes/Calibration/Equipos/Termometros/components/TempSection";
import backgroundCertificado from "@/assets/background/marcaReporte.png";

interface ReporteTermometroProps {
  sensorInterno?: TempSectionResult | null;
  sensorExterno?: TempSectionResult | null;
}

const ReportePagina3: React.FC<ReporteTermometroProps> = ({
  sensorInterno,
  sensorExterno,
}) => {
  const renderSection = (
    section: TempSectionResult | null,
    unit: string,
    titleOverride?: string,
  ) => {
    if (!section) {
      return (
        <p className="empty-row">No se registraron datos para esta sección.</p>
      );
    }

    return (
      <div className="section-block">
        <h3 className="result-subtitle">
          {titleOverride || section.title} ({unit})
        </h3>

        {/* Tabla principal de resultados */}
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

        {/* Resumen estadístico */}
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

  const getTitulo = () => {
    return "RESULTADOS DE CALIBRACIÓN – TERMÓMETRO";
  };

  return (
    <div className="page report-page">
      <div
        className="watermark-bg"
        style={{ backgroundImage: `url(${backgroundCertificado})` }}
      >
        <div className="content">
          <span className="page-number">Página 3 de 4</span>

          <h2 className="main-title-results">{getTitulo()}</h2>
          {/* Temperatura: Sensor interno */}

          {/* Temperatura: Sensor externo */}
          {sensorInterno &&
            renderSection(sensorInterno, "°C", "Temperatura - Sensor Interno")}
          {sensorExterno &&
            renderSection(sensorExterno, "°C", "Temperatura - Sensor Externo")}

          {/* Gráfico Sensor Externo */}
          {/* 
          <div className="observations-box mt-large">
            <h4>NOTAS</h4>
            <p>
              Los errores indicados incluyen las correcciones debidas al equipo
              patrón utilizado. La incertidumbre expandida corresponde a un
              factor de cobertura k = 2, equivalente a un nivel de confianza
              aproximado del 95 %.
            </p>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default ReportePagina3;
