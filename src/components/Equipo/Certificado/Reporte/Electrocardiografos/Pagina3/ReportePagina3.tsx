import React from "react";
import backgroundCertificado from "@/assets/background/marcaReporte.png";
import { type ElectrocardiografoRow } from "@/Routes/Calibration/Equipos/Electrocardiografo/components/ElectrocardiografoTable";

interface ReportePagina3Props {
  electrocardiografoData: ElectrocardiografoRow[];
}

const ReportePagina3: React.FC<ReportePagina3Props> = ({
  electrocardiografoData = [],
}) => {
  // Filtrar datos de ECG_AMPLITUD
  const amplitudData = electrocardiografoData.filter(
    (row) => row.tipo === "ECG_AMPLITUD",
  );

  // ✅ NUEVO: Filtrar datos de ECG_ANCHO
  const anchoData = electrocardiografoData.filter(
    (row) => row.tipo === "ECG_ANCHO",
  );

  // Obtener estadísticas (están en la primera fila)
  const stats = amplitudData[0] || {};

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
          {/* Encabezado de Sección */}
          <div className="section-block header-margin">
            <h2 className="main-title-results">RESULTADOS DE LA MEDICIÓN</h2>
            <p className="justify-text intro-text">
              Los resultados presentados a continuación corresponden a los
              valores obtenidos durante las pruebas de amplitud de onda ECG y
              ancho de onda realizadas al equipo bajo calibración.
            </p>
          </div>

          {/* 1. ECG - AMPLITUD DE ONDA (FC) */}
          <div className="section-block">
            <h3 className="result-subtitle">
              1. ECG - AMPLITUD DE ONDA (Frecuencia Cardíaca)
            </h3>
            <table className="results-table2">
              <thead>
                <tr>
                  <th>PATRÓN (BPM)</th>
                  <th>PRIMERA LECTURA</th>
                  <th>ERROR (BPM)</th>
                </tr>
              </thead>
              <tbody>
                {amplitudData.length > 0 ? (
                  amplitudData.map((row, index) => (
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
                      No se registraron datos de amplitud ECG.
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
                    {formatVal(stats.errorPromedio)} BPM
                  </td>
                </tr>
                <tr>
                  <td colSpan={2} className="font-bold">
                    Desviación Estándar
                  </td>
                  <td className="font-mono">
                    {formatVal(stats.desviacionEstandar)} BPM
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* ✅ NUEVO: 2. ANCHO DE ONDA (ms) */}
          <div className="section-block">
            <h3 className="result-subtitle">2. ANCHO DE ONDA (ms)</h3>
            <table className="results-table2">
              <thead>
                <tr>
                  <th>PARÁMETRO (ms)</th>
                  <th>RESULTADO</th>
                </tr>
              </thead>
              <tbody>
                {anchoData.length > 0 ? (
                  anchoData.map((row, index) => (
                    <tr key={index}>
                      <td className="font-bold">{formatVal(row.patron)}</td>
                      <td>
                        <span
                          className={`status-badge ${
                            row.resultado === "OK"
                              ? "status-ok"
                              : "status-error"
                          }`}
                        >
                          {formatVal(row.resultado)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="empty-row">
                      No se registraron datos de ancho de onda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* NOTA SOBRE INCERTIDUMBRE */}
          <div className="section-block mt-large">
            <h3 className="result-subtitle">ANÁLISIS DE RESULTADOS</h3>
            <div className="observations-box">
              <p>
                Los valores de frecuencia cardíaca fueron medidos utilizando un
                simulador de paciente calibrado. El error promedio y la
                desviación estándar indican la precisión del electrocardiógrafo
                en la medición de la frecuencia cardíaca dentro del rango
                evaluado.
              </p>
              <p style={{ marginTop: "0.5rem" }}>
                La incertidumbre expandida de medición se calcula con un factor
                de cobertura k=2, correspondiente a un nivel de confianza de
                aproximadamente el 95%.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportePagina3;
