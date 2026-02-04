import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import Certificado from "@/components/Equipo/Certificado/Certificado/Certificado";
import ReportePagina1 from "@/components/Equipo/Pagina1/ReportePagina1";
import ReportePagina2 from "@/components/Equipo/Certificado/Reporte/Basculas/Pagina2/ReportePagina2";
import ReportePagina3 from "@/components/Equipo/Certificado/Reporte/Basculas/Pagina3/ReportePagina3";
import type { DataEquipment } from "@/components/Equipo/Data";
import type { Center } from "@/services/api";
import type { Metrologist } from "@/context/SelectionContext";
import "./CertificateModal.css"; // Crearemos esto después
import { useSelection } from "@/context/SelectionContext";
import { type CalibrationRow } from "@/Routes/Calibration/Equipos/Basculas/components/CalibrationTable";
import { type ExcentricidadResult } from "@/Routes/Calibration/Equipos/Basculas/components/ExcentricidadTable";

interface CertificateModalProps {
  onClose: () => void;
  equipmentData: any; // O tu tipo DataEquipment
  clientData: any;
  selectedCenter: any;
  selectedMetrologist: any;
  calibrationData: CalibrationRow[];
  excentricidadData: ExcentricidadResult[];
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  onClose,
  equipmentData,
  clientData,
  selectedCenter,
  selectedMetrologist,
  calibrationData,
  excentricidadData,
}) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const { selectedRevisor } = useSelection();

  // Configuración de react-to-print para descargar PDF
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Certificado_${equipmentData?.certificado || "SinNumero"}.pdf`,
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

  // Fallback si faltan datos críticos
  if (!equipmentData || !clientData) {
    return (
      <div className="certificate-modal-overlay">
        <div className="certificate-modal-content">
          <p>Error: Faltan datos para generar el certificado</p>
          <button onClick={onClose} className="btn-close">
            Cerrar
          </button>
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
                magnitud: "MASA",
                tipo: "BÁSCULA",
                rango: equipmentData.rango || "0 - 300 kg",
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
              tipoEquipo="bascula"
            />
            <ReportePagina2
              calibrationData={calibrationData}
              excentricidadData={excentricidadData}
            />
            <ReportePagina3
              calibrationData={calibrationData}
              observaciones={equipmentData.observacion}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
