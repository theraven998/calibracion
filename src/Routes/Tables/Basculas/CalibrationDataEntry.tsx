import { useForm, useFieldArray, useWatch } from "react-hook-form";
import type { Control } from "react-hook-form";
import type { UseFormRegister } from "react-hook-form";
import "./CalibrationDataEntry.css";
import CalibrationTable from "../../Calibration/Equipos/Basculas/components/CalibrationTable";
import basculasConfig from "../../../assets/formulas/bascula.json";
import Data from "../../../components/Equipo/Data";
import HeaderChoose from "../../Calibration/Start/components/Header/HeaderChoose";
export interface ColumnDefinition {
  header: string;
  accessor: string; // nombre del campo en el form data
  type: "input" | "readOnly" | "status";
  width?: string;
  step?: string; // para inputs numéricos (ej: "0.01")
}
interface CalibrationTableProps {
  control: Control<any>;
  register: UseFormRegister<any>;
  name: string; // Nombre del array en el form (ej: "pruebaLinealidad")
  columns: ColumnDefinition[];
  title: string;
  calculateRow?: (row: any) => any; // Función opcional para inyectar cálculos custom
}

interface CalibrationData {
  marca: string;
  serie: string;
  modelo: string;
  ubicacion: string;
  observacion: string;
  codigoInventario: string;
  certificado: string;

  // Patrones (Array dinámico)
  patrones: { tipo: string; valor: number }[];

  // Prueba de Excentricidad (Posición)
  pruebaExcentricidad: {
    posicion: string;
    carga: number;
    indicacion: number;
    error: number;
  }[];

  // Prueba de Linealidad (Cargas crecientes/decrecientes)
  pruebaLinealidad: {
    cargaNominal: number; // 5, 10, 15, etc.
    lecturaAscendente: number | null; // Primera
    lecturaDescendente: number | null; // Segunda
    errorPromedio: number;
    histeresis: number;
    incertidumbre: number; // Placeholder para cálculo complejo
    conformidad: boolean; // Pasa/No Pasa
  }[];
}
const TableRow = ({
  index,
  control,
  register,
  name,
  columns,
  calculateRow,
}: {
  index: number;
  control: Control<any>;
  register: UseFormRegister<any>;
  name: string;
  columns: ColumnDefinition[];
  calculateRow?: (row: any) => any;
}) => {
  // Observamos solo los valores de esta fila para cálculos en tiempo real
  const rowValues = useWatch({
    control,
    name: `${name}.${index}`,
  });

  // Aplicamos la lógica de cálculo personalizada si existe
  const computedValues = calculateRow ? calculateRow(rowValues) : rowValues;

  // Determinamos si la fila falla para pintarla de rojo (si existe campo 'estado' o 'conformidad')
  const isFailure =
    computedValues.estado === "No Pasa" || computedValues.conformidad === false;

  return (
    <tr className={isFailure ? "row-failure" : ""}>
      {columns.map((col, colIndex) => {
        const fieldName = `${name}.${index}.${col.accessor}`;

        if (col.type === "readOnly") {
          // Renderizamos valor calculado o estático
          const displayValue = computedValues[col.accessor];
          // Formateamos si es número
          const formattedValue =
            typeof displayValue === "number"
              ? displayValue.toFixed(2)
              : displayValue || "-";

          return (
            <td key={colIndex} className="cell-readonly">
              <input
                className="input-readonly"
                value={formattedValue}
                readOnly
                tabIndex={-1}
              />
            </td>
          );
        }

        if (col.type === "status") {
          const status = computedValues[col.accessor];
          const isPass = status === "Pasa" || status === true;
          return (
            <td key={colIndex} className="cell-status">
              <span className={`status-badge ${isPass ? "pass" : "fail"}`}>
                {isPass ? "Pasa" : "No Pasa"}
              </span>
            </td>
          );
        }

        // Default: Input editable
        return (
          <td key={colIndex} className="cell-input">
            <input
              type="number"
              step={col.step || "0.01"}
              className="input-editable"
              {...register(fieldName, { valueAsNumber: true })}
              placeholder="0.00"
            />
          </td>
        );
      })}
    </tr>
  );
};

export default function CalibrationDataEntry() {
  const configLinealidad = basculasConfig.pruebaLinealidad;

  return (
    <div className="calibration-entry-container">
      <HeaderChoose /> <Data />
      <section className="data-grid-section full-width">
        <h2>2. Prueba de Exactitud</h2>
        <CalibrationTable
          // Pasas las props directamente desde el JSON
          title={configLinealidad.title}
          patterns={configLinealidad.defaultPatterns}
        />
      </section>
      {/* Input simple para Excentricidad (resumido del prompt) */}
      <section className="data-grid-section">
        <h2>4. Prueba de Excentricidad (Posición)</h2>
        <div className="excentricidad-simple">
          <div className="field-group">
            <label>Carga de Prueba (kg)</label>
            <input type="number" defaultValue={20} className="short-input" />
          </div>
          <div className="field-group">
            <label>Máxima Diferencia Encontrada</label>
            <input
              type="number"
              placeholder="Calculado auto..."
              readOnly
              className="read-only-input"
            />
          </div>
        </div>
      </section>
      <div className="form-footer">
        <div className="results-summary">
          <span>
            Desviación Máx: <strong>0.002 kg</strong>
          </span>
          <span>
            Incertidumbre Exp: <strong>0.05 kg</strong>
          </span>
        </div>
        <button type="submit" className="btn-primary big">
          Finalizar y Generar Certificado
        </button>
      </div>
    </div>
  );
}
