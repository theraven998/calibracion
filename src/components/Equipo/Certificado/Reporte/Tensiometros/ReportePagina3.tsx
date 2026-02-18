// @/components/Equipo/Certificado/Reporte/Tensiometros/Pagina3/ReportePagina3.tsx
import React, { useMemo } from "react";
import backgroundReporte from "@/assets/background/marcaReporte.png";
import "./ReportePagina2.css";
type PressureRow = {
  punto: number;
  primera: number;
  segunda: number;
};

type Props = {
  rows: PressureRow[];
  observaciones: string;
};

function isNum(n: any): n is number {
  return typeof n === "number" && Number.isFinite(n);
}

export default function ReportePagina3({
  rows,
  observaciones,
}: Props) {
  const tableRows = useMemo(() => {
    return (rows || []).map((r) => {
      const punto = Number(r.punto);
      const primera = Number(r.primera);
      const segunda = Number(r.segunda);
      const promedio =
        isNum(primera) && isNum(segunda) ? (primera + segunda) / 2 : NaN;
      const lecturaRef = promedio;
      const error =
        isNum(lecturaRef) && isNum(punto) ? lecturaRef - punto : NaN;

      return { punto, primera, segunda, promedio, error };
    });
  }, [rows]);

  const chartPoints = useMemo(() => {
    return tableRows
      .map((r) => {
        if (!isNum(r.punto) || !isNum(r.error)) return null;
        return { x: r.punto, y: r.error };
      })
      .filter(Boolean) as { x: number; y: number }[];
  }, [tableRows]);

  // Config SVG
  const svgWidth = 640;
  const svgHeight = 260;
  const margin = { top: 18, right: 18, bottom: 38, left: 60 };

  const xMin =
    chartPoints.length === 0 ? 0 : Math.min(...chartPoints.map((p) => p.x));
  const xMax =
    chartPoints.length === 0 ? 300 : Math.max(...chartPoints.map((p) => p.x));
  const yAbsMax =
    chartPoints.length === 0
      ? 5
      : Math.max(...chartPoints.map((p) => Math.abs(p.y)), 1);
  const yMin = -Math.ceil(yAbsMax);
  const yMax = Math.ceil(yAbsMax);

  const scaleX = (x: number) =>
    ((x - xMin) / (xMax - xMin || 1)) *
      (svgWidth - margin.left - margin.right) +
    margin.left;

  const scaleY = (y: number) =>
    svgHeight -
    margin.bottom -
    ((y - yMin) / (yMax - yMin || 1)) *
      (svgHeight - margin.top - margin.bottom);

  const xTicks =
    chartPoints.length === 0
      ? [0, 50, 100, 150, 200, 250, 300]
      : (() => {
          const n = 6;
          const step = (xMax - xMin) / n || 1;
          return Array.from(
            { length: n + 1 },
            (_, i) => Math.round((xMin + step * i) * 10) / 10,
          );
        })();

  const yTicks = (() => {
    const n = 4;
    const step = (yMax - yMin) / n || 1;
    return Array.from(
      { length: n + 1 },
      (_, i) => Math.round((yMin + step * i) * 10) / 10,
    );
  })();

  const polylinePoints = (() => {
    const sorted = [...chartPoints].sort((a, b) => a.x - b.x);
    return sorted.map((p) => `${scaleX(p.x)},${scaleY(p.y)}`).join(" ");
  })();

  return (
    <div className="page report-page">
      <div
        className="watermark-bg"
        style={{ backgroundImage: `url(${backgroundReporte})` }}
      >
        <div className="content">
          <div className="section-block mt-large">
            <h3 className="result-subtitle">2. Gráfica de Punto vs Error</h3>
            <p className="chart-description">
              Esta gráfica muestra la relación entre el punto aplicado (en mmHg)
              y el error de medición. Cada punto en la gráfica representa un
              conjunto de mediciones, donde el eje X indica el punto aplicado y
              el eje Y muestra el error calculado. Un error cercano a cero
              indica una medición precisa.
            </p>
            <div className="chart-container">
              {chartPoints.length === 0 ? (
                <p className="empty-row">
                  No hay datos suficientes para generar la gráfica.
                </p>
              ) : (
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
                    <g key={`xt-${t}`}>
                      <line
                        x1={scaleX(t)}
                        y1={svgHeight - margin.bottom}
                        x2={scaleX(t)}
                        y2={svgHeight - margin.bottom + 6}
                        stroke="#0f172a"
                        strokeWidth={1}
                      />
                      <text
                        x={scaleX(t)}
                        y={svgHeight - margin.bottom + 18}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#0f172a"
                      >
                        {t}
                      </text>
                    </g>
                  ))}

                  {/* Ticks Y + grilla */}
                  {yTicks.map((t) => (
                    <g key={`yt-${t}`}>
                      <line
                        x1={margin.left - 6}
                        y1={scaleY(t)}
                        x2={margin.left}
                        y2={scaleY(t)}
                        stroke="#0f172a"
                        strokeWidth={1}
                      />
                      <text
                        x={margin.left - 8}
                        y={scaleY(t) + 4}
                        textAnchor="end"
                        fontSize="10"
                        fill="#0f172a"
                      >
                        {t}
                      </text>
                      <line
                        x1={margin.left}
                        y1={scaleY(t)}
                        x2={svgWidth - margin.right}
                        y2={scaleY(t)}
                        stroke="#e5e7eb"
                        strokeWidth={0.8}
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
                    Punto aplicado (mmHg)
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

                  {/* Línea horizontal en 0 */}
                  <line
                    x1={margin.left}
                    y1={scaleY(0)}
                    x2={svgWidth - margin.right}
                    y2={scaleY(0)}
                    stroke="#9ca3af"
                    strokeDasharray="4 3"
                    strokeWidth={1.5}
                  />

                  {/* Línea que une puntos */}
                  <polyline
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth={1.8}
                    points={polylinePoints}
                  />

                  {/* Puntos */}
                  {[...chartPoints]
                    .sort((a, b) => a.x - b.x)
                    .map((p, idx) => (
                      <circle
                        key={`pt-${idx}`}
                        cx={scaleX(p.x)}
                        cy={scaleY(p.y)}
                        r={3}
                        fill="#1d4ed8"
                      />
                    ))}
                </svg>
              )}
            </div>
          </div>

          <div className="section-block mt-large">
            <h3 className="result-subtitle">3. Observaciones del Metrólogo</h3>
            <div className="observations-box">
              <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>
                {observaciones.trim() !== ""
                  ? observaciones
                  : "No se han registrado observaciones. Asegúrese de revisar los datos para obtener información adicional."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
