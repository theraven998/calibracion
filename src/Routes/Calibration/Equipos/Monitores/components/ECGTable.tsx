// EcgTable.tsx
import React, { useState, useEffect } from "react";
export interface EcgData {
  rows: Array<{ patron: string; primera: string }>;
  errorPromedio: string;
  desviacion: string;
  incertidumbre: string;
  incExpandida: string;
}

interface Props {
  onDataChange: (data: EcgData) => void;
}

const EcgTable = ({ onDataChange }: Props) => {
  const [patrones] = useState<string[]>(["40", "60", "80", "120", "160", "200", "240"]);
  const [values, setValues] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const rows = patrones.map((patron, idx) => ({
      patron,
      primera: values[`${idx}`] || "",
    }));

    onDataChange({
      rows,
      errorPromedio: "0",
      desviacion: "0",
      incertidumbre: "0",
      incExpandida: "0",
    });
  }, [values, patrones, onDataChange]);

  return (
    <div className="table-responsive">
      <table className="smart-grid-table">
        <thead>
          <tr>
            <th>PATRÓN</th>
            <th className="editable">PRIMERA</th>
            <th>ERROR</th>
          </tr>
        </thead>
        <tbody>
          {patrones.map((patron, idx) => (
            <tr key={idx}>
              <td><span className="calc-value">{patron}</span></td>
              <td>
                <input
                  type="number"
                  placeholder="0"
                  value={values[`${idx}`] || ""}
                  onChange={(e) => setValues(prev => ({ ...prev, [`${idx}`]: e.target.value }))}
                />
              </td>
              <td><span className="calc-value">0</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EcgTable;
