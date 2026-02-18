import React, { useEffect, useMemo, useState } from "react";

export type MeasurementType = "ECG" | "DESFIBRILACION" | "TIEMPO_CARGA";

export interface DesfibriladorRow {
  tipo: MeasurementType;
  patron: string;
  lectura1?: string;
  lectura2?: string;
  lectura3?: string;
  lectura4?: string;
  lectura5?: string;
  error?: string;
  errorPromedio?: string;
  desviacionEstandar?: string;
  incertidumbre?: string;
  incertidumbreExpandida?: string;
  tiempoPromedio?: string;
}

interface Props {
  onDataChange: (data: DesfibriladorRow[]) => void;
}

const IDX_PATRON = 0;
const IDX_L1 = 1;
const IDX_L2 = 2;
const IDX_L3 = 3;
const IDX_L4 = 4;
const IDX_L5 = 5;

// Columnas para ECG (solo 1 lectura)
const COLUMNS_ECG = [
  { value: "PATRON (BPM)", type: "editable", key: "patron" },
  { value: "PRIMERA", type: "editable", key: "lectura1" },
  { value: "ERROR", type: "readOnly", formula: "ERROR" },
];

// Columnas para Desfibrilación (5 lecturas)
const COLUMNS_DESFIB = [
  { value: "PATRON (J)", type: "editable", key: "patron" },
  { value: "PRIMERA", type: "editable", key: "lectura1" },
  { value: "SEGUNDA", type: "editable", key: "lectura2" },
  { value: "TERCERA", type: "editable", key: "lectura3" },
  { value: "CUARTA", type: "editable", key: "lectura4" },
  { value: "QUINTA", type: "editable", key: "lectura5" },
  { value: "ERROR", type: "readOnly", formula: "ERROR" },
];

// Columnas para Tiempo de Carga (solo 1 lectura)
const COLUMNS_TIEMPO = [
  { value: "PATRON (J)", type: "editable", key: "patron" },
  { value: "TIEMPO (s)", type: "editable", key: "lectura1" },
];

function toNum(s: string) {
  const n = parseFloat((s || "").replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
}

function fmt(n: number, decimals = 2) {
  if (!Number.isFinite(n)) return "";
  return n.toFixed(decimals);
}

const DesfibriladorTable: React.FC<Props> = ({ onDataChange }) => {
  // Patrones ECG
  const [patternsECG] = useState<string[]>([
    "20",
    "30",
    "40",
    "60",
    "80",
    "120",
    "160",
    "200",
  ]);

  // Patrones Desfibrilación
  const [patternsDesfib] = useState<string[]>([
    "50",
    "100",
    "150",
    "200",
    "300",
    "360",
  ]);

  // Patrones Tiempo de Carga
  const [patternsTiempo] = useState<string[]>([
    "50",
    "100",
    "150",
    "200",
    "360",
  ]);

  const [values, setValues] = useState<Record<string, string>>({});

  const handleInputChange = (
    tipo: MeasurementType,
    rowIdx: number,
    colIdx: number,
    val: string,
  ) => {
    setValues((prev) => ({ ...prev, [`${tipo}-${rowIdx}-${colIdx}`]: val }));
  };

  // Calcular fila ECG (1 lectura)
  const computeRowECG = useMemo(() => {
    return (rowIdx: number): DesfibriladorRow => {
      const pStr = patternsECG[rowIdx] || "";
      const l1Str = values[`ECG-${rowIdx}-${IDX_L1}`] || "";

      const p = toNum(pStr);
      const l1 = toNum(l1Str);

      const error = Number.isFinite(p) && Number.isFinite(l1) ? l1 - p : NaN;

      return {
        tipo: "ECG",
        patron: pStr,
        lectura1: l1Str,
        error: fmt(error, 2),
      };
    };
  }, [patternsECG, values]);

  // Calcular fila Desfibrilación (5 lecturas)
  const computeRowDesfib = useMemo(() => {
    return (rowIdx: number): DesfibriladorRow => {
      const pStr = patternsDesfib[rowIdx] || "";
      const l1Str = values[`DESFIBRILACION-${rowIdx}-${IDX_L1}`] || "";
      const l2Str = values[`DESFIBRILACION-${rowIdx}-${IDX_L2}`] || "";
      const l3Str = values[`DESFIBRILACION-${rowIdx}-${IDX_L3}`] || "";
      const l4Str = values[`DESFIBRILACION-${rowIdx}-${IDX_L4}`] || "";
      const l5Str = values[`DESFIBRILACION-${rowIdx}-${IDX_L5}`] || "";

      const p = toNum(pStr);
      const l1 = toNum(l1Str);
      const l2 = toNum(l2Str);
      const l3 = toNum(l3Str);
      const l4 = toNum(l4Str);
      const l5 = toNum(l5Str);

      // Promedio de las 5 lecturas
      const lecturas = [l1, l2, l3, l4, l5].filter(Number.isFinite);
      const promedio =
        lecturas.length > 0
          ? lecturas.reduce((a, b) => a + b, 0) / lecturas.length
          : NaN;

      const error =
        Number.isFinite(p) && Number.isFinite(promedio) ? promedio - p : NaN;

      return {
        tipo: "DESFIBRILACION",
        patron: pStr,
        lectura1: l1Str,
        lectura2: l2Str,
        lectura3: l3Str,
        lectura4: l4Str,
        lectura5: l5Str,
        error: fmt(error, 2),
      };
    };
  }, [patternsDesfib, values]);

  // Calcular fila Tiempo de Carga
  const computeRowTiempo = useMemo(() => {
    return (rowIdx: number): DesfibriladorRow => {
      const pStr = patternsTiempo[rowIdx] || "";
      const l1Str = values[`TIEMPO_CARGA-${rowIdx}-${IDX_L1}`] || "";

      return {
        tipo: "TIEMPO_CARGA",
        patron: pStr,
        lectura1: l1Str,
      };
    };
  }, [patternsTiempo, values]);

  // Estadísticas ECG
  const ecgStats = useMemo(() => {
    const errors = patternsECG
      .map((_, idx) => {
        const row = computeRowECG(idx);
        return toNum(row.error || "");
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
  }, [patternsECG, computeRowECG]);

  // Estadísticas Desfibrilación
  const desfibStats = useMemo(() => {
    const errors = patternsDesfib
      .map((_, idx) => {
        const row = computeRowDesfib(idx);
        return toNum(row.error || "");
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

    // Incertidumbre (ejemplo fijo, puedes hacerlo editable)
    const incertidumbre = 0.1;
    const incertidumbreExpandida = incertidumbre * 2;

    return {
      errorPromedio,
      desviacionEstandar,
      incertidumbre,
      incertidumbreExpandida,
    };
  }, [patternsDesfib, computeRowDesfib]);

  // Tiempo promedio
  const tiempoStats = useMemo(() => {
    const tiempos = patternsTiempo
      .map((_, idx) => {
        const row = computeRowTiempo(idx);
        return toNum(row.lectura1 || "");
      })
      .filter(Number.isFinite) as number[];

    const tiempoPromedio =
      tiempos.length > 0
        ? tiempos.reduce((a, b) => a + b, 0) / tiempos.length
        : NaN;

    return { tiempoPromedio };
  }, [patternsTiempo, computeRowTiempo]);

  // Emitir datos
  useEffect(() => {
    const ecgRows = patternsECG.map((_, rowIdx) => {
      const row = computeRowECG(rowIdx);
      return {
        ...row,
        errorPromedio:
          rowIdx === 0 ? fmt(ecgStats.errorPromedio, 2) : undefined,
        desviacionEstandar:
          rowIdx === 0 ? fmt(ecgStats.desviacionEstandar, 2) : undefined,
      };
    });

    const desfibRows = patternsDesfib.map((_, rowIdx) => {
      const row = computeRowDesfib(rowIdx);
      return {
        ...row,
        errorPromedio:
          rowIdx === 0 ? fmt(desfibStats.errorPromedio, 2) : undefined,
        desviacionEstandar:
          rowIdx === 0 ? fmt(desfibStats.desviacionEstandar, 2) : undefined,
        incertidumbre:
          rowIdx === 0 ? fmt(desfibStats.incertidumbre, 2) : undefined,
        incertidumbreExpandida:
          rowIdx === 0 ? fmt(desfibStats.incertidumbreExpandida, 2) : undefined,
      };
    });

    const tiempoRows = patternsTiempo.map((_, rowIdx) => {
      const row = computeRowTiempo(rowIdx);
      return {
        ...row,
        tiempoPromedio:
          rowIdx === 0 ? fmt(tiempoStats.tiempoPromedio, 2) : undefined,
      };
    });

    onDataChange([...ecgRows, ...desfibRows, ...tiempoRows]);
  }, [
    patternsECG,
    patternsDesfib,
    patternsTiempo,
    values,
    computeRowECG,
    computeRowDesfib,
    computeRowTiempo,
    ecgStats,
    desfibStats,
    tiempoStats,
    onDataChange,
  ]);

  return (
    <div className="table-responsive">
      {/* TABLA ECG */}
      <table className="smart-grid-table">
        <thead>
          <tr>
            <th
              colSpan={COLUMNS_ECG.length}
              style={{
                textAlign: "center",
                fontSize: "1rem",
                backgroundColor: "#2c3e50",
                color: "#ecf0f1",
                padding: "0.8rem",
              }}
            >
              ECG - FRECUENCIA CARDÍACA
            </th>
          </tr>
          <tr>
            {COLUMNS_ECG.map((col, index) => (
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
          {patternsECG.map((patternVal, rowIdx) => (
            <tr key={`ECG-${rowIdx}`}>
              {COLUMNS_ECG.map((col, colIdx) => (
                <td key={`ECG-${rowIdx}-${colIdx}`}>
                  {col.type === "editable" ? (
                    <input
                      className="input"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={
                        col.key === "patron"
                          ? patternVal
                          : values[`ECG-${rowIdx}-${colIdx}`] || ""
                      }
                      onChange={(e) =>
                        col.key === "patron"
                          ? null
                          : handleInputChange(
                              "ECG",
                              rowIdx,
                              colIdx,
                              e.target.value,
                            )
                      }
                      disabled={col.key === "patron"}
                    />
                  ) : (
                    <span className="calc-value">
                      {computeRowECG(rowIdx).error || "-"}
                    </span>
                  )}
                </td>
              ))}
            </tr>
          ))}
          <tr style={{ borderTop: "2px solid #34495e" }}>
            <td style={{ color: "#ecf0f1", fontWeight: 600 }}>
              ERROR PROMEDIO
            </td>
            <td
              colSpan={2}
              style={{
                textAlign: "center",
                color: "#ecf0f1",
                fontSize: "1.1rem",
              }}
            >
              {fmt(ecgStats.errorPromedio, 2) || "-"}
            </td>
          </tr>
          <tr>
            <td style={{ color: "#ecf0f1", fontWeight: 600 }}>
              DESVIACIÓN ESTÁNDAR
            </td>
            <td
              colSpan={2}
              style={{
                textAlign: "center",
                color: "#ecf0f1",
                fontSize: "1.1rem",
              }}
            >
              {fmt(ecgStats.desviacionEstandar, 2) || "-"}
            </td>
          </tr>
        </tbody>
      </table>

      {/* TABLA DESFIBRILACIÓN */}
      <table className="smart-grid-table" style={{ marginTop: "2rem" }}>
        <thead>
          <tr>
            <th
              colSpan={COLUMNS_DESFIB.length}
              style={{
                textAlign: "center",
                fontSize: "1rem",
                backgroundColor: "#2c3e50",
                color: "#ecf0f1",
                padding: "0.8rem",
              }}
            >
              DESFIBRILACIÓN (JOULES)
            </th>
          </tr>
          <tr>
            {COLUMNS_DESFIB.map((col, index) => (
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
          {patternsDesfib.map((patternVal, rowIdx) => (
            <tr key={`DESFIB-${rowIdx}`}>
              {COLUMNS_DESFIB.map((col, colIdx) => (
                <td key={`DESFIB-${rowIdx}-${colIdx}`}>
                  {col.type === "editable" ? (
                    <input
                      className="input"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={
                        col.key === "patron"
                          ? patternVal
                          : values[`DESFIBRILACION-${rowIdx}-${colIdx}`] || ""
                      }
                      onChange={(e) =>
                        col.key === "patron"
                          ? null
                          : handleInputChange(
                              "DESFIBRILACION",
                              rowIdx,
                              colIdx,
                              e.target.value,
                            )
                      }
                      disabled={col.key === "patron"}
                    />
                  ) : (
                    <span className="calc-value">
                      {computeRowDesfib(rowIdx).error || "-"}
                    </span>
                  )}
                </td>
              ))}
            </tr>
          ))}
          <tr style={{ borderTop: "2px solid #34495e" }}>
            <td style={{ color: "#ecf0f1", fontWeight: 600 }}>
              ERROR PROMEDIO
            </td>
            <td
              colSpan={6}
              style={{
                textAlign: "center",
                color: "#ecf0f1",
                fontSize: "1.1rem",
              }}
            >
              {fmt(desfibStats.errorPromedio, 2) || "-"}
            </td>
          </tr>
          <tr>
            <td style={{ color: "#ecf0f1", fontWeight: 600 }}>
              DESVIACIÓN ESTÁNDAR
            </td>
            <td
              colSpan={6}
              style={{
                textAlign: "center",
                color: "#ecf0f1",
                fontSize: "1.1rem",
              }}
            >
              {fmt(desfibStats.desviacionEstandar, 2) || "-"}
            </td>
          </tr>
          <tr>
            <td style={{ color: "#ecf0f1", fontWeight: 600 }}>INCERTIDUMBRE</td>
            <td
              colSpan={6}
              style={{
                textAlign: "center",
                color: "#ecf0f1",
                fontSize: "1.1rem",
              }}
            >
              {fmt(desfibStats.incertidumbre, 2) || "-"}
            </td>
          </tr>
          <tr>
            <td style={{ color: "#ecf0f1", fontWeight: 600 }}>
              INCERTIDUMBRE EXPANDIDA
            </td>
            <td
              colSpan={6}
              style={{
                textAlign: "center",
                color: "#ecf0f1",
                fontSize: "1.1rem",
              }}
            >
              {fmt(desfibStats.incertidumbreExpandida, 2) || "-"}
            </td>
          </tr>
        </tbody>
      </table>

      {/* TABLA TIEMPO DE CARGA */}
      <table className="smart-grid-table" style={{ marginTop: "2rem" }}>
        <thead>
          <tr>
            <th
              colSpan={COLUMNS_TIEMPO.length}
              style={{
                textAlign: "center",
                fontSize: "1rem",
                backgroundColor: "#2c3e50",
                color: "#ecf0f1",
                padding: "0.8rem",
              }}
            >
              TIEMPO DE CARGA (s)
            </th>
          </tr>
          <tr>
            {COLUMNS_TIEMPO.map((col, index) => (
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
          {patternsTiempo.map((patternVal, rowIdx) => (
            <tr key={`TIEMPO-${rowIdx}`}>
              {COLUMNS_TIEMPO.map((col, colIdx) => (
                <td key={`TIEMPO-${rowIdx}-${colIdx}`}>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={
                      col.key === "patron"
                        ? patternVal
                        : values[`TIEMPO_CARGA-${rowIdx}-${colIdx}`] || ""
                    }
                    onChange={(e) =>
                      col.key === "patron"
                        ? null
                        : handleInputChange(
                            "TIEMPO_CARGA",
                            rowIdx,
                            colIdx,
                            e.target.value,
                          )
                    }
                    disabled={col.key === "patron"}
                  />
                </td>
              ))}
            </tr>
          ))}
          <tr style={{ borderTop: "2px solid #34495e" }}>
            <td style={{ color: "#ecf0f1", fontWeight: 600 }}>
              TIEMPO PROMEDIO
            </td>
            <td
              style={{
                textAlign: "center",
                color: "#ecf0f1",
                fontSize: "1.1rem",
              }}
            >
              {fmt(tiempoStats.tiempoPromedio, 2) || "-"}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default DesfibriladorTable;
