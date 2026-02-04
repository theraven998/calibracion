import React, { useEffect, useMemo, useState } from "react";
export type PressureType = "SISTOLICA" | "DIASTOLICA";

export interface ExactitudRow {
  tipo: PressureType;
  patron: string;

  lectura1: string;
  lectura2: string;
  lectura3: string;

  error1: string;
  error2: string;
  error3: string;

  errorPromedio: string;
  desviacion: string;

  incertidumbre: string; // fijo 0.1 (según tu tabla)
  incExpandida: string; // fijo 0.2 (según tu tabla)
}

interface Props {
  onDataChange: (data: ExactitudRow[]) => void;
}

const IDX_PATRON = 0;
const IDX_L1 = 1;
const IDX_L2 = 2;
const IDX_L3 = 3;

const INTERNAL_COLUMNS = [
  { value: "PATRON", type: "readOnly", key: "patron" },
  { value: "PRIMERA", type: "editable", key: "lectura1" },
  { value: "SEGUNDA", type: "editable", key: "lectura2" },
  { value: "TERCERA", type: "editable", key: "lectura3" },
  { value: "ERROR PROMEDIO", type: "readOnly", formula: "ERROR_PROM" },
  { value: "DESVIACION", type: "readOnly", formula: "DESV" },
  { value: "INCERTIDUMBRE", type: "readOnly", formula: "U" },
  { value: "INC. EXPANDIDA", type: "readOnly", formula: "U_EXP" },
];

function toNum(s: string) {
  const n = parseFloat((s || "").replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
}

function fmt(n: number, decimals = 1) {
  if (!Number.isFinite(n)) return "";
  return n.toFixed(decimals);
}

function calcStdDevSample(nums: number[]) {
  // desviación estándar muestral (n-1). Si n<2 => 0
  const n = nums.length;
  if (n < 2) return 0;

  const mean = nums.reduce((a, b) => a + b, 0) / n;
  const variance =
    nums.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / (n - 1);

  return Math.sqrt(variance);
}

const ExactitudTable: React.FC<Props> = ({ onDataChange }) => {
  // Patrones editables (por defecto los de tu tabla)
  const [patternsSis, setPatternsSis] = useState<string[]>([
    "60",
    "80",
    "120",
    "150",
    "190",
    "220",
  ]);

  const [patternsDia, setPatternsDia] = useState<string[]>([
    "30",
    "50",
    "80",
    "90",
    "130",
    "140",
  ]);

  // Estado por celda:
  // clave = `${tipo}-${rowIdx}-${colIdx}`
  const [values, setValues] = useState<Record<string, string>>({});

  const handleInputChange = (
    tipo: PressureType,
    rowIdx: number,
    colIdx: number,
    val: string
  ) => {
    setValues((prev) => ({ ...prev, [`${tipo}-${rowIdx}-${colIdx}`]: val }));
  };

  const handlePatternChange = (
    tipo: PressureType,
    rowIdx: number,
    val: string
  ) => {
    if (tipo === "SISTOLICA") {
      setPatternsSis((prev) => {
        const next = [...prev];
        next[rowIdx] = val;
        return next;
      });
    } else {
      setPatternsDia((prev) => {
        const next = [...prev];
        next[rowIdx] = val;
        return next;
      });
    }
  };

  const computeRow = useMemo(() => {
    return (tipo: PressureType, rowIdx: number): ExactitudRow => {
      const patterns = tipo === "SISTOLICA" ? patternsSis : patternsDia;

      const pStr = patterns[rowIdx] || "";
      const l1Str = values[`${tipo}-${rowIdx}-${IDX_L1}`] || "";
      const l2Str = values[`${tipo}-${rowIdx}-${IDX_L2}`] || "";
      const l3Str = values[`${tipo}-${rowIdx}-${IDX_L3}`] || "";

      const p = toNum(pStr);
      const l1 = toNum(l1Str);
      const l2 = toNum(l2Str);
      const l3 = toNum(l3Str);

      const e1 = Number.isFinite(p) && Number.isFinite(l1) ? l1 - p : NaN;
      const e2 = Number.isFinite(p) && Number.isFinite(l2) ? l2 - p : NaN;
      const e3 = Number.isFinite(p) && Number.isFinite(l3) ? l3 - p : NaN;

      const errors = [e1, e2, e3].filter(Number.isFinite) as number[];
      const errProm = errors.length
        ? errors.reduce((a, b) => a + b, 0) / errors.length
        : NaN;
      const desv = errors.length ? calcStdDevSample(errors) : NaN;

      return {
        tipo,
        patron: pStr,
        lectura1: l1Str,
        lectura2: l2Str,
        lectura3: l3Str,
        error1: fmt(e1, 1),
        error2: fmt(e2, 1),
        error3: fmt(e3, 1),
        errorPromedio: fmt(errProm, 1),
        desviacion: fmt(desv, 1),
        incertidumbre: "0.1",
        incExpandida: "0.2",
      };
    };
  }, [patternsSis, patternsDia, values]);

  // Emitir datos al padre (sistólica + diastólica)
  useEffect(() => {
    const sis = patternsSis.map((_, rowIdx) => computeRow("SISTOLICA", rowIdx));
    const dia = patternsDia.map((_, rowIdx) =>
      computeRow("DIASTOLICA", rowIdx)
    );
    onDataChange([...sis, ...dia]);
  }, [patternsSis, patternsDia, values, computeRow, onDataChange]);

  const calcForRender = (
    tipo: PressureType,
    rowIdx: number,
    formula: string
  ) => {
    const row = computeRow(tipo, rowIdx);

    switch (formula) {
      case "ERROR1":
        return row.error1 || "-";
      case "ERROR2":
        return row.error2 || "-";
      case "ERROR3":
        return row.error3 || "-";
      case "ERROR_PROM":
        return row.errorPromedio || "-";
      case "DESV":
        return row.desviacion || "-";
      case "U":
        return "0.1";
      case "U_EXP":
        return "0.2";
      default:
        return "-";
    }
  };

  const renderSection = (tipo: PressureType, title: string) => {
    const patterns = tipo === "SISTOLICA" ? patternsSis : patternsDia;

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
                    step="0.1"
                    placeholder="0.0"
                    value={values[`${tipo}-${rowIdx}-${colIdx}`] || ""}
                    onChange={(e) =>
                      handleInputChange(tipo, rowIdx, colIdx, e.target.value)
                    }
                  />
                ) : col.value === "PATRON" ? (
                  <input
                    className="input"
                    type="number"
                    step="0.1"
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

        {/* Fila en blanco (tal como tus notas: una fila de espacio entre tablas) */}
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
          {renderSection("SISTOLICA", "SISTOLICA")}
          {renderSection("DIASTOLICA", "DIASTOLICA")}

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

export default ExactitudTable;
