import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import Certificado from "@/components/Equipo/Certificado/Certificado/Certificado";
import ReportePagina1 from "@/components/Equipo/Pagina1/ReportePagina1";
import ReportePagina3 from "@/components/Equipo/Certificado/Reporte/Electrocardiografos/Pagina3/ReportePagina3";
import ReportePagina4 from "@/components/Equipo/Certificado/Reporte/Electrocardiografos/Pagina4/ReportePagina4";
import type { DataEquipment } from "@/components/Equipo/Data";
import type { Center } from "@/services/api";
import type { Metrologist } from "@/context/SelectionContext";
import { useSelection } from "@/context/SelectionContext";
import { type ElectrocardiografoRow } from "@/Routes/Calibration/Equipos/Electrocardiografo/components/ElectrocardiografoTable";

interface CertificateModalProps {
  onClose: () => void;
  equipmentData: DataEquipment | null;
  clientData: any;
  selectedCenter: Center | null;
  selectedMetrologist: Metrologist | null;
  electrocardiografoData: ElectrocardiografoRow[];
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  onClose,
  equipmentData,
  clientData,
  selectedCenter,
  selectedMetrologist,
  electrocardiografoData,
}) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const { selectedRevisor } = useSelection();

  // Configuración de react-to-print para descargar PDF
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Certificado_Electrocardiografo_${equipmentData?.certificado || "SinNumero"}.pdf`,
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
          <h2>Vista Previa del Certificado - Electrocardiógrafo</h2>
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
                magnitud: "FRECUENCIA CARDÍACA, AMPLITUD, ANCHO DE ONDA",
                tipo: "ELECTROCARDIÓGRAFO",
                rango: equipmentData.rango || "20 - 240 BPM",
              }}
              metrologo={selectedMetrologist}
              revisor={selectedRevisor!}
            />

            {/* ===== PÁGINA 2: INFORMACIÓN RELEVANTE ===== */}
            <ReportePagina1
              certNumber={equipmentData.certificado || "---"}
              relevantInfo={{
                fechaRecepcion: new Date().toLocaleDateString(),
                fechaCalibracion: clientData.fechaCalibracion,
                sitioCalibracion: selectedCenter?.name || "Laboratorio",
                metrologo: selectedMetrologist?.nombre || "---",
              }}
              tipoEquipo="electrocardiografo"
            />

            {/* ===== PÁGINA 3: RESULTADOS ECG AMPLITUD ===== */}
            <ReportePagina3 electrocardiografoData={electrocardiografoData} />

            {/* ===== PÁGINA 4: PRUEBAS CUALITATIVAS Y OBSERVACIONES ===== */}
            <ReportePagina4
              electrocardiografoData={electrocardiografoData}
              observaciones={equipmentData.observacion}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
