import React, { useMemo } from "react";
import "./ReportePagina1.css";
import backgroundCertificado from "@/assets/background/marcaReporte.png";
import { useSelection } from "@/context/SelectionContext";
import { type Patron } from "@/services/api";
import type { Metrologo } from "@/services/api";

export interface RelevantInfoData {
  fechaRecepcion: string;
  fechaCalibracion: string;
  sitioCalibracion: string;
  metrologo: string;
}

export interface UncertaintyData {
  valor: string;
  k: string;
  unidad: string;
}

interface ReportePagina1Props {
  certNumber: string;
  tipoEquipo: string;
  relevantInfo: RelevantInfoData;
  uncertaintyData?: UncertaintyData;
  metrologo?: Metrologo;
  patronUsed?: Patron | null;
}

const ReportePagina1: React.FC<ReportePagina1Props> = ({
  certNumber,
  relevantInfo,
  tipoEquipo,
  patronUsed,
  metrologo,
}) => {
  const { selectedCenter, selectedMetrologist, selectedPatron } =
    useSelection();

  const safeText = (text?: string) => (text && text.trim() ? text : "---");

  // ✅ Patron final (props > contexto)
  const patronFinal = useMemo(() => {
    console.log("patronUsed:", patronUsed);
    console.log("selectedPatron:", selectedPatron);
    return patronUsed ?? selectedPatron ?? null;
  }, [patronUsed, selectedPatron]);

  const metrologoFinal = useMemo(() => {
    return (
      metrologo?.nombre ||
      relevantInfo?.metrologo ||
      selectedMetrologist?.nombre ||
      "---"
    );
  }, [metrologo?.nombre, relevantInfo?.metrologo, selectedMetrologist?.nombre]);

  // ✅ Sitio final (relevantInfo > contexto > ---)
  const sitioFinal = useMemo(() => {
    return (
      relevantInfo?.sitioCalibracion ||
      (selectedCenter as any)?.address ||
      (selectedCenter as any)?.direccion ||
      "---"
    );
  }, [relevantInfo?.sitioCalibracion, selectedCenter]);

  // (opcional) debug rápido
  // console.log("tipoEquipo:", tipoEquipo, "patronFinal:", patronFinal);

  return (
    <div className="page report-page">
      <div
        className="watermark-bg"
        style={{ backgroundImage: `url(${backgroundCertificado})` }}
      >
        <div className="content">
          <div className="report-header">
            <div className="page-counter">
              <span>Página 2 de 4</span>
            </div>
            <h1 className="main-title">REPORTE DE CALIBRACIÓN</h1>
            <div className="cert-number-section">
              <span className="cert-label">CERTIFICADO NO.</span>
              <span className="cert-value">{safeText(certNumber)} </span>
            </div>
          </div>

          <div className="section-block">
            <h2 className="section-subtitle">
              TRAZABILIDAD INSTRUMENTO EQUIPO PATRÓN
            </h2>
            <p className="justify-text">
              Medición S.A.S garantiza la trazabilidad de sus equipos patrón
              utilizados para establecer la trazabilidad al sistema
              internacional de unidades (SI) mediante una cadena ininterrumpida
              de calibraciones en laboratorios competentes, conforme a los
              requisitos de la norma ISO/IEC 17025:2017.
            </p>

            <div className="split-table-container">
              <table className="custom-table yellow-table">
                <tbody>
                  <tr>
                    <th>EQUIPO</th>
                    <td>{safeText(patronFinal?.equipo)}</td>
                  </tr>
                  <tr>
                    <th>MARCA</th>
                    <td>{safeText(patronFinal?.marca)}</td>
                  </tr>
                  <tr>
                    <th>MODELO</th>
                    <td>{safeText(patronFinal?.modelo)}</td>
                  </tr>
                  <tr>
                    <th>SERIE</th>
                    <td>{safeText(patronFinal?.serie)}</td>
                  </tr>
                  <tr>
                    <th>NO. CERTIFICADO</th>
                    <td>{safeText(patronFinal?.noCertificado)}</td>
                  </tr>
                </tbody>
              </table>

              <table className="custom-table yellow-table">
                <tbody>
                  <tr>
                    <th>RANGO</th>
                    <td>{safeText(patronFinal?.rango)}</td>
                  </tr>
                  <tr>
                    <th>RESOLUCION</th>
                    <td>{safeText(patronFinal?.resolucion)}</td>
                  </tr>
                  <tr>
                    <th>FECHA DE CALIBRACION</th>
                    <td>{safeText(patronFinal?.fechaCalibracion)}</td>
                  </tr>
                  <tr>
                    <th>PROXIMA CALIBRACION</th>
                    <td>{safeText(patronFinal?.proximaCalibracion)}</td>
                  </tr>
                  <tr>
                    <th>CALIBRADO POR</th>
                    <td>{safeText(patronFinal?.calibradoPor)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="section-block">
            <h2 className="section-subtitle with-lines">
              INFORMACIÓN RELEVANTE
            </h2>
            <p className="justify-text">
              La información acerca del sitio de medición, así como las fechas
              en que se recibe y se calibra el equipo se plasma a continuación,
              así como las condiciones con las que contaba el ambiente al
              momento de la calibración.
            </p>

            <table className="custom-table blue-table full-width">
              <tbody>
                <tr>
                  <th>FECHA DE RECEPCION</th>
                  <td>{safeText(relevantInfo.fechaRecepcion)}</td>
                </tr>
                <tr>
                  <th>FECHA DE CALIBRACION</th>
                  <td>{safeText(relevantInfo.fechaCalibracion)}</td>
                </tr>
                <tr>
                  <th>SITIO DE CALIBRACION</th>
                  <td>{safeText(sitioFinal)}</td>
                </tr>
                <tr>
                  <th>METROLOGO</th>
                  <td>{safeText(metrologoFinal)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="footer-logos" />
        </div>
      </div>
    </div>
  );
};

export default ReportePagina1;
