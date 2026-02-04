import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import Certificado from "@/components/Equipo/Certificado/Certificado/Certificado";
import ReportePagina1 from "@/components/Equipo/Pagina1/ReportePagina1";
import ReportePagina3 from "@/components/Equipo/Certificado/Reporte/TensiometroDigital/Pagina3/ReportePagina3";
import ReportePagina2 from "@/components/Equipo/Certificado/Reporte/TensiometroDigital/Pagina2/ReportePagina2";
import { useSelection } from "@/context/SelectionContext";
import "./CertificateModal.css";
import { type ExactitudRow } from "./ExactitudTable";
interface CertificateModalProps {
  onClose: () => void;
  equipmentData: any; // O tu tipo DataEquipment
  clientData: any;
  selectedCenter: any;
  selectedMetrologist: any;
  exactitudData: ExactitudRow[];
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  onClose,
  equipmentData,
  exactitudData,
  clientData,
  selectedCenter,
  selectedMetrologist,
}) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const { selectedRevisor } = useSelection();

  // Configuración de react-to-print para descargar PDF
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `${
      equipmentData?.certificado || "SinNumero"
    }.pdf`,
    onAfterPrint: () => {
      console.log("Descarga de PDF completada");
    },
    pageStyle: `
      @page {
        size: letter portrait;
        margin: 0;
      }
      body {
        margin: 0;
        padding: 0;
      }
    `,
  });

  // Fallback si faltan datos críticos (muestra cuáles faltan)
  const isEmpty = (v: any) =>
    v === null ||
    v === undefined ||
    (typeof v === "object" &&
      !Array.isArray(v) &&
      Object.keys(v).length === 0) ||
    (Array.isArray(v) && v.length === 0) ||
    (typeof v === "string" && v.trim() === "");

  const missingFields: string[] = [];
  if (isEmpty(equipmentData)) missingFields.push("equipmentData");
  if (isEmpty(clientData)) missingFields.push("clientData");
  if (isEmpty(selectedCenter)) missingFields.push("selectedCenter");
  if (isEmpty(selectedMetrologist)) missingFields.push("selectedMetrologist");
  // selectedRevisor viene del contexto; también es crítico para el certificado
  if (isEmpty((useSelection() as any).selectedRevisor))
    missingFields.push("selectedRevisor");

  if (missingFields.length > 0) {
    return (
      <div className="certificate-modal-overlay">
        <div className="certificate-modal-content">
          <h3>Error: Faltan datos para generar el certificado</h3>
          <p>Campos faltantes:</p>
          <ul>
            {missingFields.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <div style={{ marginTop: 12 }}>
            <button onClick={onClose} className="btn-close">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="certificate-modal-overlay">
      <div className="certificate-modal-content">
        {/* Header con acciones */}
        <header className="modal-header">
          <h2>Vista Previa del Certificado</h2>
          <div className="modal-actions-header">
            <button onClick={handlePrint} className="btn-primary">
              📥 Descargar PDF
            </button>
            <button onClick={onClose} className="btn-secondary">
              Subir a la nube
            </button>
            <button onClick={onClose} className="btn-close">
              ×
            </button>
          </div>
        </header>

        {/* Área scrolleable para previsualizar */}
        <div className="certificate-scroll-area">
          {/* Contenedor que se imprime (ref apunta aquí) */}
          <div ref={componentRef} className="certificate-print-container">
            {/* ===== PÁGINA 1: CERTIFICADO ===== */}
            <Certificado
              equipmentData={equipmentData}
              clientData={clientData}
              technicalInfo={{
                magnitud: "NIBP",
                tipo: "TENSIOMETRO DIGITAL",
                rango: "SISTOLICA 80 - 220, DIASTOLICA 30 - 140",
                unidad: "mmHg",
              }}
              metrologo={selectedMetrologist}
              revisor={selectedRevisor!}
            />
            <ReportePagina1
              certNumber={equipmentData.certificado || "---"}
              relevantInfo={{
                fechaRecepcion: new Date().toLocaleDateString(),
                fechaCalibracion: clientData.fechaCalibracion,
                sitioCalibracion: selectedCenter?.name || "Laboratorio",
                metrologo: selectedMetrologist?.nombre || "---",
              }}
              tipoEquipo="tensiometro-digital"
            />
            <ReportePagina2
              calibrationData={exactitudData}
              observaciones={equipmentData.observacion}
            />
            <ReportePagina3
              calibrationData={exactitudData}
              observaciones={equipmentData.observacion}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
