import React, { useEffect, useMemo, useState } from "react";

export type MeasurementType = "SPO2_PERCENT" | "SPO2_FP";

export interface PulsoximetroRow {
  tipo: MeasurementType;
  patron: string;

  lectura1: string;
  lectura2: string;

  error1: string;
  error2: string;
  errorPromedio: string;

  incertidumbre: string;
  incExpandida: string;
}

interface Props {
  onDataChange: (data: PulsoximetroRow[]) => void;
}

const IDX_PATRON = 0;
const IDX_L1 = 1;
const IDX_L2 = 2;

const INTERNAL_COLUMNS = [
  { value: "PATRON", type: "readOnly", key: "patron" },
  { value: "PRIMERA", type: "editable", key: "lectura1" },
  { value: "SEGUNDA", type: "editable", key: "lectura2" },
  { value: "ERROR", type: "readOnly", formula: "ERROR_PROM" },
  { value: "INCERTIDUMBRE", type: "readOnly", formula: "U" },
  { value: "INC. EXPANDIDA", type: "readOnly", formula: "U_EXP" },
];

function toNum(s: string) {
  const n = parseFloat((s || "").replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
}

function fmt(n: number, decimals = 2) {
  if (!Number.isFinite(n)) return "";
  return n.toFixed(decimals);
}

const PulsoximetroTable: React.FC<Props> = ({ onDataChange }) => {
  // Patrones editables basados en la imagen
  const [patternsSPO2, setPatternsSPO2] = useState<string[]>([
    "85",
    "90",
    "95",
    "98",
    "100",
  ]);

  const [patternsFP, setPatternsFP] = useState<string[]>([
    "30",
    "65",
    "80",
    "100",
    "120",
  ]);

  // Estado por celda:
  // clave = `${tipo}-${rowIdx}-${colIdx}`
  const [values, setValues] = useState<Record<string, string>>({});

  const handleInputChange = (
    tipo: MeasurementType,
    rowIdx: number,
    colIdx: number,
    val: string
  ) => {
    setValues((prev) => ({ ...prev, [`${tipo}-${rowIdx}-${colIdx}`]: val }));
  };

  const handlePatternChange = (
    tipo: MeasurementType,
    rowIdx: number,
    val: string
  ) => {
    if (tipo === "SPO2_PERCENT") {
      setPatternsSPO2((prev) => {
        const next = [...prev];
        next[rowIdx] = val;
        return next;
      });
    } else {
      setPatternsFP((prev) => {
        const next = [...prev];
        next[rowIdx] = val;
        return next;
      });
    }
  };

  const computeRow = useMemo(() => {
    return (tipo: MeasurementType, rowIdx: number): PulsoximetroRow => {
      const patterns = tipo === "SPO2_PERCENT" ? patternsSPO2 : patternsFP;

      const pStr = patterns[rowIdx] || "";
      const l1Str = values[`${tipo}-${rowIdx}-${IDX_L1}`] || "";
      const l2Str = values[`${tipo}-${rowIdx}-${IDX_L2}`] || "";

      const p = toNum(pStr);
      const l1 = toNum(l1Str);
      const l2 = toNum(l2Str);

      const e1 = Number.isFinite(p) && Number.isFinite(l1) ? l1 - p : NaN;
      const e2 = Number.isFinite(p) && Number.isFinite(l2) ? l2 - p : NaN;

      // Calcular error promedio de las dos medidas
      const errors = [e1, e2].filter(Number.isFinite) as number[];
      const errProm = errors.length
        ? errors.reduce((a, b) => a + b, 0) / errors.length
        : NaN;

      return {
        tipo,
        patron: pStr,
        lectura1: l1Str,
        lectura2: l2Str,
        error1: fmt(e1, 2),
        error2: fmt(e2, 2),
        errorPromedio: fmt(errProm, 2),
        incertidumbre: "0.1",
        incExpandida: "0.2",
      };
    };
  }, [patternsSPO2, patternsFP, values]);

  // Emitir datos al padre (SpO2 % + SpO2 FP)
  useEffect(() => {
    const spo2 = patternsSPO2.map((_, rowIdx) =>
      computeRow("SPO2_PERCENT", rowIdx)
    );
    const fp = patternsFP.map((_, rowIdx) => computeRow("SPO2_FP", rowIdx));
    onDataChange([...spo2, ...fp]);
  }, [patternsSPO2, patternsFP, values, computeRow, onDataChange]);

  const calcForRender = (
    tipo: MeasurementType,
    rowIdx: number,
    formula: string
  ) => {
    const row = computeRow(tipo, rowIdx);

    switch (formula) {
      case "ERROR1":
        return row.error1 || "-";
      case "ERROR2":
        return row.error2 || "-";
      case "ERROR_PROM":
        return row.errorPromedio || "-";
      case "U":
        return "0.1";
      case "U_EXP":
        return "0.2";
      default:
        return "-";
    }
  };

  const renderSection = (tipo: MeasurementType, title: string) => {
    const patterns = tipo === "SPO2_PERCENT" ? patternsSPO2 : patternsFP;

    return (
      <>
        <tr>
          <td
            colSpan={INTERNAL_COLUMNS.length}
            style={{ textAlign: "left", fontWeight: 600, padding: "0.6rem" }}
          >
            {title}
          </td>
        </tr>

        {patterns.map((patternVal, rowIdx) => (
          <tr key={`${tipo}-${rowIdx}`}>
            {INTERNAL_COLUMNS.map((col, colIdx) => (
              <td key={`${tipo}-${rowIdx}-${colIdx}`}>
                {col.type === "editable" ? (
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={values[`${tipo}-${rowIdx}-${colIdx}`] || ""}
                    onChange={(e) =>
                      handleInputChange(tipo, rowIdx, colIdx, e.target.value)
                    }
                  />
                ) : col.value === "PATRON" ? (
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    value={patternVal}
                    onChange={(e) =>
                      handlePatternChange(tipo, rowIdx, e.target.value)
                    }
                  />
                ) : (
                  <span className="calc-value">
                    {col.formula
                      ? calcForRender(tipo, rowIdx, col.formula)
                      : "-"}
                  </span>
                )}
              </td>
            ))}
          </tr>
        ))}

        {/* Fila en blanco entre tablas */}
        <tr>
          <td colSpan={INTERNAL_COLUMNS.length} style={{ padding: "0.4rem" }} />
        </tr>
      </>
    );
  };

  return (
    <div className="table-responsive">
      <table className="smart-grid-table">
        <thead>
          <tr>
            {INTERNAL_COLUMNS.map((col, index) => (
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
          {renderSection("SPO2_PERCENT", "SPO2 (%)")}
          {renderSection("SPO2_FP", "SPO2 (FP)")}

          <tr>
            <td
              colSpan={INTERNAL_COLUMNS.length}
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

export default PulsoximetroTable;
