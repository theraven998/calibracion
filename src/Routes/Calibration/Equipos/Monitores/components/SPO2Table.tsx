import React, { useState, useEffect, useCallback } from "react";

export interface Spo2Row {
  patron: string;
  primera: string;
  error: string;
}

export interface Spo2Data {
  spo2: {
    rows: Spo2Row[];
    errorPromedio: string;
    desviacion: string;
    incertidumbre: string;
    incExpandida: string;
  };
  fp: {
    rows: Spo2Row[];
    errorPromedio: string;
    desviacion: string;
    incertidumbre: string;
    incExpandida: string;
  };
}

interface Props {
  onDataChange: (data: Spo2Data) => void;
}

const Spo2Table = ({ onDataChange }: Props) => {
  const [spo2Patrones] = useState<string[]>(["85", "90", "95", "100", "105"]);
  const [fpPatrones] = useState<string[]>(["30", "65", "80", "100", "120"]);

  const [spo2Values, setSpo2Values] = useState<{ [key: string]: string }>({});
  const [fpValues, setFpValues] = useState<{ [key: string]: string }>({});

  const calculateError = (p: number, v1: number) => {
    return (v1 - p).toFixed(4);
  };

  const calculateDesviacion = (errors: number[]) => {
    const mean = errors.reduce((a, b) => a + b, 0) / errors.length;
    const variance =
      errors.reduce((sum, err) => sum + Math.pow(err - mean, 2), 0) /
      errors.length;
    return Math.sqrt(variance).toFixed(9);
  };

  const processData = useCallback(
    (patrones: string[], values: { [key: string]: string }) => {
      const rows: Spo2Row[] = patrones.map((patronVal, rowIdx) => {
        const p = parseFloat(patronVal) || 0;
        const v1 = parseFloat(values[`${rowIdx}-0`]) || 0;

        return {
          patron: patronVal,
          primera: values[`${rowIdx}-0`] || "",
          error: calculateError(p, v1),
        };
      });

      const errors = rows.map((r) => parseFloat(r.error));
      const errorPromedio = (
        errors.reduce((a, b) => a + b, 0) / errors.length
      ).toFixed(1);
      const desviacion = calculateDesviacion(errors);

      return {
        rows,
        errorPromedio,
        desviacion,
        incertidumbre: "0.1",
        incExpandida: "0.2",
      };
    },
    [],
  );

  useEffect(() => {
    const data: Spo2Data = {
      spo2: processData(spo2Patrones, spo2Values),
      fp: processData(fpPatrones, fpValues),
    };
    onDataChange(data);
  }, [
    spo2Values,
    fpValues,
    spo2Patrones,
    fpPatrones,
    processData,
    onDataChange,
  ]);

  const renderTable = (
    title: string,
    patrones: string[],
    values: { [key: string]: string },
    setValues: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>,
  ) => {
    return (
      <div style={{ marginBottom: "2rem" }}>
        <h3>{title}</h3>
        <table className="smart-grid-table">
          <thead>
            <tr>
              <th>PATRÓN</th>
              <th className="editable">PRIMERA</th>
              <th>ERROR</th>
            </tr>
          </thead>
          <tbody>
            {patrones.map((patron, rowIdx) => {
              const p = parseFloat(patron) || 0;
              const v1 = parseFloat(values[`${rowIdx}-0`]) || 0;
              const error = calculateError(p, v1);

              return (
                <tr key={rowIdx}>
                  <td>
                    <span className="calc-value">{patron}</span>
                  </td>
                  <td>
                    <input
                      type="number"
                      step="1"
                      placeholder="0"
                      value={values[`${rowIdx}-0`] || ""}
                      onChange={(e) =>
                        setValues((prev) => ({
                          ...prev,
                          [`${rowIdx}-0`]: e.target.value,
                        }))
                      }
                    />
                  </td>
                  <td>
                    <span className="calc-value">{error}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="table-responsive">
      {renderTable("SPO2 (%)", spo2Patrones, spo2Values, setSpo2Values)}
      {renderTable("Frecuencia de Pulso", fpPatrones, fpValues, setFpValues)}
    </div>
  );
};

export default Spo2Table;
