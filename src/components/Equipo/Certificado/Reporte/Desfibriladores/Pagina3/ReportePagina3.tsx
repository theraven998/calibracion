import React from "react";
import backgroundCertificado from "@/assets/background/marcaReporte.png";
import { type DesfibriladorRow } from "@/Routes/Calibration/Equipos/Desfibriladores/components/DesfibriladorTable";

interface ReportePagina3Props {
  desfibriladorData: DesfibriladorRow[];
}

const ReportePagina3: React.FC<ReportePagina3Props> = ({
  desfibriladorData = [],
}) => {
  const ecgData = desfibriladorData.filter((row) => row.tipo === "ECG");
  const desfibData = desfibriladorData.filter(
    (row) => row.tipo === "DESFIBRILACION",
  );

  const ecgStats = ecgData[0] || {};
  const desfibStats = desfibData[0] || {};

  const formatVal = (val: string | number | null | undefined) => {
    if (val === null || val === "" || val === undefined) return "-";
    return val.toString();
  };

  return (
    <div className="page report-page report-page-2">
      <div
        className="watermark-bg"
        style={{ backgroundImage: `url(${backgroundCertificado})` }}
      >
        <div className="content">
          <div className="section-block header-margin">
            <h2 className="main-title-results">RESULTADOS DE LA MEDICIÓN</h2>
            <p className="justify-text intro-text">
              Los resultados presentados corresponden a las pruebas de
              frecuencia cardíaca ECG y energía de desfibrilación realizadas al
              equipo.
            </p>
          </div>

          {/* 1. ECG */}
          <div className="section-block">
            <h3 className="result-subtitle">1. ECG - FRECUENCIA CARDÍACA</h3>
            <table className="results-table2">
              <thead>
                <tr>
                  <th>PATRÓN (BPM)</th>
                  <th>PRIMERA LECTURA</th>
                  <th>ERROR (BPM)</th>
                </tr>
              </thead>
              <tbody>
                {ecgData.length > 0 ? (
                  ecgData.map((row, index) => (
                    <tr key={index}>
                      <td className="font-mono">{formatVal(row.patron)}</td>
                      <td className="font-mono">{formatVal(row.lectura1)}</td>
                      <td className="font-mono font-bold">
                        {formatVal(row.error)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="empty-row">
                      No se registraron datos ECG.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2} className="font-bold">
                    Error Promedio
                  </td>
                  <td className="font-mono font-bold">
                    {formatVal(ecgStats.errorPromedio)} BPM
                  </td>
                </tr>
                <tr>
                  <td colSpan={2} className="font-bold">
                    Desviación Estándar
                  </td>
                  <td className="font-mono">
                    {formatVal(ecgStats.desviacionEstandar)} BPM
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* 2. DESFIBRILACIÓN */}
          <div className="section-block">
            <h3 className="result-subtitle">2. DESFIBRILACIÓN (JOULES)</h3>
            <table className="results-table2 tabla-desfib">
              <thead>
                <tr>
                  <th>PATRÓN (J)</th>
                  <th>PRIMERA</th>
                  <th>SEGUNDA</th>
                  <th>TERCERA</th>
                  <th>CUARTA</th>
                  <th>QUINTA</th>
                  <th>ERROR</th>
                </tr>
              </thead>
              <tbody>
                {desfibData.length > 0 ? (
                  desfibData.map((row, index) => (
                    <tr key={index}>
                      <td className="font-mono">{formatVal(row.patron)}</td>
                      <td className="font-mono">{formatVal(row.lectura1)}</td>
                      <td className="font-mono">{formatVal(row.lectura2)}</td>
                      <td className="font-mono">{formatVal(row.lectura3)}</td>
                      <td className="font-mono">{formatVal(row.lectura4)}</td>
                      <td className="font-mono">{formatVal(row.lectura5)}</td>
                      <td className="font-mono font-bold">
                        {formatVal(row.error)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="empty-row">
                      No se registraron datos de desfibrilación.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={6} className="font-bold">
                    Error Promedio
                  </td>
                  <td className="font-mono font-bold">
                    {formatVal(desfibStats.errorPromedio)} J
                  </td>
                </tr>
                <tr>
                  <td colSpan={6} className="font-bold">
                    Desviación Estándar
                  </td>
                  <td className="font-mono">
                    {formatVal(desfibStats.desviacionEstandar)} J
                  </td>
                </tr>
                <tr>
                  <td colSpan={6} className="font-bold">
                    Incertidumbre
                  </td>
                  <td className="font-mono">
                    {formatVal(desfibStats.incertidumbre)} J
                  </td>
                </tr>
                <tr>
                  <td colSpan={6} className="font-bold">
                    Incertidumbre Expandida
                  </td>
                  <td className="font-mono">
                    {formatVal(desfibStats.incertidumbreExpandida)} J
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportePagina3;
