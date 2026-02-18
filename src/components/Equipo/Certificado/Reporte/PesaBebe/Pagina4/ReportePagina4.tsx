// ReportePagina3PesaBebe.tsx - VERSIÓN SSR SEGURA CON EJE Y EN DECIMALES
import React, { useMemo } from "react";
import backgroundCertificado from "@/assets/background/marcaReporte.png";
import { type CalibrationRow } from "@/Routes/Calibration/Equipos/Basculas/components/CalibrationTable";

interface ReportePagina4PesaBebeProps {
  calibrationData: CalibrationRow[];
  observaciones: string;
}

const ReportePagina4PesaBebe: React.FC<ReportePagina4PesaBebeProps> = ({
  calibrationData = [],
  observaciones,
}) => {
  const obsText =
    typeof observaciones === "string" && observaciones.trim() !== ""
      ? observaciones
      : "Sin observaciones registradas.";

  // Procesar datos
  const points = useMemo(() => {
    const validPoints = calibrationData
      .map((row) => {
        const carga = parseFloat(row.patron || "0");
        const error = parseFloat(row.error || "0");
        if (Number.isNaN(carga) || Number.isNaN(error)) return null;
        return { carga, error };
      })
      .filter(Boolean) as { carga: number; error: number }[];

    console.log("Valid points:", validPoints);
    return validPoints;
  }, [calibrationData]);

  // Configuración fija del SVG
  const svgWidth = 600;
  const svgHeight = 260;
  const margin = { top: 20, right: 20, bottom: 40, left: 60 };
  const axisMinX = 0;
  const axisMaxX = 20;

  // ✅ CAMBIO PRINCIPAL: Rango del eje Y con decimales para errores pequeños
  const axisMinY = -0.6; // Ajustado para errores pequeños
  const axisMaxY = 0.6;

  // Funciones de escala
  const scaleX = (x: number) =>
    ((x - axisMinX) / (axisMaxX - axisMinX)) *
      (svgWidth - margin.left - margin.right) +
    margin.left;

  const scaleY = (y: number) =>
    svgHeight -
    margin.bottom -
    ((y - axisMinY) / (axisMaxY - axisMinY)) *
      (svgHeight - margin.top - margin.bottom);

  // Generar polyline points
  const polylinePoints = points
    .map((p) => `${scaleX(p.carga).toFixed(1)},${scaleY(p.error).toFixed(1)}`)
    .join(" ");

  // ✅ TICKS MODIFICADOS: Eje X sin cambios, eje Y con decimales
  const xTicks = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
  const yTicks = [-0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6]; // Decimales cada 0.2 kg

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
              Gráfica de Carga aplicada vs Error obtenido para la báscula pesa
              bebé.
            </p>
          </div>

          <div className="section-block">
            <h3 className="result-subtitle">Relación Carga vs Error</h3>
            <div className="chart-container">
              {points.length === 0 ? (
                <p className="empty-row">
                  No hay datos suficientes para generar la gráfica.
                </p>
              ) : (
                <svg
                  width={svgWidth}
                  height={svgHeight}
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  xmlns="http://www.w3.org/2000/svg"
                  className="error-chart-svg"
                >
                  {/* Ejes principales */}
                  <line
                    x1={margin.left}
                    y1={svgHeight - margin.bottom}
                    x2={svgWidth - margin.right}
                    y2={svgHeight - margin.bottom}
                    stroke="#0f172a"
                    strokeWidth="1.5"
                  />
                  <line
                    x1={margin.left}
                    y1={margin.top}
                    x2={margin.left}
                    y2={svgHeight - margin.bottom}
                    stroke="#0f172a"
                    strokeWidth="1.5"
                  />

                  {/* Ticks X */}
                  {xTicks.map((tick) => {
                    const x = scaleX(tick);
                    return (
                      <g key={`xt-${tick}`}>
                        <line
                          x1={x}
                          y1={svgHeight - margin.bottom}
                          x2={x}
                          y2={svgHeight - margin.bottom + 6}
                          stroke="#0f172a"
                          strokeWidth="1"
                        />
                        <text
                          x={x}
                          y={svgHeight - margin.bottom + 20}
                          textAnchor="middle"
                          fontSize="10"
                          fill="#0f172a"
                          fontFamily="Arial, sans-serif"
                        >
                          {tick}
                        </text>
                      </g>
                    );
                  })}

                  {/* ✅ Ticks Y CON DECIMALES + Grid */}
                  {yTicks.map((tick) => {
                    const y = scaleY(tick);
                    return (
                      <g key={`yt-${tick}`}>
                        <line
                          x1={margin.left - 6}
                          y1={y}
                          x2={margin.left}
                          y2={y}
                          stroke="#0f172a"
                          strokeWidth="1"
                        />
                        <text
                          x={margin.left - 10}
                          y={y + 3}
                          textAnchor="end"
                          fontSize="10"
                          fill="#0f172a"
                          fontFamily="Arial, sans-serif"
                        >
                          {tick.toFixed(1)}
                        </text>
                        {/* Grid horizontal */}
                        <line
                          x1={margin.left}
                          y1={y}
                          x2={svgWidth - margin.right}
                          y2={y}
                          stroke="#e5e7eb"
                          strokeWidth="0.8"
                        />
                      </g>
                    );
                  })}

                  {/* Etiquetas de ejes */}
                  <text
                    x={svgWidth / 2}
                    y={svgHeight - 8}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="bold"
                    fill="#0f172a"
                    fontFamily="Arial, sans-serif"
                  >
                    Carga patrón (kg)
                  </text>
                  <text
                    x={10}
                    y={svgHeight / 2}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="bold"
                    fill="#0f172a"
                    fontFamily="Arial, sans-serif"
                    transform={`rotate(-90 10 ${svgHeight / 2})`}
                  >
                    Error (kg)
                  </text>

                  {/* Línea cero (referencia) */}
                  <line
                    x1={margin.left}
                    y1={scaleY(0)}
                    x2={svgWidth - margin.right}
                    y2={scaleY(0)}
                    stroke="#9ca3af"
                    strokeDasharray="4,4"
                    strokeWidth="2"
                  />

                  {/* Línea de datos */}
                  {points.length > 1 && (
                    <polyline
                      points={polylinePoints}
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* Puntos de datos */}
                  {points.map((point, index) => (
                    <g key={`point-${index}`}>
                      <circle
                        cx={scaleX(point.carga)}
                        cy={scaleY(point.error)}
                        r="4"
                        fill="#1d4ed8"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                    </g>
                  ))}
                </svg>
              )}
            </div>
          </div>

          {/* Observaciones */}
          <div className="section-block mt-large">
            <h3 className="result-subtitle">OBSERVACIONES DEL METRÓLOGO</h3>
            <div className="observations-box">
              <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{obsText}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportePagina4PesaBebe;
