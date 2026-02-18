import React, { useEffect, useMemo, useState } from "react";

export type MeasurementType =
  | "ECG_AMPLITUD"
  | "ECG_ANCHO"
  | "ECG_ONDA"
  | "ECG_RECHAZO"
  | "ECG_SELECCION_QRS"
  | "ECG_AMPLITUD_HZ";

export interface ElectrocardiografoRow {
  tipo: MeasurementType;
  patron: string;
  lectura1: string;
  error: string;
  errorPromedio?: string;
  desviacionEstandar?: string;
  resultado?: string; // Para campos tipo "OK" o text
}

interface Props {
  onDataChange: (data: ElectrocardiografoRow[]) => void;
}

const IDX_PATRON = 0;
const IDX_L1 = 1;

// Columnas para ECG Amplitud (tabla numérica)
const COLUMNS_NUMERIC = [
  { value: "PATRON (FC)", type: "editable", key: "patron" },
  { value: "PRIMERA", type: "editable", key: "lectura1" },
  { value: "ERROR", type: "readOnly", formula: "ERROR" },
];

// Columnas para las tablas cualitativas (OK/texto)
const COLUMNS_QUALITATIVE = [
  { value: "PATRON", type: "editable", key: "patron" },
  { value: "RESULTADO", type: "editable", key: "resultado" },
];

function toNum(s: string) {
  const n = parseFloat((s || "").replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
}

function fmt(n: number, decimals = 2) {
  if (!Number.isFinite(n)) return "";
  return n.toFixed(decimals);
}

const ElectrocardiografoTable: React.FC<Props> = ({ onDataChange }) => {
  // Patrones editables para ECG Amplitud (frecuencia cardíaca)
  const [patternsAmplitud, setPatternsAmplitud] = useState<string[]>([
    "20",
    "30",
    "40",
    "60",
    "80",
    "120",
    "160",
    "200",
    "240",
  ]);

  // Patrones para Ancho (ms)
  const [patternsAncho, setPatternsAncho] = useState<string[]>([
    "20",
    "40",
    "60",
    "100",
  ]);

  // Patrones para Onda, Rechazo, Selección QRS
  const [patternsOnda] = useState<string[]>(["Onda"]);
  const [patternsRechazo] = useState<string[]>(["Rechazo"]);
  const [patternsSeleccionQRS] = useState<string[]>(["Selección QRS"]);

  // Patrones para Amplitud (Hz) - dos filas
  const [patternsAmplitudHz, setPatternsAmplitudHz] = useState<string[]>([
    "1",
    "2",
    "3",
    "50",
  ]);

  // Estado por celda para valores numéricos y cualitativos
  const [values, setValues] = useState<Record<string, string>>({});

  const handleInputChange = (
    tipo: MeasurementType,
    rowIdx: number,
    colIdx: number,
    val: string,
  ) => {
    setValues((prev) => ({ ...prev, [`${tipo}-${rowIdx}-${colIdx}`]: val }));
  };

  const handlePatternChange = (
    tipo: MeasurementType,
    rowIdx: number,
    val: string,
  ) => {
    if (tipo === "ECG_AMPLITUD") {
      setPatternsAmplitud((prev) => {
        const next = [...prev];
        next[rowIdx] = val;
        return next;
      });
    } else if (tipo === "ECG_ANCHO") {
      setPatternsAncho((prev) => {
        const next = [...prev];
        next[rowIdx] = val;
        return next;
      });
    } else if (tipo === "ECG_AMPLITUD_HZ") {
      setPatternsAmplitudHz((prev) => {
        const next = [...prev];
        next[rowIdx] = val;
        return next;
      });
    }
  };

  const computeRowNumeric = useMemo(() => {
    return (tipo: MeasurementType, rowIdx: number): ElectrocardiografoRow => {
      const patterns =
        tipo === "ECG_AMPLITUD" ? patternsAmplitud : patternsAncho;

      const pStr = patterns[rowIdx] || "";
      const l1Str = values[`${tipo}-${rowIdx}-${IDX_L1}`] || "";

      const p = toNum(pStr);
      const l1 = toNum(l1Str);

      const error = Number.isFinite(p) && Number.isFinite(l1) ? l1 - p : NaN;

      return {
        tipo,
        patron: pStr,
        lectura1: l1Str,
        error: fmt(error, 2),
      };
    };
  }, [patternsAmplitud, patternsAncho, values]);

  const computeRowQualitative = useMemo(() => {
    return (tipo: MeasurementType, rowIdx: number): ElectrocardiografoRow => {
      let patterns: string[] = [];
      if (tipo === "ECG_ONDA") patterns = patternsOnda;
      else if (tipo === "ECG_RECHAZO") patterns = patternsRechazo;
      else if (tipo === "ECG_SELECCION_QRS") patterns = patternsSeleccionQRS;
      else if (tipo === "ECG_AMPLITUD_HZ") patterns = patternsAmplitudHz;
      else if (tipo === "ECG_ANCHO") patterns = patternsAncho;

      const pStr = patterns[rowIdx] || "";
      // CAMBIO CLAVE: Usar la clave correcta "resultado"
      const resultadoStr = values[`${tipo}-${rowIdx}-resultado`] || "";

      return {
        tipo,
        patron: pStr,
        lectura1: "",
        error: "",
        resultado: resultadoStr,
      };
    };
  }, [
    patternsOnda,
    patternsRechazo,
    patternsSeleccionQRS,
    patternsAmplitudHz,
    patternsAncho,
    values,
  ]);

  // Calcular estadísticas para ECG Amplitud
  const amplitudStats = useMemo(() => {
    const errors = patternsAmplitud
      .map((_, idx) => {
        const row = computeRowNumeric("ECG_AMPLITUD", idx);
        return toNum(row.error);
      })
      .filter(Number.isFinite) as number[];

    const errorPromedio =
      errors.length > 0
        ? errors.reduce((a, b) => a + b, 0) / errors.length
        : NaN;

    const desviacionEstandar =
      errors.length > 1
        ? Math.sqrt(
            errors.reduce((sum, e) => sum + Math.pow(e - errorPromedio, 2), 0) /
              (errors.length - 1),
          )
        : NaN;

    return { errorPromedio, desviacionEstandar };
  }, [patternsAmplitud, computeRowNumeric]);

  // Emitir datos al padre
  useEffect(() => {
    const amplitudRows = patternsAmplitud.map((_, rowIdx) => {
      const row = computeRowNumeric("ECG_AMPLITUD", rowIdx);
      return {
        ...row,
        errorPromedio:
          rowIdx === 0 ? fmt(amplitudStats.errorPromedio, 2) : undefined,
        desviacionEstandar:
          rowIdx === 0 ? fmt(amplitudStats.desviacionEstandar, 2) : undefined,
      };
    });

    const anchoRows = patternsAncho.map((_, rowIdx) =>
      computeRowQualitative("ECG_ANCHO", rowIdx),
    );

    const ondaRows = patternsOnda.map((_, rowIdx) =>
      computeRowQualitative("ECG_ONDA", rowIdx),
    );

    const rechazoRows = patternsRechazo.map((_, rowIdx) =>
      computeRowQualitative("ECG_RECHAZO", rowIdx),
    );

    const seleccionQRSRows = patternsSeleccionQRS.map((_, rowIdx) =>
      computeRowQualitative("ECG_SELECCION_QRS", rowIdx),
    );

    const amplitudHzRows = patternsAmplitudHz.map((_, rowIdx) =>
      computeRowQualitative("ECG_AMPLITUD_HZ", rowIdx),
    );

    onDataChange([
      ...amplitudRows,
      ...anchoRows,
      ...ondaRows,
      ...rechazoRows,
      ...seleccionQRSRows,
      ...amplitudHzRows,
    ]);
  }, [
    patternsAmplitud,
    patternsAncho,
    patternsOnda,
    patternsRechazo,
    patternsSeleccionQRS,
    patternsAmplitudHz,
    values,
    computeRowNumeric,
    computeRowQualitative,
    amplitudStats,
    onDataChange,
  ]);

  const renderNumericSection = (
    tipo: MeasurementType,
    title: string,
    patterns: string[],
    showStats: boolean = false,
  ) => {
    return (
      <>
        <tr>
          <td
            colSpan={COLUMNS_NUMERIC.length}
            style={{
              textAlign: "left",
              fontWeight: 600,
              padding: "0.6rem",
            }}
          >
            {title}
          </td>
        </tr>

        {patterns.map((patternVal, rowIdx) => (
          <tr key={`${tipo}-${rowIdx}`}>
            {COLUMNS_NUMERIC.map((col, colIdx) => (
              <td key={`${tipo}-${rowIdx}-${colIdx}`}>
                {col.type === "editable" && col.key === "patron" ? (
                  <input
                    className="input"
                    type="number"
                    step="1"
                    value={patternVal}
                    onChange={(e) =>
                      handlePatternChange(tipo, rowIdx, e.target.value)
                    }
                  />
                ) : col.type === "editable" ? (
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={values[`${tipo}-${rowIdx}-${colIdx}`] || ""}
                    onChange={(e) =>
                      handleInputChange(tipo, rowIdx, colIdx, e.target.value)
                    }
                  />
                ) : (
                  <span className="calc-value">
                    {col.formula === "ERROR"
                      ? computeRowNumeric(tipo, rowIdx).error || "-"
                      : "-"}
                  </span>
                )}
              </td>
            ))}
          </tr>
        ))}

        {showStats && (
          <tr
            style={{
              borderTop: "2px solid #34495e",
              color: "#ecf0f1",
            }}
          >
            <td style={{ padding: "0.8rem", color: "#ecf0f1" }}>
              ERROR PROMEDIO
            </td>
            <td
              colSpan={2}
              style={{
                textAlign: "center",
                fontSize: "1.1rem",
              }}
            >
              {fmt(amplitudStats.errorPromedio, 2) || "-"}
            </td>
          </tr>
        )}

        {showStats && (
          <tr
            style={{
              borderBottom: "2px solid #2c3e50",
            }}
          >
            <td style={{ padding: "0.8rem", color: "#ecf0f1" }}>
              DESVIACIÓN ESTÁNDAR
            </td>
            <td
              colSpan={2}
              style={{
                textAlign: "center",
                fontSize: "1.1rem",
              }}
            >
              {fmt(amplitudStats.desviacionEstandar, 2) || "-"}
            </td>
          </tr>
        )}

        <tr>
          <td colSpan={COLUMNS_NUMERIC.length} style={{ padding: "0.4rem" }} />
        </tr>
      </>
    );
  };
  const renderQualitativeSection = (
    tipo: MeasurementType,
    title: string,
    patterns: string[],
  ) => {
    return (
      <>
        <tr>
          <td
            colSpan={COLUMNS_QUALITATIVE.length}
            style={{
              textAlign: "center",
              fontWeight: 700,
              padding: "1rem 0.8rem",
              color: "#ecf0f1",
              fontSize: "1rem",
              letterSpacing: "0.5px",
              backgroundColor: "#2c3e50",
              borderBottom: "2px solid #34495e",
            }}
          >
            {title}
          </td>
        </tr>

        {patterns.map((patternVal, rowIdx) => (
          <tr
            key={`${tipo}-${rowIdx}`}
            style={{
              borderBottom: "1px solid #2c3e50",
              transition: "background-color 0.2s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(52, 73, 94, 0.3)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <td
              style={{
                padding: "1.2rem 0.8rem",
                verticalAlign: "middle",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  margin: "0 0 0.8rem 0",
                  color: "#ecf0f1",
                  fontSize: "1.5rem",
                  fontWeight: 500,
                }}
              >
                {patternVal}
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  gap: "1rem",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={values[`${tipo}-${rowIdx}-resultado`] === "OK"}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        [`${tipo}-${rowIdx}-resultado`]: e.target.checked
                          ? "OK"
                          : "NO RESPONDE",
                      }))
                    }
                    style={{
                      cursor: "pointer",
                      width: "24px",
                      height: "24px",
                      accentColor: "#2ecc71",
                      borderRadius: "4px",
                      border: "2px solid #2ecc71",
                      transition: "all 0.3s ease",
                      boxShadow:
                        values[`${tipo}-${rowIdx}-resultado`] === "OK"
                          ? "0 0 8px rgba(46, 204, 113, 0.4)"
                          : "none",
                    }}
                  />
                  <span
                    style={{
                      color: "#ecf0f1",
                      fontSize: "0.95rem",
                      fontWeight: 500,
                    }}
                  >
                    OK
                  </span>
                </label>

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={
                      values[`${tipo}-${rowIdx}-resultado`] === "NO RESPONDE"
                    }
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        [`${tipo}-${rowIdx}-resultado`]: e.target.checked
                          ? "NO RESPONDE"
                          : "OK",
                      }))
                    }
                    style={{
                      cursor: "pointer",
                      width: "24px",
                      height: "24px",
                      accentColor: "#e74c3c",
                      borderRadius: "4px",
                      border: "2px solid #e74c3c",
                      transition: "all 0.3s ease",
                      boxShadow:
                        values[`${tipo}-${rowIdx}-resultado`] === "NO RESPONDE"
                          ? "0 0 8px rgba(231, 76, 60, 0.4)"
                          : "none",
                    }}
                  />
                  <span
                    style={{
                      color: "#ecf0f1",
                      fontSize: "0.95rem",
                      fontWeight: 500,
                    }}
                  >
                    NO RESPONDE
                  </span>
                </label>
              </div>
            </td>
            <td style={{ padding: "1.2rem 0.8rem", verticalAlign: "middle" }}>
              <div
                style={{
                  padding: "0.6rem 1rem",
                  borderRadius: "6px",
                  backgroundColor:
                    values[`${tipo}-${rowIdx}-resultado`] === "OK"
                      ? "rgba(46, 204, 113, 0.15)"
                      : "rgba(231, 76, 60, 0.15)",
                  textAlign: "center",
                  minWidth: "120px",
                }}
              >
                <span
                  style={{
                    color:
                      values[`${tipo}-${rowIdx}-resultado`] === "OK"
                        ? "#2ecc71"
                        : "#e74c3c",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    letterSpacing: "0.3px",
                  }}
                >
                  {values[`${tipo}-${rowIdx}-resultado`] || "NO RESPONDE"}
                </span>
              </div>
            </td>
          </tr>
        ))}
      </>
    );
  };

  return (
    <div className="table-responsive">
      <table className="smart-grid-table">
        <thead>
          <tr>
            {COLUMNS_NUMERIC.map((col, index) => (
              <th
                key={index}
                className={col.type === "editable" ? "editable" : "readOnly"}
              >
                {col.value}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {renderNumericSection(
            "ECG_AMPLITUD",
            "ECG - Amplitud de Onda (FC)",
            patternsAmplitud,
            true,
          )}
        </tbody>
      </table>

      <table className="smart-grid-table">
        <thead>
          <tr>
            {COLUMNS_QUALITATIVE.map((col, index) => (
              <th
                key={index}
                style={{
                  textAlign: "center",
                }}
              >
                {col.value}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {renderQualitativeSection("ECG_ANCHO", "Ancho (ms)", patternsAncho)}
          {renderQualitativeSection("ECG_ONDA", "Onda", patternsOnda, false)}
          {renderQualitativeSection(
            "ECG_RECHAZO",
            "Rechazo",
            patternsRechazo,
            false,
          )}
          {renderQualitativeSection(
            "ECG_SELECCION_QRS",
            "Selección QRS",
            patternsSeleccionQRS,
            false,
          )}
          {renderQualitativeSection(
            "ECG_AMPLITUD_HZ",
            "Amplitud (Hz)",
            patternsAmplitudHz,
          )}

          <tr>
            <td
              colSpan={COLUMNS_QUALITATIVE.length}
              style={{
                textAlign: "center",
                fontSize: "0.75rem",
                opacity: 0.6,
                padding: "0.8rem",
              }}
            >
              ● Fin de registros de calibración ●
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ElectrocardiografoTable;
