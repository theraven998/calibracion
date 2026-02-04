import React, { useMemo } from "react";
import backgroundCertificado from "@/assets/background/marcaReporte.png";
import { type ExactitudRow } from "@/Routes/Calibration/Equipos/TensiometroDigital/components/ExactitudTable";

interface ReportePagina3Props {
  calibrationData: ExactitudRow[];
  observaciones: string;
}

const ReportePagina3: React.FC<ReportePagina3Props> = ({
  calibrationData,
  observaciones,
}) => {
  // Separar datos por tipo (SISTOLICA y DIASTOLICA)
  const sistolica = useMemo(
    () => calibrationData.filter((r) => r.tipo === "SISTOLICA"),
    [calibrationData]
  );

  const diastolica = useMemo(
    () => calibrationData.filter((r) => r.tipo === "DIASTOLICA"),
    [calibrationData]
  );

  // Convertir a puntos para gráfico - Sistólica
  const pointsSis = useMemo(
    () =>
      sistolica
        .map((row) => {
          const patron = parseFloat(
            String(row.patron || "0").replace(",", ".")
          );
          const error = parseFloat(
            String(row.errorPromedio || "0").replace(",", ".")
          );
          if (Number.isNaN(patron) || Number.isNaN(error)) return null;
          return { patron, error };
        })
        .filter(Boolean) as { patron: number; error: number }[],
    [sistolica]
  );

  // Convertir a puntos para gráfico - Diastólica
  const pointsDia = useMemo(
    () =>
      diastolica
        .map((row) => {
          const patron = parseFloat(
            String(row.patron || "0").replace(",", ".")
          );
          const error = parseFloat(
            String(row.errorPromedio || "0").replace(",", ".")
          );
          if (Number.isNaN(patron) || Number.isNaN(error)) return null;
          return { patron, error };
        })
        .filter(Boolean) as { patron: number; error: number }[],
    [diastolica]
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
              ANÁLISIS GRÁFICO DE LA EXACTITUD (NIBP)
            </h2>
            <p className="justify-text intro-text">
              Las siguientes gráficas muestran la relación entre la presión
              patrón y el error promedio obtenido para presión sistólica y
              diastólica del tensiómetro digital bajo calibración.
            </p>
          </div>

          {/* Gráfico Sistólica */}
          <div className="section-block">
            <h3 className="result-subtitle">
              Presión Sistólica: Patrón vs Error
            </h3>

            <div className="chart-container">
              {(() => {
                // Rangos automáticos basados en los datos
                const allPatronSis = pointsSis.map((p) => p.patron);
                const allErrorSis = pointsSis.map((p) => p.error);

                const axisMinX =
                  allPatronSis.length > 0
                    ? Math.floor(Math.min(...allPatronSis) / 10) * 10
                    : 0;
                const axisMaxX =
                  allPatronSis.length > 0
                    ? Math.ceil(Math.max(...allPatronSis) / 10) * 10
                    : 200;
                const axisMinY =
                  allErrorSis.length > 0
                    ? Math.floor(Math.min(...allErrorSis, -5) / 5) * 5
                    : -15;
                const axisMaxY =
                  allErrorSis.length > 0
                    ? Math.ceil(Math.max(...allErrorSis, 5) / 5) * 5
                    : 15;

                const localScaleX = (x: number) =>
                  ((x - axisMinX) / (axisMaxX - axisMinX || 1)) *
                    (svgWidth - margin.left - margin.right) +
                  margin.left;

                const localScaleY = (y: number) =>
                  svgHeight -
                  margin.bottom -
                  ((y - axisMinY) / (axisMaxY - axisMinY || 1)) *
                    (svgHeight - margin.top - margin.bottom);

                if (pointsSis.length === 0) {
                  return (
                    <p className="empty-row">
                      No hay datos suficientes para generar la gráfica de
                      presión sistólica.
                    </p>
                  );
                }

                // Generar ticks dinámicos
                const xTickCount = 6;
                const yTickCount = 7;
                const xStep = (axisMaxX - axisMinX) / (xTickCount - 1);
                const yStep = (axisMaxY - axisMinY) / (yTickCount - 1);
                const xTicks = Array.from({ length: xTickCount }, (_, i) =>
                  Math.round(axisMinX + i * xStep)
                );
                const yTicks = Array.from(
                  { length: yTickCount },
                  (_, i) => Math.round((axisMinY + i * yStep) * 2) / 2
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
                      Presión patrón (mmHg)
                    </text>
                    <text
                      x={14}
                      y={svgHeight / 2}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#0f172a"
                      transform={`rotate(-90 14 ${svgHeight / 2})`}
                    >
                      Error (mmHg)
                    </text>

                    {/* Líneas de guía desde puntos */}
                    {pointsSis.map((p, idx) => (
                      <line
                        key={`vx-sis-${idx}`}
                        x1={localScaleX(p.patron)}
                        y1={margin.top}
                        x2={localScaleX(p.patron)}
                        y2={svgHeight - margin.bottom}
                        stroke="#d1d5db"
                        strokeWidth={0.7}
                        strokeDasharray="4 3"
                      />
                    ))}
                    {pointsSis.map((p, idx) => (
                      <line
                        key={`hy-sis-${idx}`}
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
                    {pointsSis.length > 1 && (
                      <polyline
                        fill="none"
                        stroke="#dc2626"
                        strokeWidth={2}
                        points={pointsSis
                          .map(
                            (p) =>
                              `${localScaleX(p.patron)},${localScaleY(p.error)}`
                          )
                          .join(" ")}
                      />
                    )}

                    {/* Puntos */}
                    {pointsSis.map((p, idx) => (
                      <circle
                        key={`pt-sis-${idx}`}
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

          {/* Gráfico Diastólica */}
          <div className="section-block">
            <h3 className="result-subtitle">
              Presión Diastólica: Patrón vs Error
            </h3>

            <div className="chart-container">
              {(() => {
                const allPatronDia = pointsDia.map((p) => p.patron);
                const allErrorDia = pointsDia.map((p) => p.error);

                const axisMinX =
                  allPatronDia.length > 0
                    ? Math.floor(Math.min(...allPatronDia) / 10) * 10
                    : 0;
                const axisMaxX =
                  allPatronDia.length > 0
                    ? Math.ceil(Math.max(...allPatronDia) / 10) * 10
                    : 150;
                const axisMinY =
                  allErrorDia.length > 0
                    ? Math.floor(Math.min(...allErrorDia, -5) / 5) * 5
                    : -15;
                const axisMaxY =
                  allErrorDia.length > 0
                    ? Math.ceil(Math.max(...allErrorDia, 5) / 5) * 5
                    : 15;

                const localScaleX = (x: number) =>
                  ((x - axisMinX) / (axisMaxX - axisMinX || 1)) *
                    (svgWidth - margin.left - margin.right) +
                  margin.left;

                const localScaleY = (y: number) =>
                  svgHeight -
                  margin.bottom -
                  ((y - axisMinY) / (axisMaxY - axisMinY || 1)) *
                    (svgHeight - margin.top - margin.bottom);

                if (pointsDia.length === 0) {
                  return (
                    <p className="empty-row">
                      No hay datos suficientes para generar la gráfica de
                      presión diastólica.
                    </p>
                  );
                }

                const xTickCount = 6;
                const yTickCount = 7;
                const xStep = (axisMaxX - axisMinX) / (xTickCount - 1);
                const yStep = (axisMaxY - axisMinY) / (yTickCount - 1);
                const xTicks = Array.from({ length: xTickCount }, (_, i) =>
                  Math.round(axisMinX + i * xStep)
                );
                const yTicks = Array.from(
                  { length: yTickCount },
                  (_, i) => Math.round((axisMinY + i * yStep) * 2) / 2
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
                      Presión patrón (mmHg)
                    </text>
                    <text
                      x={14}
                      y={svgHeight / 2}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#0f172a"
                      transform={`rotate(-90 14 ${svgHeight / 2})`}
                    >
                      Error (mmHg)
                    </text>

                    {/* Líneas de guía desde puntos */}
                    {pointsDia.map((p, idx) => (
                      <line
                        key={`vx-dia-${idx}`}
                        x1={localScaleX(p.patron)}
                        y1={margin.top}
                        x2={localScaleX(p.patron)}
                        y2={svgHeight - margin.bottom}
                        stroke="#d1d5db"
                        strokeWidth={0.7}
                        strokeDasharray="4 3"
                      />
                    ))}
                    {pointsDia.map((p, idx) => (
                      <line
                        key={`hy-dia-${idx}`}
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
                    {pointsDia.length > 1 && (
                      <polyline
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth={2}
                        points={pointsDia
                          .map(
                            (p) =>
                              `${localScaleX(p.patron)},${localScaleY(p.error)}`
                          )
                          .join(" ")}
                      />
                    )}

                    {/* Puntos */}
                    {pointsDia.map((p, idx) => (
                      <circle
                        key={`pt-dia-${idx}`}
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

export default ReportePagina3;
