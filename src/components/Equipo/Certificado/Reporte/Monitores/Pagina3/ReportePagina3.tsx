import React from "react";
import backgroundCertificado from "@/assets/background/marcaReporte.png";
import { type NibpData } from "@/Routes/Calibration/Equipos/Monitores/components/NIBPTable";
import { type Spo2Data } from "@/Routes/Calibration/Equipos/Monitores/components/SPO2Table";

interface ReportePagina3Props {
  nibpData: NibpData | null;
  spo2Data: Spo2Data | null;
}

const ReportePagina3: React.FC<ReportePagina3Props> = ({
  nibpData,
  spo2Data,
}) => {
  // Helper para formatear números
  const formatVal = (val: string | number | null) => {
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
          {/* Encabezado de Sección */}
          <div className="section-block header-margin">
            <h2 className="main-title-results">RESULTADOS DE LA MEDICIÓN</h2>
            <p className="justify-text intro-text">
              Los resultados presentados a continuación corresponden a los
              valores obtenidos durante las pruebas de presión arterial no
              invasiva (NIBP) y saturación de oxígeno (SPO2) realizadas al
              equipo bajo prueba.
            </p>
          </div>

          {/* 1. NIBP - PRESIÓN SISTÓLICA */}
          <div className="section-block">
            <h3 className="result-subtitle">
              1. PRESIÓN ARTERIAL NO INVASIVA (NIBP) - SISTÓLICA
            </h3>
            <table className="results-table2">
              <thead>
                <tr>
                  <th>PATRÓN (mmHg)</th>
                  <th>PRIMERA</th>
                  <th>SEGUNDA</th>
                  <th>TERCERA</th>
                  <th>ERROR (mmHg)</th>
                </tr>
              </thead>
              <tbody>
                {nibpData?.sistolica?.rows &&
                nibpData.sistolica.rows.length > 0 ? (
                  nibpData.sistolica.rows.map((row, index) => (
                    <tr key={index}>
                      <td className="font-mono">{formatVal(row.patron)}</td>
                      <td className="font-mono">{formatVal(row.primera)}</td>
                      <td className="font-mono">{formatVal(row.segunda)}</td>
                      <td className="font-mono">{formatVal(row.tercera)}</td>
                      <td className="font-mono font-bold">
                        {formatVal(row.error)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="empty-row">
                      No se registraron datos de presión sistólica.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} className="font-bold">
                    Error Promedio
                  </td>
                  <td className="font-mono font-bold">
                    {formatVal(nibpData?.sistolica?.errorPromedio)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className="font-bold">
                    Desviación Estándar
                  </td>
                  <td className="font-mono">
                    {formatVal(nibpData?.sistolica?.desviacion)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className="font-bold">
                    Incertidumbre (k=2)
                  </td>
                  <td className="font-mono">
                    ± {formatVal(nibpData?.sistolica?.incExpandida)} mmHg
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* 2. NIBP - PRESIÓN DIASTÓLICA */}
          <div className="section-block mt-large">
            <h3 className="result-subtitle">
              2. PRESIÓN ARTERIAL NO INVASIVA (NIBP) - DIASTÓLICA
            </h3>
            <table className="results-table2">
              <thead>
                <tr>
                  <th>PATRÓN (mmHg)</th>
                  <th>PRIMERA</th>
                  <th>SEGUNDA</th>
                  <th>TERCERA</th>
                  <th>ERROR (mmHg)</th>
                </tr>
              </thead>
              <tbody>
                {nibpData?.diastolica?.rows &&
                nibpData.diastolica.rows.length > 0 ? (
                  nibpData.diastolica.rows.map((row, index) => (
                    <tr key={index}>
                      <td className="font-mono">{formatVal(row.patron)}</td>
                      <td className="font-mono">{formatVal(row.primera)}</td>
                      <td className="font-mono">{formatVal(row.segunda)}</td>
                      <td className="font-mono">{formatVal(row.tercera)}</td>
                      <td className="font-mono font-bold">
                        {formatVal(row.error)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="empty-row">
                      No se registraron datos de presión diastólica.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} className="font-bold">
                    Error Promedio
                  </td>
                  <td className="font-mono font-bold">
                    {formatVal(nibpData?.diastolica?.errorPromedio)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className="font-bold">
                    Desviación Estándar
                  </td>
                  <td className="font-mono">
                    {formatVal(nibpData?.diastolica?.desviacion)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className="font-bold">
                    Incertidumbre (k=2)
                  </td>
                  <td className="font-mono">
                    ± {formatVal(nibpData?.diastolica?.incExpandida)} mmHg
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* 3. NIBP - FRECUENCIA DE PULSO */}
          <div className="section-block mt-large">
            <h3 className="result-subtitle">3. FRECUENCIA DE PULSO (NIBP)</h3>
            <table className="results-table2">
              <thead>
                <tr>
                  <th>PATRÓN (BPM)</th>
                  <th>PRIMERA</th>
                  <th>SEGUNDA</th>
                  <th>TERCERA</th>
                  <th>ERROR (BPM)</th>
                </tr>
              </thead>
              <tbody>
                {nibpData?.pulso?.rows && nibpData.pulso.rows.length > 0 ? (
                  nibpData.pulso.rows.map((row, index) => (
                    <tr key={index}>
                      <td className="font-mono">{formatVal(row.patron)}</td>
                      <td className="font-mono">{formatVal(row.primera)}</td>
                      <td className="font-mono">{formatVal(row.segunda)}</td>
                      <td className="font-mono">{formatVal(row.tercera)}</td>
                      <td className="font-mono font-bold">
                        {formatVal(row.error)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="empty-row">
                      No se registraron datos de frecuencia de pulso.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} className="font-bold">
                    Error Promedio
                  </td>
                  <td className="font-mono font-bold">
                    {formatVal(nibpData?.pulso?.errorPromedio)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className="font-bold">
                    Incertidumbre (k=2)
                  </td>
                  <td className="font-mono">
                    ± {formatVal(nibpData?.pulso?.incExpandida)} BPM
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* 4. SPO2 - SATURACIÓN DE OXÍGENO */}
          <div className="section-block mt-large">
            <h3 className="result-subtitle">4. SATURACIÓN DE OXÍGENO (SPO2)</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <div>
                <h4 style={{ fontSize: "0.85rem", marginBottom: "0.5rem" }}>
                  SPO2 (%)
                </h4>
                <table className="results-table2 compact">
                  <thead>
                    <tr>
                      <th>PATRÓN (%)</th>
                      <th>PRIMERA</th>
                      <th>ERROR (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {spo2Data?.spo2?.rows && spo2Data.spo2.rows.length > 0 ? (
                      spo2Data.spo2.rows.map((row, index) => (
                        <tr key={index}>
                          <td className="font-mono">{formatVal(row.patron)}</td>
                          <td className="font-mono">
                            {formatVal(row.primera)}
                          </td>
                          <td className="font-mono font-bold">
                            {formatVal(row.error)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="empty-row">
                          Sin datos
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
                        {formatVal(spo2Data?.spo2?.errorPromedio)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="font-bold">
                        Incertidumbre
                      </td>
                      <td className="font-mono">
                        ± {formatVal(spo2Data?.spo2?.incExpandida)} %
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div>
                <h4 style={{ fontSize: "0.85rem", marginBottom: "0.5rem" }}>
                  Frecuencia de Pulso
                </h4>
                <table className="results-table2 compact">
                  <thead>
                    <tr>
                      <th>PATRÓN (BPM)</th>
                      <th>PRIMERA</th>
                      <th>ERROR (BPM)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {spo2Data?.fp?.rows && spo2Data.fp.rows.length > 0 ? (
                      spo2Data.fp.rows.map((row, index) => (
                        <tr key={index}>
                          <td className="font-mono">{formatVal(row.patron)}</td>
                          <td className="font-mono">
                            {formatVal(row.primera)}
                          </td>
                          <td className="font-mono font-bold">
                            {formatVal(row.error)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="empty-row">
                          Sin datos
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
                        {formatVal(spo2Data?.fp?.errorPromedio)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="font-bold">
                        Incertidumbre
                      </td>
                      <td className="font-mono">
                        ± {formatVal(spo2Data?.fp?.incExpandida)} BPM
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* NOTA SOBRE INCERTIDUMBRE */}
          <div className="section-block mt-large">
            <h3 className="result-subtitle">INCERTIDUMBRE</h3>
            <div className="observations-box">
              <p>
                Los errores reportados incluyen la corrección del patrón
                utilizado. La incertidumbre expandida de medición reportada se
                declara como la incertidumbre típica de medición multiplicada
                por el factor de cobertura k=2, el cual corresponde a un nivel
                de confianza de aproximadamente el 95%.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportePagina3;
