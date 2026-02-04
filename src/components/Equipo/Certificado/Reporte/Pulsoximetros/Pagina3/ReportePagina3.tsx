import React, { useMemo } from "react";
import backgroundCertificado from "@/assets/background/marcaReporte.png";
import { type PulsoximetroRow } from "@/Routes/Calibration/Equipos/Pulsoximetro/components/PulsoximetroTable";

interface ReportePagina3Props {
  calibrationData: PulsoximetroRow[];
  observaciones: string;
}

const fmt = (v: string | number | null | undefined) => {
  if (v === null || v === undefined) return "-";
  const s = String(v).trim();
  return s === "" ? "-" : s;
};

const toNum = (v: string | number | null | undefined) => {
  const n = parseFloat(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
};

type Point = { patron: number; error: number };

const ReportePagina3Pulsoximetro: React.FC<ReportePagina3Props> = ({
  calibrationData = [],
  observaciones,
}) => {
  const spo2Percent = useMemo(
    () => calibrationData.filter((r) => r.tipo === "SPO2_PERCENT"),
    [calibrationData]
  );

  const spo2FP = useMemo(
    () => calibrationData.filter((r) => r.tipo === "SPO2_FP"),
    [calibrationData]
  );

  const pointsPercent = useMemo(() => {
    return spo2Percent
      .map((row) => {
        const patron = toNum(row.patron);
        const error = toNum(row.errorPromedio);
        if (!Number.isFinite(patron) || !Number.isFinite(error)) return null;
        return { patron, error };
      })
      .filter(Boolean) as Point[];
  }, [spo2Percent]);

  const pointsFP = useMemo(() => {
    return spo2FP
      .map((row) => {
        const patron = toNum(row.patron);
        const error = toNum(row.errorPromedio);
        if (!Number.isFinite(patron) || !Number.isFinite(error)) return null;
        return { patron, error };
      })
      .filter(Boolean) as Point[];
  }, [spo2FP]);

  return (
    <div className="page report-page">
      <div
        className="watermark-bg"
        style={{ backgroundImage: `url(${backgroundCertificado})` }}
      >
        <div className="content">
          <div className="section-block header-margin">
            <h2 className="main-title-results">
              ANÁLISIS DE EXACTITUD (PULSOXÍMETRO)
            </h2>
            <p className="justify-text intro-text">
              En esta sección se presenta el error promedio obtenido para SpO2
              (%) y SpO2 (FP) del pulsoxímetro, comparado contra los valores
              patrón.
            </p>
          </div>

          {/* TABLAS (2) */}
          <div className="section-block">
            <h3 className="result-subtitle">1. TABLAS DE ERROR</h3>

            <div className="two-tables-grid">
              <div>
                <h4 className="result-minititle">SpO2 (%)</h4>
                <table className="results-table2 compact">
                  <thead>
                    <tr>
                      <th>PATRÓN (%)</th>
                      <th>ERROR PROM. (%)</th>
                      <th>INCERT. (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {spo2Percent.length ? (
                      spo2Percent.map((r, i) => (
                        <tr key={`spo2-${i}`}>
                          <td className="font-mono">{fmt(r.patron)}</td>
                          <td className="font-mono font-bold">
                            {fmt(r.errorPromedio)}
                          </td>
                          <td className="font-mono">{fmt(r.incertidumbre)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="empty-row">
                          No se registraron datos.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div>
                <h4 className="result-minititle">SpO2 (FP - bpm)</h4>
                <table className="results-table2 compact">
                  <thead>
                    <tr>
                      <th>PATRÓN (bpm)</th>
                      <th>ERROR PROM. (bpm)</th>
                      <th>INCERT. (bpm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {spo2FP.length ? (
                      spo2FP.map((r, i) => (
                        <tr key={`fp-${i}`}>
                          <td className="font-mono">{fmt(r.patron)}</td>
                          <td className="font-mono font-bold">
                            {fmt(r.errorPromedio)}
                          </td>
                          <td className="font-mono">{fmt(r.incertidumbre)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="empty-row">
                          No se registraron datos.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
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

export default ReportePagina3Pulsoximetro;
