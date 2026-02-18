import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import Certificado from "@/components/Equipo/Certificado/Certificado/Certificado";
import ReportePagina1 from "@/components/Equipo/Pagina1/ReportePagina1";
import ReportePagina3 from "@/components/Equipo/Certificado/Reporte/Desfibriladores/Pagina3/ReportePagina3";
import ReportePagina4 from "@/components/Equipo/Certificado/Reporte/Desfibriladores/Pagina4/ReportePagina4";
import type { DataEquipment } from "@/components/Equipo/Data";
import type { Center } from "@/services/api";
import type { Metrologist } from "@/context/SelectionContext";
import { useSelection } from "@/context/SelectionContext";
import { type DesfibriladorRow } from "@/Routes/Calibration/Equipos/Desfibriladores/components/DesfibriladorTable";

interface CertificateModalProps {
  onClose: () => void;
  equipmentData: DataEquipment | null;
  clientData: any;
  selectedCenter: Center | null;
  selectedMetrologist: Metrologist | null;
  desfibriladorData: DesfibriladorRow[];
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  onClose,
  equipmentData,
  clientData,
  selectedCenter,
  selectedMetrologist,
  desfibriladorData,
}) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const { selectedRevisor } = useSelection();

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Certificado_Desfibrilador_${equipmentData?.certificado || "SinNumero"}.pdf`,
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
        <header className="modal-header">
          <h2>Vista Previa del Certificado - Desfibrilador</h2>
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

        <div className="certificate-scroll-area">
          <div ref={componentRef} className="certificate-print-container">
            <Certificado
              equipmentData={equipmentData}
              clientData={clientData}
              technicalInfo={{
                magnitud: "ENERGÍA, FRECUENCIA CARDÍACA, TIEMPO DE CARGA",
                tipo: "DESFIBRILADOR",
                rango: equipmentData.rango || "50 - 360 J",
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
              tipoEquipo="desfibrilador"
            />

            <ReportePagina3 desfibriladorData={desfibriladorData} />

            <ReportePagina4
              desfibriladorData={desfibriladorData}
              observaciones={equipmentData.observacion}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
