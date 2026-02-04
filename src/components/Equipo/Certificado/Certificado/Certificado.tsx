import React from "react";
import "./Certificado.css";
import type { DataEquipment } from "@/components/Equipo/Data";
import backgroundCertificado from "@/assets/background/certificado.png";
import { type Metrologo } from "@/services/api";
export interface ClientData {
  name: string;
  address: string;
  fechaCalibracion: string;
}
interface CertificadoProps {
  equipmentData: DataEquipment | null;
  clientData?: ClientData;
  technicalInfo?: {
    magnitud: string;
    tipo: string;
    rango: string;
    unidad?: string;
    resolucion?: string;
  };
  metrologo?: Metrologo;
  revisor?: Metrologo;
}

const Certificado: React.FC<CertificadoProps> = ({
  equipmentData,
  clientData,
  technicalInfo = { magnitud: "", tipo: "", rango: "" }, // Valores por defecto
  metrologo,
  revisor,
}) => {
  const safeText = (text?: string) => text || "-";

  return (
    <div className="page page1">
      <div
        className="watermark-bg"
        style={{ backgroundImage: `url(${backgroundCertificado})` }}
      >
        <div className="content">
          <div className="page-number">Página 1 de 4</div>
          <div className="header">
            <h1>Certificado de calibración</h1>
            {/* Mapeamos 'certificado' del form a 'Número de Certificado' */}
            <div className="cert-number">
              {safeText(equipmentData?.certificado)}
            </div>
          </div>

          <div className="section-title-first">
            INFORMACIÓN DEL EQUIPO BAJO PRUEBA
          </div>
          <div className="info-grid">
            <div className="info-label">MAGNITUD</div>
            <div className="info-value">{technicalInfo.magnitud}</div>

            <div className="info-label">EQUIPO</div>
            <div className="info-value">{technicalInfo.tipo}</div>

            <div className="info-label">MARCA</div>
            <div className="info-value">{safeText(equipmentData?.marca)}</div>

            <div className="info-label">MODELO</div>
            <div className="info-value">{safeText(equipmentData?.modelo)}</div>

            <div className="info-label">SERIE</div>
            <div className="info-value">{safeText(equipmentData?.serie)}</div>
            <div className="info-label">ACTIVO FIJO</div>
            <div className="info-value">
              {safeText(equipmentData?.codigoInventario)}
            </div>
            <div className="info-label">UNIDAD</div>
            <div className="info-value">{safeText(technicalInfo?.unidad)}</div>
            <div className="info-label">RESOLUCIÓN</div>
            <div className="info-value">
              {safeText(equipmentData?.resolucion)}
            </div>
            <div className="info-label">RANGO MEDICION</div>
            <div className="info-value">{safeText(technicalInfo?.rango)}</div>

            <div className="info-label">UBICACIÓN</div>
            <div className="info-value">
              {safeText(equipmentData?.ubicacion)}
            </div>
          </div>

          <div className="section-title">INFORMACIÓN CLIENTE</div>
          <div className="info-grid">
            <div className="info-label">SOLICITANTE</div>
            <div className="info-value">{safeText(clientData?.name)}</div>

            <div className="info-label">DIRECCIÓN</div>
            <div className="info-value">{safeText(clientData?.address)}</div>
            <div className="info-label">FECHA</div>
            <div className="info-value">
              {safeText(clientData?.fechaCalibracion)}
            </div>
            <div className="info-label">PAGINAS</div>
            <div className="info-value">4</div>
          </div>
          <div className="section-title">FIRMAS AUTORIZADAS</div>
          <div className="signaturesdiv" >
          <div className="signatures">
            <div className="signature-block">
              <img
                src={metrologo?.urlfirma}
                alt="Firma Metrologo"
                className="signature-image"
              />
            </div>

            <div className="signature-block">
              <img
                src={revisor?.urlfirma}
                alt="Firma Revisor"
                className="signature-image"
              />
            </div>
          </div>
          <div className="signature-footer">
            <div className="signature-info">
              <div className="signature-label">Calibro</div>
              <div className="signature-name">
                {safeText(metrologo?.nombre)}
              </div>
            </div>
            <div className="signature-info">
              <div className="signature-label">Reviso</div>
              <div className="signature-name">{safeText(revisor?.nombre)}</div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificado;
