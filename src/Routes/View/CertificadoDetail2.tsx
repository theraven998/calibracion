// CertificadoDetail2.tsx
import { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useCertificadoData } from "./useCertificadoData";
import CertificadoDesktopView, {
  type CertificadoDesktopViewRef,
} from "./CertificadoDesktopView";
import CertificadoMobileView from "./CertificadoMobileView";
import html2pdf from "html2pdf.js";
import "./Cloud.css";
import "./styles.css";

export default function CertificadoDetail2() {
  const { idCertificado } = useParams();
  const isMobile = useIsMobile(768);
  const { loading, error, data, srcDoc } = useCertificadoData(idCertificado);

  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const desktopViewRef = useRef<CertificadoDesktopViewRef>(null);

  // ✅ Función para descargar PDF en móvil
  const downloadPdfMobile = async () => {
    if (!srcDoc) {
      throw new Error("No hay contenido para descargar");
    }

    const filename = `${data?.numeroCertificado || "certificado"}.pdf`;

    const options = {
      margin: [10, 10, 10, 10],
      filename: filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        logging: false,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
        compress: true,
      },
      pagebreak: {
        mode: ["avoid-all", "css", "legacy"],
        avoid: [".no-break", "img", "table"],
      },
    };

    try {
      const pdfBlob = await html2pdf().set(options).from(srcDoc).output("blob");

      const blobUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      link.style.display = "none";

      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }, 100);

      console.log("PDF descargado exitosamente:", filename);
    } catch (error) {
      console.error("Error generando PDF:", error);
      throw error;
    }
  };

  // ✅ Manejador principal de descarga
  const handleDownload = async () => {
    if (!data?._id) {
      console.warn("No hay datos para descargar");
      return;
    }

    setIsLoadingPdf(true);

    try {
      console.log("Iniciando descarga para:", data?.numeroCertificado);

      if (isMobile) {
        console.log("Descarga móvil - Generando PDF...");
        await downloadPdfMobile();
      } else {
        console.log("Descarga desktop - Abriendo diálogo de impresión...");

        // ✅ Llamar al método del componente hijo
        if (desktopViewRef.current) {
          desktopViewRef.current.printIframe();
        } else {
          throw new Error("La vista desktop no está disponible");
        }
      }

      console.log("Descarga completada exitosamente");
    } catch (err) {
      console.error("Error al descargar:", err);
      alert(
        `Error al descargar el certificado: ${err instanceof Error ? err.message : "Error desconocido"}`,
      );
    } finally {
      setTimeout(
        () => {
          setIsLoadingPdf(false);
        },
        isMobile ? 1000 : 500,
      );
    }
  };

  // ✅ Renderizado condicional
  if (isMobile) {
    return (
      <CertificadoMobileView
        data={data}
        srcDoc={srcDoc}
        loading={loading}
        error={error}
        isLoadingPdf={isLoadingPdf}
        onDownload={handleDownload}
      />
    );
  }

  return (
    <CertificadoDesktopView
      ref={desktopViewRef} // ✅ Pasar la ref
      data={data}
      srcDoc={srcDoc}
      loading={loading}
      error={error}
      isLoadingPdf={isLoadingPdf}
      onDownload={handleDownload}
    />
  );
}
