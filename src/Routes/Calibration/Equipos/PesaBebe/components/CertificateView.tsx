import React, { forwardRef } from "react";
import "./CertificateView.css"; // Aquí moveremos tus estilos CSS

export interface CertificateData {
  numeroCertificado: string;
  fechaCalibracion: string;
  solicitante: string;
  direccion: string;
  equipo: {
    marca: string;
    modelo: string;
    serie: string;
    rango: string;
  };
  condiciones: {
    tempMin: number;
    tempMax: number;
    humedadMin: number;
    humedadMax: number;
    presion: number;
  };
  resultados: {
    carga: number;
    lectura: number;
    error: number;
    incertidumbre: number;
  }[];
}

// Usamos forwardRef para permitir que react-to-print acceda al componente
export const CertificateView = forwardRef<
  HTMLDivElement,
  { data: CertificateData }
>(({ data }, ref) => {
  return (
    <div ref={ref} className="cert-container">
      {/* PÁGINA 1 */}
      <div className="page page1">
        <div className="content">
          <div className="header">
            <h1>Certificado de calibración</h1>
            <div className="cert-number">{data.numeroCertificado}</div>
          </div>

          <div className="section-title">
            INFORMACIÓN DEL EQUIPO BAJO PRUEBA
          </div>
          <div className="info-grid">
            <div className="info-label">MAGNITUD</div>
            <div className="info-value">Masa</div>
            <div className="info-label">EQUIPO</div>
            <div className="info-value">Báscula</div>
            <div className="info-label">MARCA</div>
            <div className="info-value">{data.equipo.marca}</div>
            <div className="info-label">MODELO</div>
            <div className="info-value">{data.equipo.modelo}</div>
            <div className="info-label">SERIE</div>
            <div className="info-value">{data.equipo.serie}</div>
            <div className="info-label">UNIDAD</div>
            <div className="info-value">kg</div>
            <div className="info-label">RANGO</div>
            <div className="info-value">{data.equipo.rango}</div>
          </div>

          <div className="section-title">INFORMACIÓN CLIENTE</div>
          <div className="info-grid">
            <div className="info-label">SOLICITANTE</div>
            <div className="info-value">{data.solicitante}</div>
            <div className="info-label">DIRECCIÓN</div>
            <div className="info-value">{data.direccion}</div>
            <div className="info-label">FECHA</div>
            <div className="info-value">{data.fechaCalibracion}</div>
          </div>

          <div className="section-title">CONDICIONES AMBIENTALES</div>
          <table className="compact-table">
            <thead>
              <tr>
                <th>Parámetro</th>
                <th>Mínima</th>
                <th>Máxima</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Temperatura (°C)</td>
                <td>{data.condiciones.tempMin}</td>
                <td>{data.condiciones.tempMax}</td>
              </tr>
              <tr>
                <td>Humedad Relativa (%)</td>
                <td>{data.condiciones.humedadMin}</td>
                <td>{data.condiciones.humedadMax}</td>
              </tr>
              <tr>
                <td>Presión (hPa)</td>
                <td>{data.condiciones.presion}</td>
                <td>N.R</td>
              </tr>
            </tbody>
          </table>

          <div className="section-title">RESULTADO DE LA CALIBRACIÓN</div>
          <table className="compact-table">
            <thead>
              <tr>
                <th>Carga (kg)</th>
                <th>Lectura (kg)</th>
                <th>Error (kg)</th>
                <th>Incertidumbre (kg)</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {data.resultados.map((res, idx) => (
                <tr key={idx}>
                  <td>{res.carga}</td>
                  <td>{res.lectura}</td>
                  <td>{res.error}</td>
                  <td>{res.incertidumbre}</td>
                  <td>Conforme</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="signatures">
            <div className="signature-block">
              <div className="signature-line"></div>
              <strong>Ing. Alejandra Vargas</strong>
              <br />
              <span style={{ color: "#c59b2a" }}>Calibró</span>
            </div>
            <div className="signature-block">
              <div className="signature-line"></div>
              <strong>Katherine Mosquera</strong>
              <br />
              <span style={{ color: "#c59b2a" }}>Revisó</span>
            </div>
          </div>
        </div>

        <div className="cert-footer">
          SE PROHÍBE LA REPRODUCCIÓN DE ESTE REPORTE SIN PREVIA AUTORIZACIÓN...
        </div>
      </div>
    </div>
  );
});

// Componente de demostración que pasa datos de prueba para visualización
export const CertificateViewWithMock: React.FC = () => {
  const mockData: CertificateData = {
    numeroCertificado: "C-2025-001",
    fechaCalibracion: "2025-06-01",
    solicitante: "Laboratorio Ejemplo S.A.",
    direccion: "Calle Falsa 123, Ciudad",
    equipo: {
      marca: "Ohaus",
      modelo: "Explorer Pro",
      serie: "SN123456",
      rango: "0 - 300 kg",
    },
    condiciones: {
      tempMin: 20,
      tempMax: 25,
      humedadMin: 30,
      humedadMax: 50,
      presion: 1013,
    },
    resultados: [
      { carga: 0.5, lectura: 0.498, error: -0.002, incertidumbre: 0.0005 },
      { carga: 5, lectura: 4.998, error: -0.002, incertidumbre: 0.001 },
      { carga: 50, lectura: 50.012, error: 0.012, incertidumbre: 0.005 },
    ],
  };

  return <CertificateView data={mockData} />;
};

export default CertificateViewWithMock;
