import React, { useMemo } from "react";
import backgroundCertificado from "@/assets/background/marcaReporte.png";
import { type ExactitudRow } from "@/Routes/Calibration/Equipos/TensiometroDigital/components/ExactitudTable";

interface ReportePagina2Props {
  calibrationData: ExactitudRow[];
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

const ReportePagina2: React.FC<ReportePagina2Props> = ({
  calibrationData = [],
  observaciones,
}) => {
  const sistolica = useMemo(
    () => calibrationData.filter((r) => r.tipo === "SISTOLICA"),
    [calibrationData]
  );

  const diastolica = useMemo(
    () => calibrationData.filter((r) => r.tipo === "DIASTOLICA"),
    [calibrationData]
  );

  const pointsSis = useMemo(() => {
    return sistolica
      .map((row) => {
        const patron = toNum(row.patron);
        const error = toNum(row.errorPromedio);
        if (!Number.isFinite(patron) || !Number.isFinite(error)) return null;
        return { patron, error };
      })
      .filter(Boolean) as Point[];
  }, [sistolica]);

  const pointsDia = useMemo(() => {
    return diastolica
      .map((row) => {
        const patron = toNum(row.patron);
        const error = toNum(row.errorPromedio);
        if (!Number.isFinite(patron) || !Number.isFinite(error)) return null;
        return { patron, error };
      })
      .filter(Boolean) as Point[];
  }, [diastolica]);

  return (
    <div className="page report-page">
      <div
        className="watermark-bg"
        style={{ backgroundImage: `url(${backgroundCertificado})` }}
      >
        <div className="content">
          <div className="section-block header-margin">
            <h2 className="main-title-results">ANÁLISIS DE EXACTITUD (NIBP)</h2>
            <p className="justify-text intro-text">
              En esta sección se presenta el error promedio obtenido para
              presión sistólica y diastólica del tensiómetro digital, comparado
              contra los valores patrón (mmHg).
            </p>
          </div>

          {/* TABLAS (2) */}
          <div className="section-block">
            <h3 className="result-subtitle">1. TABLAS DE ERROR (mmHg)</h3>

            <div className="two-tables-grid">
              <div>
                <h4 className="result-minititle">Sistólica</h4>
                <table className="results-table2 compact">
                  <thead>
                    <tr>
                      <th>PATRÓN (mmHg)</th>
                      <th>ERROR PROM. (mmHg)</th>
                      <th>DESV. (mmHg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sistolica.length ? (
                      sistolica.map((r, i) => (
                        <tr key={`sis-${i}`}>
                          <td className="font-mono">{fmt(r.patron)}</td>
                          <td className="font-mono font-bold">
                            {fmt(r.errorPromedio)}
                          </td>
                          <td className="font-mono">{fmt(r.desviacion)}</td>
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
                <h4 className="result-minititle">Diastólica</h4>
                <table className="results-table2 compact">
                  <thead>
                    <tr>
                      <th>PATRÓN (mmHg)</th>
                      <th>ERROR PROM. (mmHg)</th>
                      <th>DESV. (mmHg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {diastolica.length ? (
                      diastolica.map((r, i) => (
                        <tr key={`dia-${i}`}>
                          <td className="font-mono">{fmt(r.patron)}</td>
                          <td className="font-mono font-bold">
                            {fmt(r.errorPromedio)}
                          </td>
                          <td className="font-mono">{fmt(r.desviacion)}</td>
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

export default ReportePagina2;
