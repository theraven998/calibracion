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
  // Normalizar datos del sensor interno
  const pointsInterno = useMemo(() => {
    if (!sensorInterno) return [];
    return sensorInterno.data
      .map((row) => {
        const temp = parseFloat(row.patron || "0");
        const error = row.error;
        if (Number.isNaN(temp) || error === null || Number.isNaN(error))
          return null;
        return { temp, error };
      })
      .filter(Boolean) as { temp: number; error: number }[];
  }, [sensorInterno]);

  // Normalizar datos del sensor externo
  const pointsExterno = useMemo(() => {
    if (!sensorExterno) return [];
    return sensorExterno.data
      .map((row) => {
        const temp = parseFloat(row.patron || "0");
        const error = row.error;
        if (Number.isNaN(temp) || error === null || Number.isNaN(error))
          return null;
        return { temp, error };
      })
      .filter(Boolean) as { temp: number; error: number }[];
  }, [sensorExterno]);

  // Dimensiones más pequeñas para los gráficos
  const svgWidth = 480;
  const svgHeight = 220;
  const margin = { top: 15, right: 15, bottom: 40, left: 60 };

  // Función para renderizar un gráfico
  const renderChart = (
    points: { temp: number; error: number }[],
    title: string,
    axisMinX: number,
    axisMaxX: number,
    axisMinY: number,
    axisMaxY: number,
    xStep: number = 5,
    yStep: number = 0.1,
  ) => {
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
        <div className="chart-wrapper">
          <h3 className="chart-title">{title}</h3>
          <p className="empty-row">
            No hay datos suficientes para generar la gráfica.
          </p>
        </div>
      );
    }

    // Generar ticks dinámicamente
    const xTicks: number[] = [];
    for (let t = axisMinX; t <= axisMaxX; t += xStep) {
      xTicks.push(parseFloat(t.toFixed(2)));
    }

    const yTicks: number[] = [];
    for (let t = axisMinY; t <= axisMaxY; t += yStep) {
      yTicks.push(parseFloat(t.toFixed(2)));
    }

    return (
      <div className="chart-wrapper">
        <h3 className="chart-title">{title}</h3>
        <div className="chart-container">
          <svg width={svgWidth} height={svgHeight} className="error-chart-svg">
            {/* Ejes principales */}
            <line
              x1={margin.left}
              y1={svgHeight - margin.bottom}
              x2={svgWidth - margin.right}
              y2={svgHeight - margin.bottom}
              stroke="#0f172a"
              strokeWidth={2}
            />
            <line
              x1={margin.left}
              y1={margin.top}
              x2={margin.left}
              y2={svgHeight - margin.bottom}
              stroke="#0f172a"
              strokeWidth={2}
            />

            {/* Ticks y grilla del eje X */}
            {xTicks.map((t) => (
              <g key={`x-${t}`}>
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
                  fontWeight="500"
                >
                  {t.toFixed(1)}
                </text>
                <line
                  x1={localScaleX(t)}
                  y1={margin.top}
                  x2={localScaleX(t)}
                  y2={svgHeight - margin.bottom}
                  stroke="#e5e7eb"
                  strokeWidth={0.5}
                />
              </g>
            ))}

            {/* Ticks y grilla del eje Y */}
            {yTicks.map((t) => (
              <g key={`y-${t}`}>
                <line
                  x1={margin.left - 6}
                  y1={localScaleY(t)}
                  x2={margin.left}
                  y2={localScaleY(t)}
                  stroke="#0f172a"
                  strokeWidth={1}
                />
                <text
                  x={margin.left - 10}
                  y={localScaleY(t) + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill="#0f172a"
                  fontWeight="500"
                >
                  {t.toFixed(2)}
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

            {/* Etiquetas de los ejes */}
            <text
              x={svgWidth / 2}
              y={svgHeight - 8}
              textAnchor="middle"
              fontSize="11"
              fill="#0f172a"
              fontWeight="600"
            >
              Temperatura patrón (°C)
            </text>
            <text
              x={18}
              y={svgHeight / 2}
              textAnchor="middle"
              fontSize="11"
              fill="#0f172a"
              fontWeight="600"
              transform={`rotate(-90 18 ${svgHeight / 2})`}
            >
              Error (°C)
            </text>

            {/* Línea de error cero */}
            <line
              x1={margin.left}
              y1={localScaleY(0)}
              x2={svgWidth - margin.right}
              y2={localScaleY(0)}
              stroke="#dc2626"
              strokeDasharray="5 5"
              strokeWidth={1.5}
            />

            {/* Líneas verticales desde cada punto */}
            {points.map((p, idx) => (
              <line
                key={`vline-${idx}`}
                x1={localScaleX(p.temp)}
                y1={margin.top}
                x2={localScaleX(p.temp)}
                y2={svgHeight - margin.bottom}
                stroke="#d1d5db"
                strokeWidth={0.5}
                strokeDasharray="3 3"
              />
            ))}

            {/* Líneas horizontales desde cada punto */}
            {points.map((p, idx) => (
              <line
                key={`hline-${idx}`}
                x1={margin.left}
                y1={localScaleY(p.error)}
                x2={svgWidth - margin.right}
                y2={localScaleY(p.error)}
                stroke="#d1d5db"
                strokeWidth={0.5}
                strokeDasharray="3 3"
              />
            ))}

            {/* Línea que une los puntos */}
            {points.length > 1 && (
              <polyline
                fill="none"
                stroke="#2563eb"
                strokeWidth={2}
                points={points
                  .map((p) => `${localScaleX(p.temp)},${localScaleY(p.error)}`)
                  .join(" ")}
              />
            )}

            {/* Puntos de datos */}
            {points.map((p, idx) => (
              <circle
                key={`point-${idx}`}
                cx={localScaleX(p.temp)}
                cy={localScaleY(p.error)}
                r={4}
                fill="#1d4ed8"
                stroke="#fff"
                strokeWidth={1.5}
              />
            ))}
          </svg>
        </div>
      </div>
    );
  };
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
    return "RESULTADOS DE CALIBRACIÓN – TERMÓMETRO INFRARROJO";
  };

  return (
    <div className="page report-page">
      <div
        className="watermark-bg"
        style={{ backgroundImage: `url(${backgroundCertificado})` }}
      >
        <div className="content">
          <h2 className="main-title-results">{getTitulo()}</h2>
          {/* Temperatura: Sensor interno */}

          {/* Temperatura: Sensor externo */}
          {sensorExterno &&
            renderSection(sensorExterno, "°C", "Temperatura – Sensor externo")}

          {/* Gráfico Sensor Externo */}
          {renderChart(
            pointsExterno,
            "Sensor Externo - Temperatura vs Error",
            0, // minX
            10, // maxX
            -0.05, // minY
            0.15, // maxY
            2, // step X
            0.05, // step Y
          )}

          <div className="observations-box mt-large">
            <h4>NOTAS</h4>
            <p>
              Los errores indicados incluyen las correcciones debidas al equipo
              patrón utilizado. La incertidumbre expandida corresponde a un
              factor de cobertura k = 2, equivalente a un nivel de confianza
              aproximado del 95 %.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportePagina3;
