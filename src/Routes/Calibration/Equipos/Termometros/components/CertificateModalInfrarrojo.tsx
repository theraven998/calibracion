// src/Routes/Calibration/Equipos/Infrarrojos/components/CertificateModalInfrarrojo.tsx
import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import Certificado from "@/components/Equipo/Certificado/Certificado/Certificado";
import ReportePagina1 from "@/components/Equipo/Pagina1/ReportePagina1";
import type { DataEquipment } from "@/components/Equipo/Data";
import { type TempSectionResult } from "@/Routes/Calibration/Equipos/Termometros/components/TempSection";
import ReportePagina3 from "@/components/Equipo/Certificado/Reporte/Termometros/Pagina3/ReportePagina3";
import { useSelection } from "@/context/SelectionContext";
import ReporteGraficasInfrarrojo from "@/components/Equipo/Certificado/Reporte/Termometros/Pagina4/ReportePagina4";

interface Props {
  isInfrarrojo?: boolean;
  onClose: () => void;
  onUpload?: () => void;
  headerData: DataEquipment | null;
  clientData: any;
  selectedCenter: any;
  selectedMetrologist: any;
  equipmentData: any;
  sensorExterno: TempSectionResult | null;
  sensorInterno: TempSectionResult | null;
}

export const CertificateModalTermometro: React.FC<Props> = ({
  isInfrarrojo = true,
  onClose,
  onUpload,
  headerData,
  clientData,
  selectedCenter,
  selectedMetrologist,
  equipmentData,
  sensorExterno,
  sensorInterno,
}) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const { selectedRevisor } = useSelection();

  // Lógica de Impresión
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Certificado_${headerData?.certificado || "Infrarrojo"}.pdf`,
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
          <h2>Vista Previa - Termómetro Infrarrojo</h2>
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
                magnitud: "TEMPERATURA",
                tipo: isInfrarrojo ? "Termómetro Infrarrojo" : "Termómetro",
                rango:
                  equipmentData.rango || isInfrarrojo
                    ? "-30 °C a 37 °C"
                    : "16.80 °C - 37.21 °C, 1.90 °C - 9.25 °C",
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
              tipoEquipo="termometro_infrarrojo"
            />

            {/* PÁGINA 3: RESULTADOS TÉCNICOS (Termómetro Infrarrojo) */}
            <ReportePagina3
              sensorExterno={sensorExterno}
              sensorInterno={sensorInterno}
            />
            <ReporteGraficasInfrarrojo
              observaciones={equipmentData?.observacion || ""}
              sensorInterno={sensorInterno}
              sensorExterno={sensorExterno}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
