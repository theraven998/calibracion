import React, { useMemo } from "react";
import backgroundCertificado from "@/assets/background/marcaReporte.png";
import { type EcgData } from "@/Routes/Calibration/Equipos/Monitores/components/ECGTable";
import { type RespiracionData } from "@/Routes/Calibration/Equipos/Monitores/components/RESPIRACIONTable";

interface ReportePagina4Props {
  ecgData: EcgData | null;
  respiracionData: RespiracionData | null;
  observaciones: string;
}

const ReportePagina4: React.FC<ReportePagina4Props> = ({
  ecgData,
  respiracionData,
  observaciones,
}) => {
  // Helper para formatear números
  const formatVal = (val: string | number | null) => {
    if (val === null || val === "" || val === undefined) return "-";
    return val.toString();
  };

  // Preparar datos para gráfico de ECG (si hay datos)
  const ecgPoints = useMemo(() => {
    if (!ecgData?.rows) return [];
    return ecgData.rows
      .map((row) => {
        const patron = parseFloat(row.patron || "0");
        const primera = parseFloat(row.primera || "0");
        if (Number.isNaN(patron) || Number.isNaN(primera)) return null;
        return { patron, primera };
      })
      .filter(Boolean) as { patron: number; primera: number }[];
  }, [ecgData]);

  const svgWidth = 600;
  const svgHeight = 260;
  const margin = { top: 20, right: 20, bottom: 40, left: 60 };

  return (
    <div className="page report-page">
      <div
        className="watermark-bg"
        style={{ backgroundImage: `url(${backgroundCertificado})` }}
      >
        <div className="content">
          <div className="section-block header-margin">
            <h2 className="main-title-results">RESULTADOS ECG Y RESPIRACIÓN</h2>
            <p className="justify-text intro-text">
              Los siguientes resultados corresponden a las pruebas de
              electrocardiograma (ECG) y frecuencia respiratoria realizadas al
              monitor de signos vitales.
            </p>
          </div>

          {/* 1. ECG */}
          <div className="section-block">
            <h3 className="result-subtitle">1. ELECTROCARDIOGRAMA (ECG)</h3>
            <table className="results-table2">
              <thead>
                <tr>
                  <th>PATRÓN (BPM)</th>
                  <th>PRIMERA</th>
                  <th>ERROR (BPM)</th>
                </tr>
              </thead>
              <tbody>
                {ecgData?.rows && ecgData.rows.length > 0 ? (
                  ecgData.rows.map((row, index) => (
                    <tr key={index}>
                      <td className="font-mono">{formatVal(row.patron)}</td>
                      <td className="font-mono">{formatVal(row.primera)}</td>
                      <td className="font-mono font-bold">0</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="empty-row">
                      No se registraron datos de ECG.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2} className="font-bold">
                    Error Promedio
                  </td>
                  <td className="font-mono font-bold">
                    {formatVal(ecgData?.errorPromedio)} BPM
                  </td>
                </tr>
                <tr>
                  <td colSpan={2} className="font-bold">
                    Desviación Estándar
                  </td>
                  <td className="font-mono">
                    {formatVal(ecgData?.desviacion)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={2} className="font-bold">
                    Incertidumbre (k=2)
                  </td>
                  <td className="font-mono">
                    ± {formatVal(ecgData?.incExpandida)} BPM
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* 2. RESPIRACIÓN */}
          <div className="section-block mt-large">
            <h3 className="result-subtitle">2. FRECUENCIA RESPIRATORIA</h3>
            <table className="results-table2">
              <thead>
                <tr>
                  <th>PATRÓN (RPM)</th>
                  <th>PRIMERA</th>
                  <th>ERROR (RPM)</th>
                </tr>
              </thead>
              <tbody>
                {respiracionData?.rows && respiracionData.rows.length > 0 ? (
                  respiracionData.rows.map((row, index) => (
                    <tr key={index}>
                      <td className="font-mono">{formatVal(row.patron)}</td>
                      <td className="font-mono">{formatVal(row.primera)}</td>
                      <td className="font-mono font-bold">0</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="empty-row">
                      No se registraron datos de respiración.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2} className="font-bold">
                    Error Promedio
                  </td>
                  <td className="font-mono font-bold">
                    {formatVal(respiracionData?.errorPromedio)} RPM
                  </td>
                </tr>
                <tr>
                  <td colSpan={2} className="font-bold">
                    Desviación Estándar
                  </td>
                  <td className="font-mono">
                    {formatVal(respiracionData?.desviacion)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={2} className="font-bold">
                    Incertidumbre (k=2)
                  </td>
                  <td className="font-mono">
                    ± {formatVal(respiracionData?.incExpandida)} RPM
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          {/* 
          {ecgPoints.length > 0 && (
            <div className="section-block mt-large">
              <h3 className="result-subtitle">
                Gráfico ECG - Patrón vs Lectura
              </h3>
              <div className="chart-container">
                {(() => {
                  const axisMinX = 0;
                  const axisMaxX = 250;
                  const axisMinY = 0;
                  const axisMaxY = 250;

                  const localScaleX = (x: number) =>
                    ((x - axisMinX) / (axisMaxX - axisMinX || 1)) *
                      (svgWidth - margin.left - margin.right) +
                    margin.left;

                  const localScaleY = (y: number) =>
                    svgHeight -
                    margin.bottom -
                    ((y - axisMinY) / (axisMaxY - axisMinY || 1)) *
                      (svgHeight - margin.top - margin.bottom);

                  const xTicks = [0, 40, 80, 120, 160, 200, 240];
                  const yTicks = [0, 40, 80, 120, 160, 200, 240];

                  return (
                    <svg
                      width={svgWidth}
                      height={svgHeight}
                      className="error-chart-svg"
                    >
                      <line
                        x1={margin.left}
                        y1={svgHeight - margin.bottom}
                        x2={svgWidth - margin.right}
                        y2={svgHeight - margin.bottom}
                        stroke="#0f172a"
                        strokeWidth={1}
                      />
                      <line
                        x1={margin.left}
                        y1={margin.top}
                        x2={margin.left}
                        y2={svgHeight - margin.bottom}
                        stroke="#0f172a"
                        strokeWidth={1}
                      />
                      {xTicks.map((t) => (
                        <g key={t}>
                          <line
                            x1={localScaleX(t)}
                            y1={svgHeight - margin.bottom}
                            x2={localScaleX(t)}
                            y2={svgHeight - margin.bottom + 6}
                            stroke="#0f172a"
                            strokeWidth={1}
                          />
                          <text
                            x={localScaleX(t)}
                            y={svgHeight - margin.bottom + 18}
                            textAnchor="middle"
                            fontSize="10"
                            fill="#0f172a"
                          >
                            {t}
                          </text>
                        </g>
                      ))}
                      {yTicks.map((t) => (
                        <g key={t}>
                          <line
                            x1={margin.left - 6}
                            y1={localScaleY(t)}
                            x2={margin.left}
                            y2={localScaleY(t)}
                            stroke="#0f172a"
                            strokeWidth={1}
                          />
                          <text
                            x={margin.left - 8}
                            y={localScaleY(t) + 4}
                            textAnchor="end"
                            fontSize="10"
                            fill="#0f172a"
                          >
                            {t}
                          </text>
                          <line
                            x1={margin.left}
                            y1={localScaleY(t)}
                            x2={svgWidth - margin.right}
                            y2={localScaleY(t)}
                            stroke="#e5e7eb"
                            strokeWidth={0.5}
                          />
                        </g>
                      ))}
                      <text
                        x={svgWidth / 2}
                        y={svgHeight - 8}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#0f172a"
                      >
                        Patrón (BPM)
                      </text>
                      <text
                        x={14}
                        y={svgHeight / 2}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#0f172a"
                        transform={`rotate(-90 14 ${svgHeight / 2})`}
                      >
                        Lectura (BPM)
                      </text>
                      <line
                        x1={localScaleX(0)}
                        y1={localScaleY(0)}
                        x2={localScaleX(250)}
                        y2={localScaleY(250)}
                        stroke="#9ca3af"
                        strokeDasharray="4 3"
                        strokeWidth={1.5}
                      />
                      {ecgPoints.map((p, idx) => (
                        <circle
                          key={idx}
                          cx={localScaleX(p.patron)}
                          cy={localScaleY(p.primera)}
                          r={3}
                          fill="#1d4ed8"
                        />
                      ))}
                      {ecgPoints.length > 1 && (
                        <polyline
                          fill="none"
                          stroke="#2563eb"
                          strokeWidth={1.5}
                          points={ecgPoints
                            .map(
                              (p) =>
                                `${localScaleX(p.patron)},${localScaleY(p.primera)}`,
                            )
                            .join(" ")}
                        />
                      )}
                    </svg>
                  );
                })()}
              </div>
            </div>
          )} */}

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

export default ReportePagina4;
