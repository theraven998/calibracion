import React from "react";
import backgroundCertificado from "@/assets/background/marcaReporte.png";
import { type DesfibriladorRow } from "@/Routes/Calibration/Equipos/Desfibriladores/components/DesfibriladorTable";

interface ReportePagina4Props {
  desfibriladorData: DesfibriladorRow[];
  observaciones: string;
}

const ReportePagina4: React.FC<ReportePagina4Props> = ({
  desfibriladorData = [],
  observaciones,
}) => {
  const tiempoData = desfibriladorData.filter(
    (row) => row.tipo === "TIEMPO_CARGA",
  );
  const tiempoStats = tiempoData[0] || {};

  const formatVal = (val: string | number | null | undefined) => {
    if (val === null || val === "" || val === undefined) return "-";
    return val.toString();
  };

  return (
    <div className="page report-page">
      <div
        className="watermark-bg"
        style={{ backgroundImage: `url(${backgroundCertificado})` }}
      >
        <div className="content">
          <div className="section-block header-margin">
            <h2 className="main-title-results">
              TIEMPO DE CARGA Y OBSERVACIONES
            </h2>
            <p className="justify-text intro-text">
              A continuación se presentan los tiempos de carga medidos para
              diferentes niveles de energía y las observaciones del metrólogo.
            </p>
          </div>

          {/* TIEMPO DE CARGA */}
          <div className="section-block">
            <h3 className="result-subtitle">3. TIEMPO DE CARGA (s)</h3>
            <table className="results-table2">
              <thead>
                <tr>
                  <th>PATRÓN (J)</th>
                  <th>TIEMPO (s)</th>
                </tr>
              </thead>
              <tbody>
                {tiempoData.length > 0 ? (
                  tiempoData.map((row, index) => (
                    <tr key={index}>
                      <td className="font-mono">{formatVal(row.patron)}</td>
                      <td className="font-mono">{formatVal(row.lectura1)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="empty-row">
                      No se registraron datos de tiempo de carga.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td className="font-bold">Tiempo Promedio</td>
                  <td className="font-mono font-bold">
                    {formatVal(tiempoStats.tiempoPromedio)} s
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Observaciones */}
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
