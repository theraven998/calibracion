// src/components/Equipo/Certificado/Reporte/Basculas/Pagina3/ReportePagina3.tsx
import React, { useMemo } from "react";
import "./ReportePagina3.css";
import backgroundCertificado from "@/assets/background/marcaReporte.png";
import { type CalibrationRow } from "@/Routes/Calibration/Equipos/Basculas/components/CalibrationTable";

interface ReportePagina3Props {
  calibrationData: CalibrationRow[];
  observaciones: string;
}

const ReportePagina3: React.FC<ReportePagina3Props> = ({
  calibrationData = [],
  observaciones,
}) => {
  // Normalizamos datos para el gráfico
  const points = useMemo(
    () =>
      calibrationData
        .map((row) => {
          const carga = parseFloat(row.patron || "0");
          const error = parseFloat(row.error || "0");
          if (Number.isNaN(carga) || Number.isNaN(error)) return null;
          return { carga, error };
        })
        .filter(Boolean) as { carga: number; error: number }[],
    [calibrationData]
  );

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
            <h2 className="main-title-results">
              ANÁLISIS GRÁFICO DE LA EXACTITUD
            </h2>
            <p className="justify-text intro-text">
              La siguiente gráfica muestra la relación entre la carga aplicada y
              el error obtenido para la báscula bajo calibración.
            </p>
          </div>

          {/* Gráfico carga vs error */}
          <div className="section-block">
            <h3 className="result-subtitle">Relación Carga vs Error</h3>

            <div className="chart-container">
              {(() => {
                // Rangos fijos del gráfico (ajústalos si quieres otro zoom)
                const axisMinX = 0;
                const axisMaxX = 35;
                const axisMinY = -10;
                const axisMaxY = 10;

                const localScaleX = (x: number) =>
                  ((x - axisMinX) / (axisMaxX - axisMinX || 1)) *
                    (svgWidth - margin.left - margin.right) +
                  margin.left;

                const localScaleY = (y: number) =>
                  svgHeight -
                  margin.bottom -
                  ((y - axisMinY) / (axisMaxY - axisMinY || 1)) *
                    (svgHeight - margin.top - margin.bottom);

                if (points.length === 0) {
                  return (
                    <p className="empty-row">
                      No hay datos suficientes para generar la gráfica.
                    </p>
                  );
                }

                const xTicks = [0, 5, 10, 15, 20, 25, 30, 35];
                const yTicks = [-10, -5, 0, 5, 10];

                return (
                  <svg
                    width={svgWidth}
                    height={svgHeight}
                    className="error-chart-svg"
                  >
                    {/* Ejes */}
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
                    {/* Ticks X */}
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
                    {/* Ticks Y + líneas de grilla */}
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
                    {/* Etiquetas de ejes */}
                    <text
                      x={svgWidth / 2}
                      y={svgHeight - 8}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#0f172a"
                    >
                      Carga patrón (kg)
                    </text>
                    <text
                      x={14}
                      y={svgHeight / 2}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#0f172a"
                      transform={`rotate(-90 14 ${svgHeight / 2})`}
                    >
                      Error (kg)
                    </text>
                    {/* Línea que une los puntos */}
                    {points.length > 1 && (
                      <polyline
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth={1.5}
                        points={points
                          .map(
                            (p) =>
                              `${localScaleX(p.carga)},${localScaleY(p.error)}`
                          )
                          .join(" ")}
                      />
                    )}
                    {/* Puntos */}
                    {points.map((p, idx) => (
                      <circle
                        key={idx}
                        cx={localScaleX(p.carga)}
                        cy={localScaleY(p.error)}
                        r={3}
                        fill="#1d4ed8"
                      />
                    ))}
                    {points.map((p, idx) => (
                      <line
                        key={`vx-${idx}`}
                        x1={localScaleX(p.carga)}
                        y1={margin.top}
                        x2={localScaleX(p.carga)}
                        y2={svgHeight - margin.bottom}
                        stroke="#d1d5db" // gris claro
                        strokeWidth={0.7}
                        strokeDasharray="4 3"
                      />
                    ))}
                    {points.map((p, idx) => (
                      <line
                        key={`hy-${idx}`}
                        x1={margin.left}
                        y1={localScaleY(p.error)}
                        x2={svgWidth - margin.right}
                        y2={localScaleY(p.error)}
                        stroke="#e5e7eb"
                        strokeWidth={0.7}
                        strokeDasharray="4 3"
                      />
                    ))}
                    {/* Línea que une los puntos */}
                    {points.length > 1 && (
                      <polyline
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth={1.5}
                        points={points
                          .map(
                            (p) =>
                              `${localScaleX(p.carga)},${localScaleY(p.error)}`
                          )
                          .join(" ")}
                      />
                    )}

                    {/* Puntos */}
                    {points.map((p, idx) => (
                      <circle
                        key={`pt-${idx}`}
                        cx={localScaleX(p.carga)}
                        cy={localScaleY(p.error)}
                        r={3}
                        fill="#1d4ed8"
                      />
                    ))}

                    {/* Línea de error cero */}
                    <line
                      x1={margin.left}
                      y1={localScaleY(0)}
                      x2={svgWidth - margin.right}
                      y2={localScaleY(0)}
                      stroke="#9ca3af"
                      strokeDasharray="4 3"
                      strokeWidth={1.5}
                    />
                    <text
                      x={margin.left + 4}
                      y={localScaleY(0) - 6}
                      fontSize="10"
                      fill="#6b7280"
                    ></text>
                  </svg>
                );
              })()}
            </div>
          </div>

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

export default ReportePagina3;
