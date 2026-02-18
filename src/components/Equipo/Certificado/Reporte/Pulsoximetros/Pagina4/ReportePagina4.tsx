import React, { useMemo } from "react";
import backgroundCertificado from "@/assets/background/marcaReporte.png";
import { type PulsoximetroRow } from "@/Routes/Calibration/Equipos/Pulsoximetro/components/PulsoximetroTable";

interface ReportePagina4Props {
  calibrationData: PulsoximetroRow[];
  observaciones: string;
}

const ReportePagina4Pulsoximetro: React.FC<ReportePagina4Props> = ({
  calibrationData,
  observaciones,
}) => {
  // Separar datos por tipo (SPO2_PERCENT y SPO2_FP)
  const spo2Percent = useMemo(
    () => calibrationData.filter((r) => r.tipo === "SPO2_PERCENT"),
    [calibrationData],
  );

  const spo2FP = useMemo(
    () => calibrationData.filter((r) => r.tipo === "SPO2_FP"),
    [calibrationData],
  );

  // Convertir a puntos para gráfico - SpO2 (%)
  const pointsPercent = useMemo(
    () =>
      spo2Percent
        .map((row) => {
          const patron = parseFloat(
            String(row.patron || "0").replace(",", "."),
          );
          const error = parseFloat(
            String(row.errorPromedio || "0").replace(",", "."),
          );
          if (Number.isNaN(patron) || Number.isNaN(error)) return null;
          return { patron, error };
        })
        .filter(Boolean) as { patron: number; error: number }[],
    [spo2Percent],
  );

  // Convertir a puntos para gráfico - SpO2 (FP)
  const pointsFP = useMemo(
    () =>
      spo2FP
        .map((row) => {
          const patron = parseFloat(
            String(row.patron || "0").replace(",", "."),
          );
          const error = parseFloat(
            String(row.errorPromedio || "0").replace(",", "."),
          );
          if (Number.isNaN(patron) || Number.isNaN(error)) return null;
          return { patron, error };
        })
        .filter(Boolean) as { patron: number; error: number }[],
    [spo2FP],
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
              ANÁLISIS GRÁFICO DE LA EXACTITUD (PULSOXÍMETRO)
            </h2>
            <p className="justify-text intro-text">
              Las siguientes gráficas muestran la relación entre el valor patrón
              y el error promedio obtenido para SpO2 (%) y SpO2 (FP) del
              pulsoxímetro bajo calibración.
            </p>
          </div>

          {/* Gráfico SpO2 (%) */}
          <div className="section-block">
            <h3 className="result-subtitle">SpO2 (%): Patrón vs Error</h3>
            <div className="chart-container">
              {(() => {
                // Rangos automáticos basados en los datos
                const allPatronPercent = pointsPercent.map((p) => p.patron);
                const allErrorPercent = pointsPercent.map((p) => p.error);

                // Forzar el mínimo del eje X a 85
                const axisMinX = 85;
                // Extender el máximo ligeramente más allá del valor máximo para dar espacio visual
                const dataMaxX =
                  allPatronPercent.length > 0
                    ? Math.max(...allPatronPercent)
                    : 100;
                // Agregar 1% de padding al rango para que el último punto sea visible
                const axisMaxX = dataMaxX + (dataMaxX - axisMinX) * 0.5;

                const axisMinY =
                  allErrorPercent.length > 0
                    ? Math.floor(Math.min(...allErrorPercent, -3) / 1) * 1
                    : -5;
                const axisMaxY =
                  allErrorPercent.length > 0
                    ? Math.ceil(Math.max(...allErrorPercent, 3) / 1) * 1
                    : 5;

                const localScaleX = (x: number) =>
                  ((x - axisMinX) / (axisMaxX - axisMinX || 1)) *
                    (svgWidth - margin.left - margin.right) +
                  margin.left;

                const localScaleY = (y: number) =>
                  svgHeight -
                  margin.bottom -
                  ((y - axisMinY) / (axisMaxY - axisMinY || 1)) *
                    (svgHeight - margin.top - margin.bottom);

                if (pointsPercent.length === 0) {
                  return (
                    <p className="empty-row">
                      No hay datos suficientes para generar la gráfica de SpO2
                      (%).
                    </p>
                  );
                }

                // Generar ticks dinámicos - siempre terminar en 100
                const xTickCount = 12;
                const yTickCount = 12;
                // Forzar que los ticks vayan de 85 a 100
                const xStep = (100 - axisMinX) / (xTickCount - 1);
                const yStep = (axisMaxY - axisMinY) / (yTickCount - 1);
                const xTicks = Array.from({ length: xTickCount }, (_, i) =>
                  Math.round(axisMinX + i * xStep),
                );
                const yTicks = Array.from(
                  { length: yTickCount },
                  (_, i) => Math.round((axisMinY + i * yStep) * 2) / 2,
                );

                return (
                  <svg
                    width={svgWidth}
                    height={svgHeight}
                    className="error-chart-svg"
                  >
                    {/* Ejes principales */}
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
                      SpO2 patrón (%)
                    </text>
                    <text
                      x={14}
                      y={svgHeight / 2}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#0f172a"
                      transform={`rotate(-90 14 ${svgHeight / 2})`}
                    >
                      Error (%)
                    </text>

                    {/* Líneas de guía desde puntos */}
                    {pointsPercent.map((p, idx) => (
                      <line
                        key={`vx-percent-${idx}`}
                        x1={localScaleX(p.patron)}
                        y1={margin.top}
                        x2={localScaleX(p.patron)}
                        y2={svgHeight - margin.bottom}
                        stroke="#d1d5db"
                        strokeWidth={0.7}
                        strokeDasharray="4 3"
                      />
                    ))}
                    {pointsPercent.map((p, idx) => (
                      <line
                        key={`hy-percent-${idx}`}
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
                    {pointsPercent.length > 1 && (
                      <polyline
                        fill="none"
                        stroke="#dc2626"
                        strokeWidth={2}
                        points={pointsPercent
                          .map(
                            (p) =>
                              `${localScaleX(p.patron)},${localScaleY(p.error)}`,
                          )
                          .join(" ")}
                      />
                    )}

                    {/* Puntos */}
                    {pointsPercent.map((p, idx) => (
                      <circle
                        key={`pt-percent-${idx}`}
                        cx={localScaleX(p.patron)}
                        cy={localScaleY(p.error)}
                        r={4}
                        fill="#dc2626"
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
                  </svg>
                );
              })()}
            </div>
          </div>

          {/* Gráfico SpO2 (FP) */}
          <div className="section-block">
            <h3 className="result-subtitle">SpO2 (FP): Patrón vs Error</h3>

            <div className="chart-container">
              {(() => {
                const allPatronFP = pointsFP.map((p) => p.patron);
                const allErrorFP = pointsFP.map((p) => p.error);

                // Forzar el mínimo del eje X a 30
                const axisMinX = 30;
                // Extender el máximo ligeramente más allá del valor máximo para dar espacio visual
                const dataMaxX =
                  allPatronFP.length > 0 ? Math.max(...allPatronFP) : 100;
                // Agregar 1% de padding al rango para que el último punto sea visible
                const axisMaxX = dataMaxX + (dataMaxX - axisMinX) * 0.5;

                const axisMinY =
                  allErrorFP.length > 0
                    ? Math.floor(Math.min(...allErrorFP, -3) / 1) * 1
                    : -5;
                const axisMaxY =
                  allErrorFP.length > 0
                    ? Math.ceil(Math.max(...allErrorFP, 3) / 1) * 1
                    : 5;

                const localScaleX = (x: number) =>
                  ((x - axisMinX) / (axisMaxX - axisMinX || 1)) *
                    (svgWidth - margin.left - margin.right) +
                  margin.left;

                const localScaleY = (y: number) =>
                  svgHeight -
                  margin.bottom -
                  ((y - axisMinY) / (axisMaxY - axisMinY || 1)) *
                    (svgHeight - margin.top - margin.bottom);

                if (pointsFP.length === 0) {
                  return (
                    <p className="empty-row">
                      No hay datos suficientes para generar la gráfica de SpO2
                      (FP).
                    </p>
                  );
                }

                // Generar ticks dinámicos
                const xTickCount = 12;
                const yTickCount = 12;
                const xStep = (axisMaxX - axisMinX) / (xTickCount - 1);
                const yStep = (axisMaxY - axisMinY) / (yTickCount - 1);
                const xTicks = Array.from({ length: xTickCount }, (_, i) =>
                  Math.round(axisMinX + i * xStep),
                );
                const yTicks = Array.from(
                  { length: yTickCount },
                  (_, i) => Math.round((axisMinY + i * yStep) * 2) / 2,
                );

                return (
                  <svg
                    width={svgWidth}
                    height={svgHeight}
                    className="error-chart-svg"
                  >
                    {/* Ejes principales */}
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
                      SpO2 patrón (FP - bpm)
                    </text>
                    <text
                      x={14}
                      y={svgHeight / 2}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#0f172a"
                      transform={`rotate(-90 14 ${svgHeight / 2})`}
                    >
                      Error (bpm)
                    </text>

                    {/* Líneas de guía desde puntos */}
                    {pointsFP.map((p, idx) => (
                      <line
                        key={`vx-fp-${idx}`}
                        x1={localScaleX(p.patron)}
                        y1={margin.top}
                        x2={localScaleX(p.patron)}
                        y2={svgHeight - margin.bottom}
                        stroke="#d1d5db"
                        strokeWidth={0.7}
                        strokeDasharray="4 3"
                      />
                    ))}
                    {pointsFP.map((p, idx) => (
                      <line
                        key={`hy-fp-${idx}`}
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
                    {pointsFP.length > 1 && (
                      <polyline
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth={2}
                        points={pointsFP
                          .map(
                            (p) =>
                              `${localScaleX(p.patron)},${localScaleY(p.error)}`,
                          )
                          .join(" ")}
                      />
                    )}

                    {/* Puntos */}
                    {pointsFP.map((p, idx) => (
                      <circle
                        key={`pt-fp-${idx}`}
                        cx={localScaleX(p.patron)}
                        cy={localScaleY(p.error)}
                        r={4}
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
                  </svg>
                );
              })()}
            </div>
          </div>

          {/* Observaciones del metrólogo */}
        </div>
      </div>
    </div>
  );
};

export default ReportePagina4Pulsoximetro;
