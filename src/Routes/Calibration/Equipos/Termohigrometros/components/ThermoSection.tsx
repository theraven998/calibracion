import React, { useEffect, useState } from "react";

// Tipos de datos que este componente devolverá al padre
export interface ThermoRow {
  patron: string;
  lectura: string;
  error: number | null;
}

export interface ThermoSectionResult {
  title: string;
  data: ThermoRow[];
  stats: {
    errorPromedio: string;
    desviacionEstandar: string;
    incertidumbreExpandida: string;
    resolucion: string;
  };
}

interface Props {
  title: string;
  unit: string;
  initialPatterns: string[];
  defaultUncertainty: string; // "0.5" o "2.8"
  defaultResolution: string; // "0.1" o "1"
  onDataChange: (result: ThermoSectionResult) => void;
}

export const ThermoSection: React.FC<Props> = ({
  title,
  unit,
  initialPatterns,
  defaultUncertainty,
  defaultResolution,
  onDataChange,
}) => {
  // Estado local de las filas
  const [rows, setRows] = useState<ThermoRow[]>(
    initialPatterns.map((p) => ({ patron: p, lectura: "", error: null }))
  );

  // Estado para valores globales de la sección
  const [incertidumbre, setIncertidumbre] = useState(defaultUncertainty);
  const [resolucion, setResolucion] = useState(defaultResolution);

  // --- LÓGICA MATEMÁTICA ---
  useEffect(() => {
    // 1. Filtrar filas válidas (que tengan números)
    const validRows = rows.filter(
      (r) =>
        r.lectura !== "" &&
        !isNaN(parseFloat(r.lectura)) &&
        !isNaN(parseFloat(r.patron))
    );

    const errors = validRows.map((r) => r.error as number);

    // 2. Calcular Promedio
    let avgError = 0;
    if (errors.length > 0) {
      avgError = errors.reduce((acc, curr) => acc + curr, 0) / errors.length;
    }

    // 3. Calcular Desviación Estándar (Muestral)
    let stdDev = 0;
    if (errors.length > 1) {
      const variance =
        errors.reduce((acc, val) => acc + Math.pow(val - avgError, 2), 0) /
        (errors.length - 1);
      stdDev = Math.sqrt(variance);
    }

    // 4. Enviar datos al padre
    onDataChange({
      title,
      data: rows,
      stats: {
        errorPromedio: avgError.toFixed(3), // Ajusta decimales según norma
        desviacionEstandar: stdDev.toFixed(4),
        incertidumbreExpandida: incertidumbre,
        resolucion: resolucion,
      },
    });
  }, [rows, incertidumbre, resolucion, onDataChange, title]);

  // Manejador de inputs de la tabla
  const handleInputChange = (
    index: number,
    field: "patron" | "lectura",
    val: string
  ) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: val };

    // Calcular error al vuelo
    const p = parseFloat(newRows[index].patron);
    const l = parseFloat(newRows[index].lectura);
    if (!isNaN(p) && !isNaN(l)) {
      newRows[index].error = parseFloat((l - p).toFixed(2)); // Redondeo simple para visualización
    } else {
      newRows[index].error = null;
    }

    setRows(newRows);
  };

  return (
    <div className="data-grid-section" style={{ marginBottom: "2rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3>
          {title} ({unit})
        </h3>
        <div style={{ display: "flex", gap: "1rem" }}>
          <label>
            Res:{" "}
            <input
              style={{ width: "50px" }}
              value={resolucion}
              onChange={(e) => setResolucion(e.target.value)}
            />
          </label>
          <label>
            U. Exp:{" "}
            <input
              style={{ width: "50px" }}
              value={incertidumbre}
              onChange={(e) => setIncertidumbre(e.target.value)}
            />
          </label>
        </div>
      </div>

      <table className="smart-grid-table">
        <thead>
          <tr>
            <th>Patrón ({unit})</th>
            <th>Lectura Equipo ({unit})</th>
            <th>Error</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td>
                <input
                  type="number"
                  step="0.01"
                  value={row.patron}
                  onChange={(e) =>
                    handleInputChange(i, "patron", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  type="number"
                  step="0.01"
                  value={row.lectura}
                  onChange={(e) =>
                    handleInputChange(i, "lectura", e.target.value)
                  }
                  placeholder="Ingrese lectura"
                />
              </td>
              <td>
                <span
                  style={{
                    fontWeight: "bold",
                    color: (row.error || 0) > 0.5 ? "red" : "inherit",
                  }}
                >
                  {row.error !== null ? row.error : "-"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
