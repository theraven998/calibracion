import React, { useState, useEffect, useCallback } from "react";

export interface NibpRow {
  patron: string;
  primera: string;
  segunda: string;
  tercera: string;
  error: string;
}

export interface NibpData {
  sistolica: {
    rows: NibpRow[];
    errorPromedio: string;
    desviacion: string;
    incertidumbre: string;
    incExpandida: string;
  };
  diastolica: {
    rows: NibpRow[];
    errorPromedio: string;
    desviacion: string;
    incertidumbre: string;
    incExpandida: string;
  };
  pulso: {
    rows: NibpRow[];
    errorPromedio: string;
    desviacion: string;
    incertidumbre: string;
    incExpandida: string;
  };
}

interface Props {
  onDataChange: (data: NibpData) => void;
}

const NibpTable = ({ onDataChange }: Props) => {
  const [sistolicaPatrones] = useState<string[]>([
    "60",
    "80",
    "120",
    "150",
    "190",
    "220",
  ]);
  const [diastolicaPatrones] = useState<string[]>([
    "30",
    "50",
    "80",
    "90",
    "130",
    "140",
  ]);
  const [pulsoPatrones] = useState<string[]>([
    "60",
    "70",
    "80",
    "90",
    "60",
    "70",
  ]);

  const [sistolicaValues, setSistolicaValues] = useState<{
    [key: string]: string;
  }>({});
  const [diastolicaValues, setDiastolicaValues] = useState<{
    [key: string]: string;
  }>({});
  const [pulsoValues, setPulsoValues] = useState<{ [key: string]: string }>({});

  const calculateError = (p: number, v1: number, v2: number, v3: number) => {
    const promedio = (v1 + v2 + v3) / 3;
    return (promedio - p).toFixed(4);
  };

  const calculateDesviacion = (errors: number[]) => {
    const mean = errors.reduce((a, b) => a + b, 0) / errors.length;
    const variance =
      errors.reduce((sum, err) => sum + Math.pow(err - mean, 2), 0) /
      errors.length;
    return Math.sqrt(variance).toFixed(10);
  };

  const processData = useCallback(
    (patrones: string[], values: { [key: string]: string }) => {
      const rows: NibpRow[] = patrones.map((patronVal, rowIdx) => {
        const p = parseFloat(patronVal) || 0;
        const v1 = parseFloat(values[`${rowIdx}-1`]) || 0;
        const v2 = parseFloat(values[`${rowIdx}-2`]) || 0;
        const v3 = parseFloat(values[`${rowIdx}-3`]) || 0;

        return {
          patron: patronVal,
          primera: values[`${rowIdx}-1`] || "",
          segunda: values[`${rowIdx}-2`] || "",
          tercera: values[`${rowIdx}-3`] || "",
          error: calculateError(p, v1, v2, v3),
        };
      });

      const errors = rows.map((r) => parseFloat(r.error));
      const errorPromedio = (
        errors.reduce((a, b) => a + b, 0) / errors.length
      ).toFixed(10);
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
    const data: NibpData = {
      sistolica: processData(sistolicaPatrones, sistolicaValues),
      diastolica: processData(diastolicaPatrones, diastolicaValues),
      pulso: processData(pulsoPatrones, pulsoValues),
    };
    onDataChange(data);
  }, [
    sistolicaValues,
    diastolicaValues,
    pulsoValues,
    sistolicaPatrones,
    diastolicaPatrones,
    pulsoPatrones,
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
              <th className="editable">SEGUNDA</th>
              <th className="editable">TERCERA</th>
              <th>ERROR</th>
            </tr>
          </thead>
          <tbody>
            {patrones.map((patron, rowIdx) => {
              const p = parseFloat(patron) || 0;
              const v1 = parseFloat(values[`${rowIdx}-1`]) || 0;
              const v2 = parseFloat(values[`${rowIdx}-2`]) || 0;
              const v3 = parseFloat(values[`${rowIdx}-3`]) || 0;
              const error = calculateError(p, v1, v2, v3);

              return (
                <tr key={rowIdx}>
                  <td>
                    <span className="calc-value">{patron}</span>
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0"
                      value={values[`${rowIdx}-1`] || ""}
                      onChange={(e) =>
                        setValues((prev) => ({
                          ...prev,
                          [`${rowIdx}-1`]: e.target.value,
                        }))
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0"
                      value={values[`${rowIdx}-2`] || ""}
                      onChange={(e) =>
                        setValues((prev) => ({
                          ...prev,
                          [`${rowIdx}-2`]: e.target.value,
                        }))
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0"
                      value={values[`${rowIdx}-3`] || ""}
                      onChange={(e) =>
                        setValues((prev) => ({
                          ...prev,
                          [`${rowIdx}-3`]: e.target.value,
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
      {renderTable(
        "Sistólica",
        sistolicaPatrones,
        sistolicaValues,
        setSistolicaValues,
      )}
      {renderTable(
        "Diastólica",
        diastolicaPatrones,
        diastolicaValues,
        setDiastolicaValues,
      )}
      {renderTable(
        "Frecuencia de Pulso",
        pulsoPatrones,
        pulsoValues,
        setPulsoValues,
      )}
    </div>
  );
};

export default NibpTable;
