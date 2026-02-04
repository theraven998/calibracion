import { useState, useEffect } from "react";
import { Document, Page } from "react-pdf";
import { pdfjs } from "react-pdf";
import html2pdf from "html2pdf.js";

// Configurar worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Props {
  data: any;
  srcDoc: string;
  loading: boolean;
  error: string | null;
  isLoadingPdf: boolean;
  onDownload: () => void;
}

export default function CertificadoMobileView({
  data,
  srcDoc,
  loading,
  error,
  isLoadingPdf,
  onDownload,
}: Props) {
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.0);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(
    window.innerWidth - 32,
  );

  // ✅ Detectar ancho de pantalla dinámicamente
  useEffect(() => {
    const handleResize = () => {
      setContainerWidth(window.innerWidth - 32);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Generar PDF desde HTML
  const generatePdfFromHtml = async (htmlContent: string) => {
    const options = {
      margin: [5, 5, 5, 5], // Reducir márgenes
      filename: `${data?.numeroCertificado || "SinNumero"}.pdf`,
      image: { type: "jpeg", quality: 0.95 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
        compress: true,
      },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] }, // ✅ Evitar páginas en blanco
    };

    try {
      const pdfBlob = await html2pdf()
        .set(options)
        .from(htmlContent)
        .output("blob");

      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
      return url;
    } catch (error) {
      console.error("Error generando PDF:", error);
      return null;
    }
  };

  useEffect(() => {
    if (srcDoc && !pdfUrl && !loading) {
      void generatePdfFromHtml(srcDoc);
    }

    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [srcDoc, loading]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handleMobileDownload = () => {
    if (pdfUrl) {
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = `${data?.numeroCertificado || "SinNumero"}.pdf`;
      link.click();
    }
  };

  return (
    <div className="cloudApp mobile">
      <div className="cloudCard">
        <div className="cloudCardHeader">
          <h1>Vista de certificado</h1>

          {pdfUrl && (
            <div className="pdfControls">
              <button
                className="zoomBtn"
                onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
                disabled={loading}
                aria-label="Reducir zoom"
              >
                −
              </button>
              <span className="zoomLabel">{Math.round(scale * 100)}%</span>
              <button
                className="zoomBtn"
                onClick={() => setScale((s) => Math.min(2.5, s + 0.1))}
                disabled={loading}
                aria-label="Aumentar zoom"
              >
                +
              </button>
            </div>
          )}

          <button
            className="downloadBtn"
            disabled={!pdfUrl || isLoadingPdf}
            onClick={handleMobileDownload}
          >
            {isLoadingPdf ? "Generando..." : "📥 Descargar"}
          </button>
        </div>

        {(loading || !pdfUrl) && (
          <p className="muted">Generando vista previa...</p>
        )}
        {error && <div className="error">{error}</div>}

        {!loading && !error && pdfUrl && (
          <div className="pdfContainer">
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<div className="loadingPdf">Cargando PDF...</div>}
              error={<p className="error">Error al cargar el PDF</p>}
              className="pdfDocument"
            >
              {Array.from(new Array(numPages), (_, index) => (
                <div key={`page_${index + 1}`} className="pageWrapper">
                  <Page
                    pageNumber={index + 1}
                    scale={scale}
                    width={containerWidth} // ✅ Usar ancho dinámico
                    renderTextLayer={false} // ✅ Desactivar para evitar espacios en blanco
                    renderAnnotationLayer={false} // ✅ Desactivar si no son necesarias
                    className="pdfPage"
                  />
                </div>
              ))}
            </Document>

            {numPages > 1 && (
              <div className="pageInfo">
                📄 {numPages} página{numPages > 1 ? "s" : ""}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
