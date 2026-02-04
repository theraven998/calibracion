import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import Certificado from "@/components/Equipo/Certificado/Certificado/Certificado";
import ReportePagina1 from "@/components/Equipo/Pagina1/ReportePagina1"; // Reutilizamos la página de trazabilidad
import type { DataEquipment } from "@/components/Equipo/Data";
import { type ThermoSectionResult } from "./ThermoSection";
import ReportePagina2 from "@/components/Equipo/Certificado/Reporte/Termohigrometros/Pagina2/ReportePagina2";
import { useSelection } from "@/context/SelectionContext";
import ReportePagina3 from "@/components/Equipo/Certificado/Reporte/Termohigrometros/Pagina3/ReportePagina3";
interface Props {
  onClose: () => void;
  onUpload?: () => void;
  headerData: DataEquipment | null;
  clientData: any;
  selectedCenter: any;
  selectedMetrologist: any;
  equipmentData: any;
  tempInterna: ThermoSectionResult | null;
  tempExterna: ThermoSectionResult | null;
  humedad: ThermoSectionResult | null;
}

export const CertificateModalThermo: React.FC<Props> = ({
  onClose,
  onUpload,
  headerData,
  clientData,
  selectedCenter,
  selectedMetrologist,
  equipmentData,
  tempInterna,
  tempExterna,
  humedad,
}) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const { selectedRevisor } = useSelection();

  // Lógica de Impresión (Idéntica a tu referencia)
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Certificado_${headerData?.certificado || "Thermo"}.pdf`,
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

  // Validación de seguridad
  if (!headerData || !clientData) {
    return (
      <div className="certificate-modal-overlay">
        <div className="certificate-modal-content">
          <p style={{ color: "white", padding: "2rem" }}>
            Error: Faltan datos para generar el certificado.
          </p>
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
        {/* --- HEADER DEL MODAL --- */}
        <header className="modal-header">
          <h2>Vista Previa</h2>
          <div className="modal-actions-header">
            <button
              onClick={() => handlePrint && handlePrint()}
              className="btn-primary"
            >
              📥 Descargar PDF
            </button>

            {/* Botón opcional para subir o cerrar */}
            <button onClick={onUpload || onClose} className="btn-secondary">
              ☁️ Subir a Nube
            </button>

            <button onClick={onClose} className="btn-close">
              ×
            </button>
          </div>
        </header>

        {/* --- ÁREA DE SCROLL --- */}
        <div className="certificate-scroll-area">
          {/* Referencia para react-to-print */}
          <div ref={componentRef} className="certificate-print-container">
            {/* PÁGINA 1: PORTADA DEL CERTIFICADO */}
            <Certificado
              equipmentData={equipmentData}
              clientData={clientData}
              technicalInfo={{
                magnitud: "TEMPERATURA Y HUMEDAD",
                tipo: "TERMOHIGRÓMETRO",
                rango:
                  equipmentData.rango ||
                  " 16.64 a 37.21°C, 1.75 a 10.12°C, 29.8% HR a 90.7% HR",
              }}
              metrologo={selectedMetrologist}
              revisor={selectedRevisor!}
            />

            {/* PÁGINA 2: TRAZABILIDAD Y METRÓLOGO */}
            <ReportePagina1
              certNumber={headerData.certificado || "---"}
              relevantInfo={{
                fechaRecepcion:
                  clientData.fechaRecepcion || new Date().toLocaleDateString(),
                fechaCalibracion:
                  clientData.fechaCalibracion ||
                  new Date().toLocaleDateString(),
                sitioCalibracion: selectedCenter?.address || "Laboratorio",
                metrologo: selectedMetrologist?.name || "---",
              }}
              tipoEquipo="termohigrometro" // Importante para filtrar patrones
            />
            <ReportePagina2
              tempInterna={tempInterna}
              tempExterna={tempExterna}
            />
            <ReportePagina3
              humedad={humedad}
              observaciones={clientData.observaciones || ""}
            />
            {/* PÁGINA 3: RESULTADOS TÉCNICOS (Thermo) */}
          </div>
        </div>
      </div>
    </div>
  );
};
