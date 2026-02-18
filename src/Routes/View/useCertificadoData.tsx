import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import url from "@/constants/url.json";
import { useIsMobile } from "@/hooks/useIsMobile";

// React-PDF
import { Document, Page, pdfjs } from "react-pdf";
import html2pdf from "html2pdf.js";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Worker config
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

// CSS LOCAL - SOLO UNA VEZ ✅
import "./Cloud.css";
import "./styles.css";

// React Server Rendering
import { renderToString } from "react-dom/server";

// Componentes
import { SelectionProvider } from "@/context/SelectionContext";
import Certificado from "@/components/Equipo/Certificado/Certificado/Certificado";
import ReportePagina1 from "@/components/Equipo/Pagina1/ReportePagina1";
import ReportePagina2 from "@/components/Equipo/Certificado/Reporte/Basculas/Pagina2/ReportePagina2";
import ReportePagina3 from "@/components/Equipo/Certificado/Reporte/Basculas/Pagina3/ReportePagina3";
import ReportePagina3PesaBebe from "@/components/Equipo/Certificado/Reporte/PesaBebe/Pagina3/ReportePagina3";
import ReportePagina4PesaBebe from "@/components/Equipo/Certificado/Reporte/PesaBebe/Pagina4/ReportePagina4";
import ReportePagina3Pulsoximetro from "@/components/Equipo/Certificado/Reporte/Pulsoximetros/Pagina3/ReportePagina3";
import ReportePagina4Pulsoximetro from "@/components/Equipo/Certificado/Reporte/Pulsoximetros/Pagina4/ReportePagina4";
import ReportePagina2Termohigrometro from "@/components/Equipo/Certificado/Reporte/Termohigrometros/Pagina2/ReportePagina2";
import ReportePagina3Termohigrometro from "@/components/Equipo/Certificado/Reporte/Termohigrometros/Pagina3/ReportePagina3";
import ReportePagina3TermometroInfarrojo from "@/components/Equipo/Certificado/Reporte/Infrarrojos/Pagina3/ReportePagina3";
import ReporteGraficasInfrarrojo from "@/components/Equipo/Certificado/Reporte/Infrarrojos/Pagina4/ReportePagina4";
import ReportePagina3Termometro from "@/components/Equipo/Certificado/Reporte/Termometros/Pagina3/ReportePagina3";
import ReporteGraficasTermometro from "@/components/Equipo/Certificado/Reporte/Termometros/Pagina4/ReportePagina4";
import ReportePagina2Tensiometro from "@/components/Equipo/Certificado/Reporte/Tensiometros/ReportePagina2";
import ReportePagina3Tensiometro from "@/components/Equipo/Certificado/Reporte/Tensiometros/ReportePagina3";
import ReportePagina3Monitor from "@/components/Equipo/Certificado/Reporte/Monitores/Pagina3/ReportePagina3";
import ReportePagina4Monitor from "@/components/Equipo/Certificado/Reporte/Monitores/Pagina4/ReportePagina4";
import ReportePagina3Electro from "@/components/Equipo/Certificado/Reporte/Electrocardiografos/Pagina3/ReportePagina3";
import ReportePagina4Electro from "@/components/Equipo/Certificado/Reporte/Electrocardiografos/Pagina4/ReportePagina4";
import ReportePagina3Desfibrilador from "@/components/Equipo/Certificado/Reporte/Desfibriladores/Pagina3/ReportePagina3";
import ReportePagina4Desfibrildor from "@/components/Equipo/Certificado/Reporte/Desfibriladores/Pagina4/ReportePagina4";
// Vistas
import CertificadoMobileView from "./CertificadoMobileView";
import CertificadoDesktopView from "./CertificadoDesktopView";

// Types
import { type Patron, type Metrologo } from "@/services/api";

type CertificadoDoc = {
  _id: string;
  nombre?: string;
  tipoEquipo?: string;
  numeroCertificado?: string;
  equipo?: string;
  marca?: string;
  modelo?: string;
  serie?: string;
  areaEquipo?: string;
  fechaCalibracion?: string; // o ISO
  metrologist?: Metrologo;
  revisor?: Metrologo;
  patron?: Patron;
  template: {
    tipo: string; // "bascula", "termohigrometro", etc.
  };
  data: {
    header?: {
      certificado?: string;
      ubicacion?: string;
      observacion?: string;
      codigoInventario?: string;
      rango?: string;
      resolucion?: string;
      clientData?: {
        name: string;
        address: string;
      };
      exactitud?: any[]; // ideal: CalibrationRow[]
      excentricidad?: any[]; // ideal: ExcentricidadResult[]
      observacionesMetrologo?: string;
    };
  };
};
function getCssLinksByTemplate(tipo: string) {
  const base = "/cert-styles/base.css";

  switch (tipo) {
    case "bascula-piso":
      return [base, "/cert-styles/bascula.css"]; // <-- aquí
    case "bascula-pesa-bebe":
      return [base, "/cert-styles/bascula.css"]; // <-- aquí
    case "termohigrometro":
      return [base, "/cert-styles/termohigrometro.css"];
    case "termometro_infrarrojo":
      return [base, "/cert-styles/termometro_infrarrojo.css"];
    case "termometro":
      return [base, "/cert-styles/termometro.css"];
    case "tensiometro":
      return [base, "/cert-styles/tensiometro.css"];
    case "monitor-multiparametro":
      return [base, "/cert-styles/monitor-multiparametro.css"];
    case "pulsoximetro":
      return [base, "/cert-styles/pulsoximetro.css"];
    case "electrocardiografo":
      return [base, "/cert-styles/electrocardiografo.css"];
    case "desfibrilador":
      return [base, "/cert-styles/desfibrilador.css"];
    default:
      return [base];
  }
}
// useCertificadoData.tsx - función renderCertificateToHtml

function renderCertificateToHtml(
  doc: CertificadoDoc,
  baseUrl?: string,
): string {
  const tipo = doc.template?.tipo || doc.tipoEquipo || "default";
  const cssHrefs = getCssLinksByTemplate(tipo);

  const bodyHtml = (() => {
    switch (tipo) {
      case "bascula-piso": {
        // ✅ Intentar ambas rutas
        const exactitud =
          doc.data?.exactitud ?? doc.data?.header?.exactitud ?? [];
        const excentricidad =
          doc.data?.excentricidad ?? doc.data?.header?.excentricidad ?? [];
        const observaciones =
          doc.data?.observacionesMetrologo ??
          doc.data?.header?.observacionesMetrologo ??
          "";
        const certNumber =
          doc.numeroCertificado || doc.data?.header?.certificado || "---";
        const fechaCal = doc.fechaCalibracion
          ? new Date(doc.fechaCalibracion).toLocaleDateString()
          : new Date().toLocaleDateString();

        const equipmentData = {
          ...(doc.data?.header ?? {}),
          certificado: certNumber,
          equipo: doc.equipo,
          marca: doc.marca,
          modelo: doc.modelo,
          serie: doc.serie,
          areaEquipo: doc.areaEquipo,
          resolucion: doc.data?.header?.resolucion,
          rango: (() => {
            const exactitudData = doc.data?.exactitud ?? [];
            if (exactitudData.length === 0) return "—";
            const firstPatron = exactitudData[0].patron;
            const lastPatron = exactitudData[exactitudData.length - 1].patron;
            return `${firstPatron}Kg - ${lastPatron}Kg`;
          })(),
        };

        const clientData = {
          name: doc.data?.header?.clientData?.name,
          address: doc.data?.header?.clientData?.address,
          fechaCalibracion: fechaCal,
        };

        return renderToString(
          <SelectionProvider>
            <Certificado
              equipmentData={equipmentData as any}
              clientData={clientData as any}
              technicalInfo={{
                magnitud: "MASA",
                tipo: "BASCULA DE PISO",
                unidad: "kg",
                rango: equipmentData?.rango || "—",
              }}
              metrologo={doc.metrologist}
              revisor={doc.revisor}
            />
            <ReportePagina1
              certNumber={certNumber}
              relevantInfo={{
                fechaRecepcion: fechaCal,
                fechaCalibracion: fechaCal,
                sitioCalibracion: doc.data?.header?.clientData?.address || "N.",
                metrologo: doc?.metrologist?.nombre || "---",
              }}
              patronUsed={doc.patron}
              tipoEquipo="bascula"
            />
            <ReportePagina2
              calibrationData={exactitud as any}
              excentricidadData={excentricidad as any}
            />
            <ReportePagina3
              calibrationData={exactitud as any}
              observaciones={observaciones}
            />
          </SelectionProvider>,
        );
      }
      case "bascula-pesa-bebe": {
        const exactitud =
          doc.data?.exactitud ?? doc.data?.header?.exactitud ?? [];
        const excentricidad =
          doc.data?.excentricidad ?? doc.data?.header?.excentricidad ?? [];
        const observaciones =
          doc.data?.observacionesMetrologo ??
          doc.data?.header?.observacionesMetrologo ??
          "";
        const certNumber =
          doc.numeroCertificado || doc.data?.header?.certificado || "---";
        const fechaCal = doc.fechaCalibracion
          ? new Date(doc.fechaCalibracion).toLocaleDateString()
          : new Date().toLocaleDateString();

        const equipmentData = {
          ...(doc.data?.header ?? {}),
          certificado: certNumber,
          equipo: doc.equipo,
          marca: doc.marca,
          modelo: doc.modelo,
          serie: doc.serie,
          areaEquipo: doc.areaEquipo,
          resolucion: doc.data?.header?.resolucion,
          rango: (() => {
            const exactitudData = doc.data?.exactitud ?? [];
            if (exactitudData.length === 0) return "—";
            const firstPatron = exactitudData[0].patron;
            const lastPatron = exactitudData[exactitudData.length - 1].patron;
            return `${firstPatron}kg - ${lastPatron}kg`;
          })(),
        };

        const clientData = {
          name: doc.data?.header?.clientData?.name || "N/A",
          address: doc.data?.header?.clientData?.address || "N/A",
          fechaCalibracion: fechaCal,
        };

        return renderToString(
          <SelectionProvider>
            <Certificado
              equipmentData={equipmentData as any}
              clientData={clientData as any}
              technicalInfo={{
                magnitud: "MASA",
                tipo: "BÁSCULA PESA BEBÉ",
                unidad: "kg",
                rango: equipmentData?.rango || "—",
              }}
              metrologo={doc.metrologist}
              revisor={doc.revisor}
            />
            <ReportePagina1
              certNumber={certNumber}
              relevantInfo={{
                fechaRecepcion: fechaCal,
                fechaCalibracion: fechaCal,
                sitioCalibracion: doc.data?.header?.ubicacion || "N.",
                metrologo: doc?.metrologist?.nombre || "---",
              }}
              patronUsed={doc.patron}
              tipoEquipo="bascula-pesa-bebe"
            />

            {/* ✅ PÁGINA 2: Tablas de resultados (exactitud + excentricidad) */}
            <ReportePagina3PesaBebe
              calibrationData={exactitud}
              excentricidadData={excentricidad}
            />

            {/* ✅ PÁGINA 3: Gráfica + observaciones */}
            <ReportePagina4PesaBebe
              calibrationData={exactitud} // ✅ Solo calibrationData para la gráfica
              observaciones={observaciones}
            />
          </SelectionProvider>,
        );
      }
      case "monitor-multiparametro": {
        // ✅ Extraer datos de NIBP, SPO2, ECG y Respiración
        const nibpData = doc.data?.nibp ?? null;
        const spo2Data = doc.data?.spo2 ?? null;
        const ecgData = doc.data?.ecg ?? null;
        const respiracionData = doc.data?.respiracion ?? null;

        const observaciones =
          doc.data?.observacionesMetrologo ??
          doc.data?.header?.observacionesMetrologo ??
          "";

        const certNumber =
          doc.numeroCertificado || doc.data?.header?.certificado || "---";

        const fechaCal = doc.fechaCalibracion
          ? new Date(doc.fechaCalibracion).toLocaleDateString()
          : new Date().toLocaleDateString();

        const equipmentData = {
          ...(doc.data?.header ?? {}),
          certificado: certNumber,
          equipo: doc.equipo,
          marca: doc.marca,
          modelo: doc.modelo,
          serie: doc.serie,
          areaEquipo: doc.areaEquipo,
          resolucion: doc.data?.header?.resolucion,
          rango: doc.patron?.rango || "Variable según parámetro",
        };

        const clientData = {
          name: doc.data?.header?.clientData?.name,
          address: doc.data?.header?.clientData?.address,
          fechaCalibracion: fechaCal,
        };

        return renderToString(
          <SelectionProvider>
            <Certificado
              equipmentData={equipmentData as any}
              clientData={clientData as any}
              technicalInfo={{
                magnitud: "PRESIÓN, SATURACIÓN, ECG, RESPIRACIÓN",
                tipo: "MONITOR DE SIGNOS VITALES",
                unidad: "mmHg, %, BPM, RPM",
                rango: equipmentData?.rango || "Variable según parámetro",
              }}
              metrologo={doc.metrologist}
              revisor={doc.revisor}
            />
            <ReportePagina1
              certNumber={certNumber}
              relevantInfo={{
                fechaRecepcion: fechaCal,
                fechaCalibracion: fechaCal,
                sitioCalibracion:
                  doc.data?.header?.clientData?.address || "N/A",
                metrologo: doc?.metrologist?.nombre || "---",
              }}
              patronUsed={doc.patron}
              tipoEquipo="monitor"
            />
            <ReportePagina3Monitor
              nibpData={nibpData as any}
              spo2Data={spo2Data as any}
            />
            <ReportePagina4Monitor
              ecgData={ecgData as any}
              respiracionData={respiracionData as any}
              observaciones={observaciones}
            />
          </SelectionProvider>,
        );
      }
      case "electrocardiografo": {
        const electrocardiografoData = doc.data?.electrocardiografo ?? [];
        const observaciones =
          doc.data?.observacionesMetrologo ??
          doc.data?.header?.observacionesMetrologo ??
          "";

        const certNumber =
          doc.numeroCertificado || doc.data?.header?.certificado || "---";

        const fechaCal = doc.fechaCalibracion
          ? new Date(doc.fechaCalibracion).toLocaleDateString()
          : new Date().toLocaleDateString();

        const equipmentData = {
          ...(doc.data?.header ?? {}),
          certificado: certNumber,
          equipo: doc.equipo,
          marca: doc.marca,
          modelo: doc.modelo,
          serie: doc.serie,
          areaEquipo: doc.areaEquipo,
          resolucion: doc.data?.header?.resolucion,
          rango: "20 - 240 BPM",
        };

        const clientData = {
          name: doc.data?.header?.clientData?.name,
          address: doc.data?.header?.clientData?.address,
          fechaCalibracion: fechaCal,
        };

        return renderToString(
          <SelectionProvider>
            <Certificado
              equipmentData={equipmentData as any}
              clientData={clientData as any}
              technicalInfo={{
                magnitud: "FRECUENCIA CARDÍACA, AMPLITUD, ANCHO DE ONDA",
                tipo: "ELECTROCARDIÓGRAFO",
                unidad: "BPM, mV, ms",
                rango: equipmentData?.rango || "20 - 240 BPM",
              }}
              metrologo={doc.metrologist}
              revisor={doc.revisor}
            />
            <ReportePagina1
              certNumber={certNumber}
              relevantInfo={{
                fechaRecepcion: fechaCal,
                fechaCalibracion: fechaCal,
                sitioCalibracion:
                  doc.data?.header?.clientData?.address || "N/A",
                metrologo: doc?.metrologist?.nombre || "---",
              }}
              patronUsed={doc.patron}
              tipoEquipo="electrocardiografo"
            />
            <ReportePagina3Electro
              electrocardiografoData={electrocardiografoData as any}
            />
            <ReportePagina4Electro
              electrocardiografoData={electrocardiografoData as any}
              observaciones={observaciones}
            />
          </SelectionProvider>,
        );
      }
      case "desfibrilador": {
        const observaciones =
          doc.data?.observacionesMetrologo ??
          doc.data?.header?.observacionesMetrologo ??
          "";
        const certNumber =
          doc.numeroCertificado || doc.data?.header?.certificado || "---";
        const fechaCal = doc.fechaCalibracion
          ? new Date(doc.fechaCalibracion).toLocaleDateString()
          : new Date().toLocaleDateString();

        const equipmentData = {
          ...(doc.data?.header ?? {}),
          certificado: certNumber,
          equipo: doc.equipo,
          marca: doc.marca,
          modelo: doc.modelo,
          serie: doc.serie,
          areaEquipo: doc.areaEquipo,
          rango: doc.patron?.rango || "—",
        };

        const clientData = {
          name: doc.data?.header?.clientData?.name,
          address: doc.data?.header?.clientData?.address,
          fechaCalibracion: fechaCal,
        };

        return renderToString(
          <SelectionProvider>
            <Certificado
              equipmentData={equipmentData as any}
              clientData={clientData as any}
              technicalInfo={{
                magnitud: "ENERGÍA",
                tipo: "DESFIBRILADOR",
                unidad: "J",
                rango: equipmentData?.rango || "—",
              }}
              metrologo={doc.metrologist}
              revisor={doc.revisor}
            />
            <ReportePagina1
              certNumber={certNumber}
              relevantInfo={{
                fechaRecepcion: fechaCal,
                fechaCalibracion: fechaCal,
                sitioCalibracion:
                  doc.data?.header?.clientData?.address || "N/A",
                metrologo: doc?.metrologist?.nombre || "---",
              }}
              patronUsed={doc.patron}
              tipoEquipo="desfibrilador"
            />
            <ReportePagina3Desfibrilador
              desfibriladorData={doc.data?.desfibrilador as any}
            />
            <ReportePagina4Desfibrildor
              desfibriladorData={doc.data?.desfibrilador as any}
              observaciones={observaciones}
            />
          </SelectionProvider>,
        );
      }
      case "pulsoximetro": {
        // ✅ Corregir ruta
        const pulsoximetroData =
          doc.data?.pulsoximetro ?? doc.data?.header?.pulsoximetro ?? [];
        const observaciones =
          doc.data?.observacionesMetrologo ??
          doc.data?.header?.observacionesMetrologo ??
          "";
        const certNumber =
          doc.numeroCertificado || doc.data?.header?.certificado || "---";
        const fechaCal = doc.fechaCalibracion
          ? new Date(doc.fechaCalibracion).toLocaleDateString()
          : new Date().toLocaleDateString();

        const equipmentData = {
          ...(doc.data?.header ?? {}),
          certificado: certNumber,
          equipo: doc.equipo,
          marca: doc.marca,
          modelo: doc.modelo,
          serie: doc.serie,
          areaEquipo: doc.areaEquipo,
          resolucion: doc.data?.header?.resolucion,
        };

        const clientData = {
          name: doc.data?.header?.clientData?.name,
          address: doc.data?.header?.clientData?.address,
          fechaCalibracion: fechaCal,
        };

        return renderToString(
          <SelectionProvider>
            <Certificado
              equipmentData={equipmentData as any}
              clientData={clientData as any}
              technicalInfo={{
                magnitud: "SATURACIÓN DE OXÍGENO / FRECUENCIA CARDÍACA",
                tipo: "PULSOXÍMETRO",
                unidad: "% / BPM",
                rango: doc.patron?.rango || "—",
              }}
              metrologo={doc.metrologist}
              revisor={doc.revisor}
            />
            <ReportePagina1
              certNumber={certNumber}
              relevantInfo={{
                fechaRecepcion: fechaCal,
                fechaCalibracion: fechaCal,
                sitioCalibracion:
                  doc.data?.header?.clientData?.address || "N/A",
                metrologo: doc?.metrologist?.nombre || "---",
              }}
              patronUsed={doc.patron}
              tipoEquipo="pulsoximetro"
            />
            <ReportePagina3Pulsoximetro
              calibrationData={pulsoximetroData as any}
              observaciones={observaciones}
            />
            <ReportePagina4Pulsoximetro
              calibrationData={pulsoximetroData as any}
              observaciones={observaciones}
            />
          </SelectionProvider>,
        );
      }
      case "termohigrometro": {
        // ✅✅ ESTE ES TU CASO - Corregir rutas
        const tempInterna =
          doc.data?.tempInterna ?? doc.data?.header?.tempInterna ?? null;
        const tempExterna =
          doc.data?.tempExterna ?? doc.data?.header?.tempExterna ?? null;
        const humedad = doc.data?.humedad ?? doc.data?.header?.humedad ?? null;
        const observaciones =
          doc.data?.observacionesMetrologo ??
          doc.data?.header?.observacionesMetrologo ??
          "";

        const certNumber =
          doc.numeroCertificado || doc.data?.header?.certificado || "---";
        const fechaCal = doc.fechaCalibracion
          ? new Date(doc.fechaCalibracion).toLocaleDateString()
          : new Date().toLocaleDateString();

        const equipmentData = {
          ...(doc.data?.header ?? {}),
          certificado: certNumber,
          equipo: doc.equipo,
          marca: doc.marca,
          modelo: doc.modelo,
          serie: doc.serie,
          areaEquipo: doc.areaEquipo,
          resolucion: doc.data?.header?.resolucion,
          ubicacion: doc.data?.header?.ubicacion,
          codigoInventario: doc.data?.header?.codigoInventario,
        };

        const clientData = {
          name: doc.data?.header?.clientData?.name,
          address: doc.data?.header?.clientData?.address,
          fechaCalibracion: fechaCal,
          observaciones: observaciones,
        };

        return renderToString(
          <SelectionProvider>
            <Certificado
              equipmentData={equipmentData as any}
              clientData={clientData as any}
              technicalInfo={{
                magnitud: "TEMPERATURA / HUMEDAD",
                tipo: "TERMOHIGRÓMETRO",
                unidad: "°C / %HR",
                rango: doc.patron?.rango || doc.data?.header?.rango || "—",
              }}
              metrologo={doc.metrologist}
              revisor={doc.revisor}
            />
            <ReportePagina1
              certNumber={certNumber}
              relevantInfo={{
                fechaRecepcion: fechaCal,
                fechaCalibracion: fechaCal,
                sitioCalibracion: doc.data?.header?.clientData?.address || "—",
                metrologo: doc?.metrologist?.nombre || "---",
              }}
              patronUsed={doc.patron}
              tipoEquipo="termohigrometro"
            />
            <ReportePagina2Termohigrometro
              tempInterna={tempInterna as any}
              tempExterna={tempExterna as any}
            />
            <ReportePagina3Termohigrometro
              humedad={humedad as any}
              observaciones={observaciones}
            />
          </SelectionProvider>,
        );
      }
      case "termometro_infrarrojo": {
        // ✅ Corregir ruta
        const sensorExterno =
          doc.data?.sensorExterno ?? doc.data?.header?.sensorExterno ?? null;
        const observaciones =
          doc.data?.observacionesMetrologo ??
          doc.data?.header?.observacionesMetrologo ??
          "";

        const certNumber =
          doc.numeroCertificado || doc.data?.header?.certificado || "---";
        const fechaCal = doc.fechaCalibracion
          ? new Date(doc.fechaCalibracion).toLocaleDateString()
          : new Date().toLocaleDateString();

        const equipmentData = {
          ...(doc.data?.header ?? {}),
          certificado: certNumber,
          equipo: doc.equipo,
          marca: doc.marca,
          modelo: doc.modelo,
          serie: doc.serie,
          areaEquipo: doc.areaEquipo,
          resolucion: doc.data?.header?.resolucion,
          ubicacion: doc.data?.header?.ubicacion,
          codigoInventario: doc.data?.header?.codigoInventario,
          rango: (() => {
            const data = sensorExterno?.data ?? [];
            const validEntries = data.filter((entry: any) => entry?.patron);

            if (validEntries.length === 0) {
              return "-30 °C a 37 °C";
            }

            const first = validEntries[0]?.patron;
            const last = validEntries[validEntries.length - 1]?.patron;

            return `${first} °C a ${last} °C`;
          })(),
        };

        const clientData = {
          name: doc.data?.header?.clientData?.name,
          address: doc.data?.header?.clientData?.address,
          fechaCalibracion: fechaCal,
          fechaRecepcion: fechaCal,
          observaciones: observaciones,
        };

        return renderToString(
          <SelectionProvider>
            <Certificado
              equipmentData={equipmentData as any}
              clientData={clientData as any}
              technicalInfo={{
                magnitud: "TEMPERATURA",
                tipo: "TERMÓMETRO INFRARROJO",
                unidad: "°C",
                rango: equipmentData.rango,
              }}
              metrologo={doc.metrologist}
              revisor={doc.revisor}
            />
            <ReportePagina1
              certNumber={certNumber}
              relevantInfo={{
                fechaRecepcion: fechaCal,
                fechaCalibracion: fechaCal,
                sitioCalibracion: doc.data?.header?.clientData?.address || "—",
                metrologo: doc?.metrologist?.nombre || "---",
              }}
              patronUsed={doc.patron}
              tipoEquipo="termometro_infrarrojo"
            />
            <ReportePagina3TermometroInfarrojo
              sensorExterno={sensorExterno as any}
            />
            <ReporteGraficasInfrarrojo observaciones={observaciones} />
          </SelectionProvider>,
        );
      }
      case "termometro": {
        // ✅ Corregir rutas
        const sensorExterno =
          doc.data?.sensorExterno ?? doc.data?.header?.sensorExterno ?? null;
        const sensorInterno =
          doc.data?.sensorInterno ?? doc.data?.header?.sensorInterno ?? null;
        const observaciones =
          doc.data?.observacionesMetrologo ??
          doc.data?.header?.observacionesMetrologo ??
          "";

        const certNumber =
          doc.numeroCertificado || doc.data?.header?.certificado || "---";
        const fechaCal = doc.fechaCalibracion
          ? new Date(doc.fechaCalibracion).toLocaleDateString()
          : new Date().toLocaleDateString();

        const equipmentData = {
          ...(doc.data?.header ?? {}),
          certificado: certNumber,
          equipo: doc.equipo,
          marca: doc.marca,
          modelo: doc.modelo,
          serie: doc.serie,
          areaEquipo: doc.areaEquipo,
          resolucion: doc.data?.header?.resolucion,
          ubicacion: doc.data?.header?.ubicacion,
          codigoInventario: doc.data?.header?.codigoInventario,
          rango: (() => {
            const data = sensorExterno?.data ?? [];
            const validEntries = data.filter((entry: any) => entry?.patron);

            if (validEntries.length === 0) {
              return "-30 °C a 37 °C";
            }

            const first = validEntries[0]?.patron;
            const last = validEntries[validEntries.length - 1]?.patron;

            return `${first} °C a ${last} °C`;
          })(),
        };

        const clientData = {
          name: doc.data?.header?.clientData?.name,
          address: doc.data?.header?.clientData?.address,
          fechaCalibracion: fechaCal,
          fechaRecepcion: fechaCal,
          observaciones: observaciones,
        };

        return renderToString(
          <SelectionProvider>
            <Certificado
              equipmentData={equipmentData as any}
              clientData={clientData as any}
              technicalInfo={{
                magnitud: "TEMPERATURA",
                tipo: "TERMÓMETRO",
                unidad: "°C",
                rango: equipmentData.rango,
              }}
              metrologo={doc.metrologist}
              revisor={doc.revisor}
            />
            <ReportePagina1
              certNumber={certNumber}
              relevantInfo={{
                fechaRecepcion: fechaCal,
                fechaCalibracion: fechaCal,
                sitioCalibracion: doc.data?.header?.clientData?.address || "—",
                metrologo: doc?.metrologist?.nombre || "---",
              }}
              patronUsed={doc.patron}
              tipoEquipo="termometro"
            />
            <ReportePagina3Termometro
              sensorExterno={sensorExterno as any}
              sensorInterno={sensorInterno as any}
            />
            <ReporteGraficasTermometro
              observaciones={observaciones}
              sensorInterno={sensorInterno as any}
              sensorExterno={sensorExterno as any}
            />
          </SelectionProvider>,
        );
      }
      case "tensiometro": {
        const rows = doc.data?.presiones ?? doc.data?.header?.presiones ?? [];
        const observaciones = doc.data?.observacionesMetrologo ?? "";
        const certNumber =
          doc.numeroCertificado || doc.data?.header?.certificado || "---";
        const fechaCal = doc.fechaCalibracion
          ? new Date(doc.fechaCalibracion).toLocaleDateString()
          : new Date().toLocaleDateString();

        const equipmentData = {
          ...(doc.data?.header ?? {}),
          certificado: certNumber,
          equipo: doc.equipo,
          marca: doc.marca,
          modelo: doc.modelo,
          serie: doc.serie,
          areaEquipo: doc.areaEquipo,
          ubicacion: doc.data?.header?.ubicacion,
          rango: doc.patron?.rango || "---",
        };

        const clientData = {
          name: doc.data?.header?.clientData?.name,
          address: doc.data?.header?.clientData?.address,
          fechaCalibracion: fechaCal,
        };

        // ⚠️ IMPORTANTE: Envuelve en un div para extraer solo el contenido
        return renderToString(
          <SelectionProvider>
            {/* Solo renderiza el contenido interno del modal, no el overlay */}
            <Certificado
              equipmentData={equipmentData as any}
              clientData={clientData}
              technicalInfo={{
                magnitud: "PRESIÓN",
                tipo: "TENSIÓMETRO",
                rango: equipmentData.rango,
                unidad: "mmHg",
              }}
              metrologo={doc.metrologist}
              revisor={doc.revisor}
            />
            <ReportePagina1
              certNumber={certNumber}
              relevantInfo={{
                fechaRecepcion: fechaCal,
                fechaCalibracion: fechaCal,
                sitioCalibracion:
                  doc.data?.header?.clientData?.name ||
                  "Calle 5N # 3-27, Maripí, Boyacá",
                metrologo: doc.metrologist?.nombre || "---",
              }}
              patronUsed={doc.patron}
              tipoEquipo="tensiometro"
              metrologo={doc.metrologist}
            />

            {/* Página 2: Tabla de resultados */}
            <ReportePagina2Tensiometro rows={rows} />

            {/* PÁGINA 3: Gráfica y observaciones */}
            <ReportePagina3Tensiometro
              rows={rows}
              observaciones={observaciones}
            />
          </SelectionProvider>,
        );
      }
      default:
        return renderToString(
          <div style={{ padding: 16, fontFamily: "system-ui" }}>
            <h2>Plantilla no soportada</h2>
            <p>template.tipo: {tipo}</p>
          </div>,
        );
    }
  })();

  return buildHtmlDocumentLinkedCss(bodyHtml, cssHrefs, baseUrl);
}

async function fetchJson<T>(endpoint: string): Promise<T> {
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}
function buildHtmlDocumentLinkedCss(
  bodyHtml: string,
  cssHrefs: string[],
  baseUrl: string = "/", // ✅ Parámetro opcional
) {
  const links = cssHrefs
    .map((href) => `<link rel="stylesheet" href="${href}" />`)
    .join("\n");

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<base href="${baseUrl}" />
${links}
<style>
  @media print {
    * { 
      -webkit-print-color-adjust: exact !important; 
      print-color-adjust: exact !important; 
    }
  }
</style>
</head>
<body>${bodyHtml}</body>
</html>`;
}

export function useCertificadoData(idCertificado: string | undefined) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CertificadoDoc | null>(null);
  const [srcDoc, setSrcDoc] = useState<string>("");

  // ✅ Función auxiliar para obtener CSS según tipo

  useEffect(() => {
    async function load() {
      if (!idCertificado) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const endpoint = `${url.url}/certificados?id=${encodeURIComponent(
          idCertificado,
        )}`;
        const doc = await fetchJson<CertificadoDoc>(endpoint);

        if (!doc?.template?.tipo) {
          throw new Error(
            "Este certificado no tiene template.tipo (nuevo formato requerido).",
          );
        }
        if (!doc?.data) {
          throw new Error(
            "Este certificado no tiene data (nuevo formato requerido).",
          );
        }

        setData(doc);
        console.log("Documento cargado:", doc);

        try {
          // ✅ Aquí SÍ existe window porque estamos en useEffect (cliente)
          const baseUrl = window.location.origin + "/";
          const htmlContent = renderCertificateToHtml(doc, baseUrl);
          setSrcDoc(htmlContent);
          console.log("HTML generado exitosamente");
        } catch (renderError: any) {
          console.error("Error renderizando certificado:", renderError);
          setError(`Error renderizando: ${renderError.message}`);
        }
      } catch (e: any) {
        console.error("Error en load():", e);
        setError(e?.message ?? String(e));
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [idCertificado]);

  return { loading, error, data, srcDoc };
}
export {
  renderCertificateToHtml,
  getCssLinksByTemplate,
  buildHtmlDocumentLinkedCss,
};
