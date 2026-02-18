import React, { useState, useEffect, useCallback } from "react";
import "./CalibrationTable.css";

// --- 1. Definición de Tipos para exportar ---
export interface CalibrationRow {
  patron: string;
  lectura1: string;
  lectura2: string;
  error: string;
  incertidumbre: string;
}

interface Props {
  // Función para comunicar datos al padre
  onDataChange: (data: CalibrationRow[]) => void;
}

// --- 2. CONFIGURACIÓN DE COLUMNAS (Indices fijos para referencia) ---
// Es útil saber los índices para mapear el objeto 'values'
const IDX_PATRON = 0;
const IDX_L1 = 1;
const IDX_L2 = 2;

const INTERNAL_COLUMNS = [
  { value: "PATRON", type: "readOnly", key: "patron" },
  { value: "PRIMERA LECTURA", type: "editable", key: "lectura1" },
  { value: "SEGUNDA LECTURA", type: "editable", key: "lectura2" },
  { value: "ERROR", type: "readOnly", formula: "ERROR_TWO_TAKE" },
  { value: "INCERTIDUMBRE", type: "readOnly", formula: "INCERTIDUMBRE" },
];

const CalibrationTable = ({ onDataChange }: Props) => {
  const [internalPatters, setInternalPatterns] = useState<string[]>([
    "2.00",
    "5.00",
    "10.00",
    "15.00",
  ]);

  // Estado de inputs: Clave "fila-columna", Valor string
  const [values, setValues] = useState<{ [key: string]: string }>({});

  // --- 3. Lógica de Cálculo y Sincronización con el Padre ---

  // Esta función calcula el error igual que tu switch original,
  // pero pura (sin depender del estado visual para el render)
  const calculateError = (p: number, v1: number, v2: number) => {
    // Fórmula: ERROR_TWO_TAKE -> (Promedio) - Patron
    const promedio = (v1 + v2) / 2;
    return (promedio - p).toFixed(2);
  };

  useEffect(() => {
    // Transformamos el estado "celda por celda" a un array de objetos "por fila"
    const structuredData: CalibrationRow[] = internalPatters.map(
      (patronVal, rowIdx) => {
        // Obtenemos valores crudos del estado
        const l1Str = values[`${rowIdx}-${IDX_L1}`] || "";
        const l2Str = values[`${rowIdx}-${IDX_L2}`] || "";

        // Convertimos a números para calcular
        const p = parseFloat(patronVal) || 0;
        const v1 = parseFloat(l1Str) || 0;
        const v2 = parseFloat(l2Str) || 0;

        return {
          patron: patronVal,
          lectura1: l1Str,
          lectura2: l2Str,
          error: calculateError(p, v1, v2),
          incertidumbre: "0.01", // Valor fijo según tu lógica actual
        };
      },
    );

    // Enviamos al padre
    onDataChange(structuredData);
  }, [values, internalPatters, onDataChange]); // Se ejecuta si cambian los inputs o los patrones

  // --- 4. Helpers Visuales (Render) ---

  const calculateResultForRender = (
    formula: string,
    rowIdx: number,
  ): string => {
    const l1 = parseFloat(values[`${rowIdx}-${IDX_L1}`]) || 0;
    const l2 = parseFloat(values[`${rowIdx}-${IDX_L2}`]) || 0;
    const p = parseFloat(internalPatters[rowIdx]) || 0;

    switch (formula) {
      case "ERROR":
        return (l1 - p).toFixed(2);
      case "ERROR_TWO_TAKE":
        return calculateError(p, l1, l2); // Reusamos lógica
      case "INCERTIDUMBRE":
        return "0.01";
      default:
        return "-";
    }
  };

  const handleInputChange = (rowIdx: number, colIdx: number, val: string) => {
    setValues((prev) => ({ ...prev, [`${rowIdx}-${colIdx}`]: val }));
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
          {internalPatters.length > 0 ? (
            internalPatters.map((patternVal, rowIdx) => (
              <tr key={rowIdx}>
                {INTERNAL_COLUMNS.map((col, colIdx) => (
                  <td key={colIdx}>
                    {col.type === "editable" ? (
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={values[`${rowIdx}-${colIdx}`] || ""}
                        onChange={(e) =>
                          handleInputChange(rowIdx, colIdx, e.target.value)
                        }
                      />
                    ) : col.value === "PATRON" ? (
                      <input
                        className="input"
                        type="number"
                        value={patternVal}
                        onChange={(e) => {
                          const newP = [...internalPatters];
                          newP[rowIdx] = e.target.value;
                          setInternalPatterns(newP);
                        }}
                      />
                    ) : (
                      <span className="calc-value">
                        {col.formula
                          ? calculateResultForRender(col.formula, rowIdx)
                          : "-"}
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={INTERNAL_COLUMNS.length}>Sin patrones</td>
            </tr>
          )}
          {/* Pie de tabla */}
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

export default CalibrationTable;
