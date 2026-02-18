// @/components/Equipo/Certificado/Reporte/Tensiometros/Pagina2/ReportePagina2.tsx
import React, { useMemo } from "react";
import backgroundReporte from "@/assets/background/marcaReporte.png";

type PressureRow = {
  punto: number;
  primera: number;
  segunda: number;
};

type Props = {
  rows: PressureRow[];
};

function isNum(n: any): n is number {
  return typeof n === "number" && Number.isFinite(n);
}

function fmt(n: any, digits = 1): string {
  if (!isNum(n)) return "-";
  return n.toFixed(digits);
}

export default function ReportePagina2({ rows }: Props) {
  const errorMode: "avg" | "primera" | "segunda" = "avg";

  const tableRows = useMemo(() => {
    return (rows || []).map((r) => {
      const punto = Number(r.punto);
      const primera = Number(r.primera);
      const segunda = Number(r.segunda);

      const promedio =
        isNum(primera) && isNum(segunda) ? (primera + segunda) / 2 : NaN;

      // Nuevo cálculo: error promedio = (toma1 - punto + toma2 - punto) / 2
      const errorPromedio =
        isNum(primera) && isNum(segunda) && isNum(punto)
          ? (primera - punto + segunda - punto) / 2
          : NaN;

      return { punto, primera, segunda, promedio, errorPromedio };
    });
  }, [rows, errorMode]);

  const summary = useMemo(() => {
    const errors = tableRows
      .map((r) => r.errorPromedio)
      .filter((e) => isNum(e));
    const n = errors.length;

    const errorPromedio =
      n > 0 ? errors.reduce((acc, v) => acc + v, 0) / n : NaN;

    const desviacionEstandar =
      n > 1
        ? Math.sqrt(
            errors.reduce((acc, v) => acc + Math.pow(v - errorPromedio, 2), 0) /
              (n - 1),
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

  return (
    <div className="page report-page">
      <div
        className="watermark-bg"
        style={{ backgroundImage: `url(${backgroundReporte})` }}
      >
        <div className="content">
          <div className="section-block header-margin">
            <h2 className="main-title-results">RESULTADOS DEL TENSIÓMETRO</h2>
            <p className="justify-text intro-text">
              Esta tabla presenta las lecturas obtenidas del tensiómetro junto
              con el error calculado, que se define como la diferencia entre la
              lectura y el punto aplicado.
            </p>
          </div>

          <div className="section-block">
            <h3 className="result-subtitle">1. Tabla de Resultados</h3>
            <table className="results-table2">
              <thead>
                <tr>
                  <th>Punto (mmHg)</th>
                  <th>Lectura 1</th>
                  <th>Lectura 2</th>
                  <th>Error Promedio</th>
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
                        {fmt(r.errorPromedio, 2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="empty-row">
                      No se registraron datos para mostrar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="section-block mt-large">
            <h3 className="result-subtitle">
              1.1 Resumen Estadístico e Incertidumbre
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
                  <td>Error Promedio</td>
                  <td className="font-mono">{fmt(summary.errorPromedio, 2)}</td>
                  <td>mmHg</td>
                </tr>
                <tr>
                  <td>Desviación Estándar</td>
                  <td className="font-mono">
                    {fmt(summary.desviacionEstandar, 2)}
                  </td>
                  <td>mmHg</td>
                </tr>
                <tr>
                  <td>Incertidumbre Combinada (u)</td>
                  <td className="font-mono">
                    {fmt(summary.incertidumbreEstandar, 1)}
                  </td>
                  <td>mmHg</td>
                </tr>
                <tr>
                  <td>Incertidumbre Expandida (U)</td>
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
  );
}
