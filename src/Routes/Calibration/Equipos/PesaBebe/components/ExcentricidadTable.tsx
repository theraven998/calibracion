import React, { useEffect, useState } from "react";

// Definimos la estructura de los datos que enviaremos al padre
export interface ExcentricidadResult {
  posicion: string;
  carga: number;
  lectura: string;
  error: number | null;
}

interface Props {
  // Prop para comunicar los cambios al padre
  onDataChange: (data: ExcentricidadResult[]) => void;
}

export default function ExcentricidadTable({ onDataChange }: Props) {
  const CARGA_VALUE = 5; // Valor fijo según tu ejemplo

  // 1. El estado debe estar al nivel superior del componente
  const [readings, setReadings] = useState<string[]>(Array(7).fill(""));

  // 2. Cada vez que cambien las lecturas, calculamos y avisamos al padre
  useEffect(() => {
    const calculatedData: ExcentricidadResult[] = readings.map(
      (lectura, index) => {
        const lecturaNum = parseFloat(lectura);
        const isValid = !isNaN(lecturaNum) && lectura !== "";

        return {
          posicion: `Posición ${index + 1}`,
          carga: CARGA_VALUE,
          lectura: lectura,
          // Si es válido calculamos, si no, null
          error: isValid ? +(lecturaNum - CARGA_VALUE).toFixed(3) : null,
        };
      }
    );

    onDataChange(calculatedData);
  }, [readings, onDataChange]); // Se ejecuta cuando 'readings' cambia

  const handleChange = (index: number, value: string) => {
    const newReadings = [...readings];
    newReadings[index] = value;
    setReadings(newReadings);
  };

  return (
    <section className="data-grid-section">
      <h2>4. Prueba de Excentricidad (Posición)</h2>
      <div className="excentricidad-simple">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "16px",
          }}
        >
          <img
            src="https://storage.googleapis.com/rdol-resources/0Varios/image-Jun-24-2020-12-09-27-09-PM.webp"
            alt="Diagrama de Excentricidad"
            style={{ maxWidth: "500px" }}
          />
        </div>

        <table
          className="excentricidad-table"
          style={{ width: "100%", borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              <th className="th-style">POSICION</th>
              <th className="th-style">CARGA</th>
              <th className="th-style">LECTURA</th>
              <th className="th-style">ERROR</th>
            </tr>
          </thead>
          <tbody>
            {readings.map((lecturaStr, i) => {
              const lecturaNum = parseFloat(lecturaStr);
              const error =
                !isNaN(lecturaNum) && lecturaStr !== ""
                  ? +(lecturaNum - CARGA_VALUE).toFixed(3)
                  : "";

              return (
                <tr key={i}>
                  <td className="td-style">Posición {i + 1}</td>
                  <td className="td-style">{CARGA_VALUE} kg</td>
                  <td className="td-style">
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.001"
                      value={lecturaStr}
                      onChange={(e) => handleChange(i, e.target.value)}
                      style={{ width: "100px", padding: "4px" }}
                      aria-label={`Lectura posicion ${i + 1}`}
                    />
                  </td>
                  <td className="td-style">
                    {error === "" ? "" : `${error} kg`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Estilos inline auxiliares para limpiar el código JSX */}
      <style>{`
        .th-style { text-align: left; padding: 8px; border-bottom: 1px solid #ddd; }
        .td-style { padding: 8px; border-bottom: 1px solid #eee; }
      `}</style>
    </section>
  );
}
