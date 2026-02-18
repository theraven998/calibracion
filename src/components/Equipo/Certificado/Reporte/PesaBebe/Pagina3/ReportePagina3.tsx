// src/components/Equipo/Certificado/Reporte/PesaBebe/Pagina2/ReportePagina2PesaBebe.tsx
import React from "react";
import backgroundCertificado from "@/assets/background/marcaReporte.png";
import { type CalibrationRow } from "@/Routes/Calibration/Equipos/Basculas/components/CalibrationTable";
import { type ExcentricidadResult } from "@/Routes/Calibration/Equipos/Basculas/components/ExcentricidadTable";

interface ReportePagina3PesaBebeProps {
  calibrationData: CalibrationRow[];
  excentricidadData: ExcentricidadResult[];
}

const ReportePagina3PesaBebe: React.FC<ReportePagina3PesaBebeProps> = ({
  calibrationData = [],
  excentricidadData = [],
}) => {
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
          {/* Encabezado */}
          <div className="section-block header-margin">
            <h2 className="main-title-results">RESULTADOS DE LA MEDICIÓN</h2>
            <p className="justify-text intro-text">
              Los resultados presentados corresponden a las pruebas de exactitud
              y excentricidad realizadas a la báscula pesa bebé bajo
              calibración.
            </p>
          </div>

          {/* 1. EXACTITUD (Pesa bebé normalmente en kg pero con resolución fina) */}
          <div className="section-block">
            <h3 className="result-subtitle">1. PRUEBA DE EXACTITUD</h3>
            <table className="results-table2 pesa-bebe-table">
              <thead>
                <tr>
                  <th>CARGA PATRÓN</th>
                  <th>LECTURA 1</th>
                  <th>LECTURA 2</th>
                  <th>ERROR</th>
                  <th>INCERTIDUMBRE (k=2)</th>
                </tr>
              </thead>
              <tbody>
                {calibrationData.length > 0 ? (
                  calibrationData.map((row, index) => (
                    <tr key={index}>
                      {/* En many Pesa bebé trabajas en kg con 3 decimales, ajusta a tu tipo */}
                      <td className="font-mono">
                        {formatVal(row.patron)} kg
                      </td>
                      <td className="font-mono">
                        {formatVal(row.lectura1)}
                      </td>
                      <td className="font-mono">
                        {formatVal(row.lectura2)}
                      </td>
                      <td className="font-mono font-bold">
                        {formatVal(row.error)}
                      </td>
                      <td className="font-mono">
                        {formatVal(row.incertidumbre)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="empty-row">
                      No se registraron datos de exactitud para la pesa bebé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 2. EXCENTRICIDAD */}
          <div className="section-block mt-large">
            <h3 className="result-subtitle">
              2. PRUEBA DE EXCENTRICIDAD (Carga descentrada)
            </h3>

            <div className="excentricidad-layout">
              <div className="diagram-box">
                <img
                  src="https://storage.googleapis.com/rdol-resources/0Varios/carga.png"
                  className="esquema"
                  alt="Esquema de excentricidad"
                />
              </div>

              <div className="table-wrapper">
                <table className="results-table2 compact pesa-bebe-table">
                  <thead>
                    <tr>
                      <th>POSICIÓN</th>
                      <th>CARGA</th>
                      <th>LECTURA</th>
                      <th>ERROR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {excentricidadData.length > 0 ? (
                      excentricidadData.map((row, index) => (
                        <tr key={index}>
                          <td>{formatVal(row.posicion)}</td>
                          <td className="font-mono">
                            {formatVal(row.carga)} kg
                          </td>
                          <td className="font-mono">
                            {formatVal(row.lectura)}
                          </td>
                          <td className="font-mono font-bold">
                            {formatVal(row.error)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="empty-row">
                          No se registraron datos de excentricidad para la pesa
                          bebé.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* INCERTIDUMBRE (texto genérico) */}
          <div className="section-block mt-large">
            <h3 className="result-subtitle">INCERTIDUMBRE</h3>
            <div className="observations-box">
              <p>
                Los errores reportados incluyen la corrección del patrón
                utilizado. La incertidumbre expandida de medición se declara
                como la incertidumbre típica de medición multiplicada por el
                factor de cobertura k=2, lo cual corresponde a un nivel de
                confianza aproximado del 95 % para la báscula pesa bebé.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportePagina3PesaBebe;
