import React, { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import "./CertificateModal.css";

import Certificado from "@/components/Equipo/Certificado/Certificado/Certificado";
import ReportePagina1, {
  type RelevantInfoData,
} from "@/components/Equipo/Pagina1/ReportePagina1";
import ReportePagina2 from "@/components/Equipo/Certificado/Reporte/Tensiometros/ReportePagina2";
import ReportePagina3 from "@/components/Equipo/Certificado/Reporte/Tensiometros/ReportePagina3";
import backgroundReporte from "@/assets/background/marcaReporte.png";

import type { Patron, Metrologo, Center } from "@/services/api";
import type { DataEquipment } from "@/components/Equipo/Data";

type PressureRow = {
  punto: number; // mmHg
  primera: number; // mmHg
  segunda: number; // mmHg
};

type Props = {
  equipmentData: DataEquipment | null;
  rows: PressureRow[];
  clientData: {
    solicitante: string;
    direccion: string;
    fechaCalibracion: string;
  };
  selectedCenter: Center | null;
  selectedMetrologist: Metrologo | null;
  patronUsed?: Patron | null;
  onClose: () => void;
  observaciones?: string;
};

export default function CertificateModalTensiometro({
  equipmentData,
  rows,
  clientData,
  selectedCenter,
  selectedMetrologist,
  patronUsed,
  onClose,
  observaciones,
}: Props) {
  const [isDownloading, setIsDownloading] = useState(false);
  const componentRef = useRef<HTMLDivElement | null>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Certificado_${
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

  const certNumber =
    equipmentData?.certificado || equipmentData?.numeroCertificado || "---";

  const relevantInfo: RelevantInfoData = {
    fechaRecepcion: clientData.fechaCalibracion,
    fechaCalibracion: clientData.fechaCalibracion,
    sitioCalibracion:
      selectedCenter?.direccion || selectedCenter?.address || "---",
    metrologo: selectedMetrologist?.nombre || "---",
  };

  if (!equipmentData) {
    return (
      <div className="certificate-modal-overlay" onClick={onClose}>
        <div
          className="certificate-modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h2>Vista previa</h2>
            <div className="modal-actions-header">
              <button className="btn-close" onClick={onClose}>
                Cerrar
              </button>
            </div>
          </div>
          <div className="certificate-scroll-area">
            <div className="certificate-print-container" ref={componentRef}>
              <p>Faltan datos del equipo (sección Data).</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const obsText =
    observaciones ||
    equipmentData.observaciones ||
    equipmentData.observacion ||
    "";

  return (
    <div className="certificate-modal-overlay" onClick={onClose}>
      <div
        className="certificate-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <h2>Vista Previa del Certificado · Tensiómetro</h2>
          <div className="modal-actions-header">
            <button
              className="btn-primary"
              disabled={isDownloading}
              onClick={handlePrint}
            >
              {isDownloading ? "Generando..." : "📥 Descargar PDF"}
            </button>
            <button className="btn-secondary" onClick={onClose}>
              Subir a la nube
            </button>
            <button className="btn-close" onClick={onClose}>
              ×
            </button>
          </div>
        </header>

        <div className="certificate-scroll-area">
          <div className="certificate-print-container" ref={componentRef}>
            {/* PÁGINA 0: Certificado */}
            <Certificado
              equipmentData={equipmentData}
              clientData={clientData}
              technicalInfo={{
                magnitud: "PRESIÓN",
                tipo: "TENSIÓMETRO",
                rango: equipmentData.rango || "---",
              }}
              metrologo={selectedMetrologist ?? undefined}
            />

            {/* PÁGINA 1 */}
            <ReportePagina1
              certNumber={certNumber}
              relevantInfo={relevantInfo}
              tipoEquipo="tensiometro"
              metrologo={selectedMetrologist ?? undefined}
              patronUsed={patronUsed ?? null}
            />

            {/* PÁGINA 2: Tabla de resultados */}
            <ReportePagina2 rows={rows} />

            {/* PÁGINA 3: Gráfica y observaciones */}
            <ReportePagina3
              rows={rows}
              observaciones={obsText}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
