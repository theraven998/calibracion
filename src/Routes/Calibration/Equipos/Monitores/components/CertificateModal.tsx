import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import Certificado from "@/components/Equipo/Certificado/Certificado/Certificado";
import ReportePagina1 from "@/components/Equipo/Pagina1/ReportePagina1";
import ReportePagina3 from "@/components/Equipo/Certificado/Reporte/Monitores/Pagina3/ReportePagina3";
import ReportePagina4 from "@/components/Equipo/Certificado/Reporte/Monitores/Pagina4/ReportePagina4";
import type { DataEquipment } from "@/components/Equipo/Data";
import type { Center } from "@/services/api";
import type { Metrologist } from "@/context/SelectionContext";
import { useSelection } from "@/context/SelectionContext";
import { type NibpData } from "@/Routes/Calibration/Equipos/Monitores/components/NIBPTable";
import { type Spo2Data } from "@/Routes/Calibration/Equipos/Monitores/components/SPO2Table";
import { type EcgData } from "@/Routes/Calibration/Equipos/Monitores/components/ECGTable";
import { type RespiracionData } from "@/Routes/Calibration/Equipos/Monitores/components/RESPIRACIONTable";

interface CertificateModalProps {
  onClose: () => void;
  equipmentData: DataEquipment | null;
  clientData: any;
  selectedCenter: Center | null;
  selectedMetrologist: Metrologist | null;
  nibpData: NibpData | null;
  spo2Data: Spo2Data | null;
  ecgData: EcgData | null;
  respiracionData: RespiracionData | null;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  onClose,
  equipmentData,
  clientData,
  selectedCenter,
  selectedMetrologist,
  nibpData,
  spo2Data,
  ecgData,
  respiracionData,
}) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const { selectedRevisor } = useSelection();

  // Configuración de react-to-print para descargar PDF
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Certificado_Monitor_${equipmentData?.certificado || "SinNumero"}.pdf`,
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
          <h2>Vista Previa del Certificado - Monitor de Signos Vitales</h2>
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
                magnitud: "PRESIÓN, SATURACIÓN, ECG, RESPIRACIÓN",
                tipo: "MONITOR DE SIGNOS VITALES",
                rango: equipmentData.rango || "Variable según parámetro",
              }}
              metrologo={selectedMetrologist}
              revisor={selectedRevisor!}
            />

            {/* ===== PÁGINA 1B: INFORMACIÓN RELEVANTE ===== */}
            <ReportePagina1
              certNumber={equipmentData.certificado || "---"}
              relevantInfo={{
                fechaRecepcion: new Date().toLocaleDateString(),
                fechaCalibracion: clientData.fechaCalibracion,
                sitioCalibracion: selectedCenter?.name || "Laboratorio",
                metrologo: selectedMetrologist?.nombre || "---",
              }}
              tipoEquipo="monitor"
            />

            {/* ===== PÁGINA 2: RESULTADOS NIBP Y SPO2 ===== */}
            <ReportePagina3 nibpData={nibpData} spo2Data={spo2Data} />

            {/* ===== PÁGINA 3: RESULTADOS ECG, RESPIRACIÓN Y OBSERVACIONES ===== */}
            <ReportePagina4
              ecgData={ecgData}
              respiracionData={respiracionData}
              observaciones={equipmentData.observacion}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
