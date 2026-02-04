import React, { useMemo, useRef, useState } from "react";
import "./CertificateModal.css";

import Certificado from "@/components/Equipo/Certificado/Certificado/Certificado";
import ReportePagina1, {
  type RelevantInfoData,
} from "@/components/Equipo/Pagina1/ReportePagina1";
import backgroundReporte from "@/assets/background/marcaReporte.png";

import type { Patron, Metrologo, Center } from "@/services/api";
import type { DataEquipment } from "@/components/Equipo/Data";
import { useReactToPrint } from "react-to-print";

// Si ya tienes un background para watermark y quieres usarlo aquí, descomenta:
// import backgroundCertificado from "@/assets/background/marcaReporte.png";

type PressureRow = {
  punto: number; // mmHg
  primera: number; // mmHg
  segunda: number; // mmHg
};

type Props = {
  equipmentData: DataEquipment | null;
  rows: PressureRow[];
  clientData: {
    solicitante: string;
    direccion: string;
    fechaCalibracion: string;
  };
  selectedCenter: Center | null;
  selectedMetrologist: Metrologo | null;
  patronUsed?: Patron | null;
  onClose: () => void;

  // Opcional: pásalas desde arriba si ya las tienes en otro state
  observaciones?: string;
};

function safeText(v?: string | number | null) {
  if (v === null || v === undefined) return "---";
  const s = String(v).trim();
  return s ? s : "---";
}

function isNum(n: any) {
  return typeof n === "number" && Number.isFinite(n);
}

function fmt(n: any, digits = 1) {
  if (!isNum(n)) return "-";
  return n.toFixed(digits);
}

export default function CertificateModalTensiometro({
  equipmentData,
  rows,
  clientData,
  selectedCenter,
  selectedMetrologist,
  patronUsed,
  onClose,
  observaciones,
}: Props) {
  const [isDownloading, setIsDownloading] = useState(false);
  const componentRef = useRef<HTMLDivElement | null>(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Certificado_${
      equipmentData?.certificado || "SinNumero"
    }.pdf`,
    onAfterPrint: () => {
      -console.log("Descarga de PDF completada");
    },
    pageStyle: `
      @page {
        size: letter portrait;
        margin: 0;
      }
      body {
        margin: 0;
        padding: 0;
      }
    `,
  });
  const certNumber = useMemo(() => {
    return (
      (equipmentData as any)?.certificado ||
      (equipmentData as any)?.numeroCertificado ||
      "---"
    );
  }, [equipmentData]);

  const relevantInfo: RelevantInfoData = useMemo(
    () => ({
      fechaRecepcion: clientData.fechaCalibracion,
      fechaCalibracion: clientData.fechaCalibracion,
      sitioCalibracion:
        selectedCenter?.direccion || (selectedCenter as any)?.address || "---",
      metrologo: selectedMetrologist?.nombre || "---",
    }),
    [clientData.fechaCalibracion, selectedCenter, selectedMetrologist]
  );

  // ===========
  // PÁGINA 2: datos (tabla + puntos para gráfica)
  // ===========
  const errorMode: "avg" | "primera" | "segunda" = "avg";

  const tableRows = useMemo(() => {
    return (rows || []).map((r) => {
      const punto = Number(r.punto);
      const primera = Number(r.primera);
      const segunda = Number(r.segunda);

      const promedio =
        isNum(primera) && isNum(segunda) ? (primera + segunda) / 2 : NaN;

      const lecturaRef =
        errorMode === "primera"
          ? primera
          : errorMode === "segunda"
          ? segunda
          : promedio;

      // Error típico: lectura - punto aplicado
      const error =
        isNum(lecturaRef) && isNum(punto) ? lecturaRef - punto : NaN;

      return { punto, primera, segunda, promedio, error };
    });
  }, [rows, errorMode]);
  const summary = useMemo(() => {
    const errors = tableRows.map((r) => r.error).filter((e) => isNum(e));
    const n = errors.length;

    const errorPromedio =
      n > 0 ? errors.reduce((acc, v) => acc + v, 0) / n : NaN;

    // Desviación estándar muestral (si solo hay 1 dato, 0)
    const desviacionEstandar =
      n > 1
        ? Math.sqrt(
            errors.reduce((acc, v) => acc + Math.pow(v - errorPromedio, 2), 0) /
              (n - 1)
          )
        : n === 1
        ? 0
        : NaN;

    return {
      n,
      errorPromedio,
      desviacionEstandar,
      incertidumbreEstandar: 2.2,
      incertidumbreExpandida: 4.4,
    };
  }, [tableRows]);

  const chartPoints = useMemo(() => {
    return tableRows
      .map((r) => {
        if (!isNum(r.punto) || !isNum(r.error)) return null;
        return { x: r.punto, y: r.error };
      })
      .filter(Boolean) as { x: number; y: number }[];
  }, [tableRows]);

  // Config SVG (simple, sin librerías)
  const svgWidth = 640;
  const svgHeight = 260;
  const margin = { top: 18, right: 18, bottom: 38, left: 60 };

  const xMin = useMemo(() => {
    if (chartPoints.length === 0) return 0;
    return Math.min(...chartPoints.map((p) => p.x));
  }, [chartPoints]);

  const xMax = useMemo(() => {
    if (chartPoints.length === 0) return 300;
    return Math.max(...chartPoints.map((p) => p.x));
  }, [chartPoints]);

  const yAbsMax = useMemo(() => {
    if (chartPoints.length === 0) return 5;
    return Math.max(...chartPoints.map((p) => Math.abs(p.y)), 1);
  }, [chartPoints]);

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

  const xTicks = useMemo(() => {
    if (chartPoints.length === 0) return [0, 50, 100, 150, 200, 250, 300];
    const n = 6;
    const step = (xMax - xMin) / n || 1;
    return Array.from(
      { length: n + 1 },
      (_, i) => Math.round((xMin + step * i) * 10) / 10
    );
  }, [chartPoints, xMin, xMax]);

  const yTicks = useMemo(() => {
    const n = 4;
    const step = (yMax - yMin) / n || 1;
    return Array.from(
      { length: n + 1 },
      (_, i) => Math.round((yMin + step * i) * 10) / 10
    );
  }, [yMin, yMax]);

  const polylinePoints = useMemo(() => {
    const sorted = [...chartPoints].sort((a, b) => a.x - b.x);
    return sorted.map((p) => `${scaleX(p.x)},${scaleY(p.y)}`).join(" ");
  }, [chartPoints, xMin, xMax, yMin, yMax]);

  async function downloadPdfFromApi() {
    alert(
      "Para descargar PDF, primero genera/sube el certificado y luego descarga desde la vista /view/:id."
    );
  }

  if (!equipmentData) {
    return (
      <div className="certificate-modal-overlay" onClick={onClose}>
        <div
          className="certificate-modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h2>Vista previa</h2>
            <div className="modal-actions-header">
              <button className="btn-close" onClick={onClose}>
                Cerrar
              </button>
            </div>
          </div>

          <div className="certificate-scroll-area">
            <div className="certificate-print-container" ref={componentRef}>
              <p>Faltan datos del equipo (sección Data).</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const obsText =
    (observaciones ??
      (equipmentData as any)?.observaciones ??
      (equipmentData as any)?.observacion ??
      "") + "";

  return (
    <div className="certificate-modal-overlay" onClick={onClose}>
      <div
        className="certificate-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <h2>Vista Previa del Certificado · Tensiómetro</h2>
          <div className="modal-actions-header">
            <button
              className="btn-primary"
              disabled={isDownloading}
              onClick={handlePrint}
            >
              {isDownloading ? "Generando..." : "📥 Descargar PDF"}
            </button>
            <button className="btn-secondary" onClick={onClose}>
              Subir a la nube
            </button>
            <button className="btn-close" onClick={onClose}>
              ×
            </button>
          </div>
        </header>

        <div className="certificate-scroll-area">
          <div className="certificate-print-container" ref={componentRef}>
            {/* ===================== */}
            {/* PÁGINA 0: Certificado */}
            {/* ===================== */}
            <Certificado
              equipmentData={equipmentData as any}
              clientData={clientData as any}
              technicalInfo={{
                magnitud: "PRESIÓN",
                tipo: "TENSIÓMETRO",
                rango: (equipmentData as any)?.rango || "---",
              }}
              metrologo={selectedMetrologist ?? undefined}
            />

            {/* =================== */}
            {/* PÁGINA 1 (universal) */}
            {/* =================== */}
            <ReportePagina1
              certNumber={safeText(certNumber)}
              relevantInfo={relevantInfo}
              tipoEquipo="tensiometro"
              metrologo={selectedMetrologist ?? undefined}
              patronUsed={patronUsed ?? null}
            />

            {/* ====================================== */}
            {/* PÁGINA 2: Resultados + tabla + gráfica  */}
            {/* ====================================== */}
            <div className="page report-page">
              <div
                className="watermark-bg"
                style={{
                  backgroundImage: `url(${backgroundReporte})`,
                }}
              >
                <div className="content">
                  <div className="section-block header-margin">
                    <h2 className="main-title-results">
                      RESULTADOS TENSIÓMETRO
                    </h2>
                    <p className="justify-text intro-text">
                      La tabla presenta las lecturas obtenidas y el error
                      calculado como (lectura − punto aplicado).
                    </p>
                  </div>

                  <div className="section-block">
                    <h3 className="result-subtitle">1. Tabla de resultados</h3>

                    <table className="results-table2">
                      <thead>
                        <tr>
                          <th>Punto (mmHg)</th>
                          <th>Lectura 1</th>
                          <th>Lectura 2</th>
                          <th>Error promedio</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tableRows.length > 0 ? (
                          tableRows.map((r, idx) => (
                            <tr key={idx}>
                              <td className="font-mono">{fmt(r.punto, 0)}</td>
                              <td className="font-mono">{fmt(r.primera, 0)}</td>
                              <td className="font-mono">{fmt(r.segunda, 0)}</td>
                              <td className="font-mono">
                                {fmt(r.promedio, 1)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="empty-row">
                              No se registraron datos.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="section-block mt-large">
                    <h3 className="result-subtitle">
                      1.1 Resumen estadístico e incertidumbre
                    </h3>

                    <table className="summary-table">
                      <thead>
                        <tr>
                          <th>Parámetro</th>
                          <th>Valor</th>
                          <th>Unidad</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Error promedio</td>
                          <td className="font-mono">
                            {fmt(summary.errorPromedio, 2)}
                          </td>
                          <td>mmHg</td>
                        </tr>
                        <tr>
                          <td>Desviación estándar</td>
                          <td className="font-mono">
                            {fmt(summary.desviacionEstandar, 2)}
                          </td>
                          <td>mmHg</td>
                        </tr>
                        <tr>
                          <td>Incertidumbre combinada (u)</td>
                          <td className="font-mono">
                            {fmt(summary.incertidumbreEstandar, 1)}
                          </td>
                          <td>mmHg</td>
                        </tr>
                        <tr>
                          <td>Incertidumbre expandida (U)</td>
                          <td className="font-mono">
                            {fmt(summary.incertidumbreExpandida, 1)}
                          </td>
                          <td>mmHg</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* =============================== */}
            {/* PÁGINA 3: Observaciones metrólogo */}
            {/* =============================== */}
            <div className="page report-page">
              <div
                className="watermark-bg"
                style={{ backgroundImage: `url(${backgroundReporte})` }}
              >
                <div className="section-block mt-large">
                  <h3 className="result-subtitle">2. Gráfica Punto vs Error</h3>

                  <div className="chart-container">
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
                </div>
                <div className="content">
                  <div className="section-block mt-large">
                    <h3 className="result-subtitle">
                      Observaciones del metrólogo
                    </h3>
                    <div className="observations-box">
                      <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>
                        {obsText.trim() !== ""
                          ? obsText
                          : "Sin observaciones registradas."}
                      </p>
                    </div>
                  </div>

                  {/* <div className="section-block mt-large">
                    <h3 className="result-subtitle">Trazabilidad</h3>
                    <div className="observations-box">
                      <p style={{ margin: 0 }}>
                        Los resultados se relacionan con los patrones utilizados
                        y las condiciones registradas en este certificado.
                      </p>
                    </div>
                  </div> */}
                </div>
              </div>
            </div>

            {/* Fin container */}
          </div>
        </div>
      </div>
    </div>
  );
}
