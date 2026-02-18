import React from "react";
import backgroundCertificado from "@/assets/background/marcaReporte.png";
import { type ElectrocardiografoRow } from "@/Routes/Calibration/Equipos/Electrocardiografo/components/ElectrocardiografoTable";

interface ReportePagina4Props {
  electrocardiografoData: ElectrocardiografoRow[];
  observaciones: string;
}

const ReportePagina4: React.FC<ReportePagina4Props> = ({
  electrocardiografoData = [],
  observaciones,
}) => {
  // ❌ REMOVIDO: const anchoData = ...

  // Filtrar solo las pruebas cualitativas restantes
  const ondaData = electrocardiografoData.filter(
    (row) => row.tipo === "ECG_ONDA",
  );
  const rechazoData = electrocardiografoData.filter(
    (row) => row.tipo === "ECG_RECHAZO",
  );
  const seleccionQRSData = electrocardiografoData.filter(
    (row) => row.tipo === "ECG_SELECCION_QRS",
  );
  const amplitudHzData = electrocardiografoData.filter(
    (row) => row.tipo === "ECG_AMPLITUD_HZ",
  );

  const formatVal = (val: string | number | null | undefined) => {
    if (val === null || val === "" || val === undefined) return "NO EVALUADO";
    return val.toString();
  };

  const renderQualitativeTable = (
    title: string,
    data: ElectrocardiografoRow[],
  ) => {
    return (
      <div className="section-block">
        <h3 className="result-subtitle">{title}</h3>
        <table className="results-table2">
          <thead>
            <tr>
              <th>PARÁMETRO</th>
              <th>RESULTADO</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, index) => (
                <tr key={index}>
                  <td className="font-bold">{formatVal(row.patron)}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        row.resultado === "OK" ? "status-ok" : "status-error"
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
                  No se registraron datos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
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
              PRUEBAS FUNCIONALES Y OBSERVACIONES
            </h2>
            <p className="justify-text intro-text">
              Los siguientes resultados corresponden a las pruebas funcionales
              cualitativas realizadas al electrocardiógrafo para verificar su
              correcto funcionamiento.
            </p>
          </div>

          {/* ❌ REMOVIDO: renderQualitativeTable("2. ANCHO DE ONDA (ms)", anchoData) */}

          {/* Ahora empieza desde "3. RESPUESTA DE ONDA" pero renumerado como "3" */}
          {renderQualitativeTable("3. RESPUESTA DE ONDA", ondaData)}

          {/* Rechazo */}
          {renderQualitativeTable("4. RECHAZO DE SEÑAL", rechazoData)}

          {/* Selección QRS */}
          {renderQualitativeTable(
            "5. SELECCIÓN DE COMPLEJO QRS",
            seleccionQRSData,
          )}

          {/* Amplitud Hz */}
          {renderQualitativeTable("6. AMPLITUD (Hz)", amplitudHzData)}

          {/* Observaciones del metrólogo */}
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
