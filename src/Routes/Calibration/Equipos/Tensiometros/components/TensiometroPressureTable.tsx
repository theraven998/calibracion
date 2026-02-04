import { useMemo } from "react";
import "./TensiometroPressureTable.css";
export type TensiometroPressureRow = {
  punto: number; // mmHg (idealmente fijo)
  primera: number; // lectura 1
  segunda: number; // lectura 2
};

type Props = {
  value: TensiometroPressureRow[];
  onChange: (rows: TensiometroPressureRow[]) => void;

  // si quieres permitir editar la columna "punto"
  allowEditPoint?: boolean;

  // para deshabilitar inputs (ej: en modo preview)
  disabled?: boolean;
};

function toNumber(v: unknown) {
  const n = typeof v === "number" ? v : Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function format(n: number, digits = 2) {
  if (!Number.isFinite(n)) return "---";
  return n.toFixed(digits);
}

export default function TensiometroPressureTable({
  value,
  onChange,
  allowEditPoint = false,
  disabled = false,
}: Props) {
  const computed = useMemo(() => {
    const errors = value.map((r) => {
      const punto = toNumber(r.punto);
      const p1 = toNumber(r.primera);
      const p2 = toNumber(r.segunda);
      const avg = (p1 + p2) / 2;
      return avg - punto;
    });

    const n = errors.length || 1;
    const mean = errors.reduce((a, b) => a + b, 0) / n;

    // desviación muestral (n-1), si n=1 -> 0
    const variance =
      errors.reduce((acc, e) => acc + Math.pow(e - mean, 2), 0) /
      Math.max(1, n - 1);

    const std = Math.sqrt(variance);

    return { errors, mean, std };
  }, [value]);

  function updateRow(idx: number, patch: Partial<TensiometroPressureRow>) {
    const next = value.map((r, i) => (i === idx ? { ...r, ...patch } : r));
    onChange(next);
  }

  return (
    <section className="data-grid-section full-width">
      <h2>2. Prueba de Presión (mmHg)</h2>

      <div style={{ overflowX: "auto" }}>
        <table className="results-table compact">
          <thead>
            <tr>
              <th style={{ minWidth: 120 }}>Presión (mmHg)</th>
              <th style={{ minWidth: 120 }}>Primera</th>
              <th style={{ minWidth: 120 }}>Segunda</th>
              <th style={{ minWidth: 120 }}>Error</th>
            </tr>
          </thead>

          <tbody>
            {value.map((r, idx) => (
              <tr key={idx}>
                <td className="font-mono">
                  {allowEditPoint ? (
                    <input
                      disabled={disabled}
                      type="number"
                      step="1"
                      value={toNumber(r.punto)}
                      onChange={(e) =>
                        updateRow(idx, { punto: toNumber(e.target.value) })
                      }
                      style={{ width: "100%" }}
                    />
                  ) : (
                    toNumber(r.punto)
                  )}
                </td>

                <td className="font-mono">
                  <input
                    disabled={disabled}
                    type="number"
                    step="0.1"
                    value={toNumber(r.primera)}
                    onChange={(e) =>
                      updateRow(idx, { primera: toNumber(e.target.value) })
                    }
                    style={{ width: "100%" }}
                  />
                </td>

                <td className="font-mono">
                  <input
                    disabled={disabled}
                    type="number"
                    step="0.1"
                    value={toNumber(r.segunda)}
                    onChange={(e) =>
                      updateRow(idx, { segunda: toNumber(e.target.value) })
                    }
                    style={{ width: "100%" }}
                  />
                </td>

                <td className="font-mono">
                  {format(computed.errors[idx] ?? 0, 2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="stats-box" style={{ marginTop: "0.8rem" }}>
        <div className="stat-item">
          <span>Error promedio</span>
          <strong className="font-mono">{format(computed.mean, 3)}</strong>
        </div>

        <div className="stat-item">
          <span>Desviación</span>
          <strong className="font-mono">{format(computed.std, 10)}</strong>
        </div>

        <div className="stat-item">
          <span>Incertidumbre</span>
          <strong className="font-mono">{format(0.1, 2)}</strong>
        </div>

        <div className="stat-item">
          <span>Inc. expandida</span>
          <strong className="font-mono">{format(0.2, 2)}</strong>
        </div>
      </div>
    </section>
  );
}
