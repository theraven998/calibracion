// CertificadoDesktopView.tsx
import { useRef, forwardRef, useImperativeHandle } from "react";

interface Props {
  data: any;
  srcDoc: string;
  loading: boolean;
  error: string | null;
  isLoadingPdf: boolean;
  onDownload: () => void;
}

// ✅ Exponer métodos del componente hijo al padre
export interface CertificadoDesktopViewRef {
  printIframe: () => void;
}

const CertificadoDesktopView = forwardRef<CertificadoDesktopViewRef, Props>(
  ({ data, srcDoc, loading, error, isLoadingPdf, onDownload }, ref) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // ✅ Exponer la función de impresión al componente padre
    useImperativeHandle(ref, () => ({
      printIframe: () => {
        const iframe = iframeRef.current;
        if (!iframe?.contentWindow) {
          throw new Error("No se pudo acceder al iframe");
        }

        const win = iframe.contentWindow;
        const filename = `${data?.numeroCertificado || "certificado"}.pdf`;

        try {
          if (win.document) {
            win.document.title = filename;
          }
          iframe.focus();
          win.focus();
          win.print();
        } catch (e) {
          console.error("Error al imprimir:", e);
          throw e;
        }
      },
    }));

    return (
      <div className="cloudApp">
        <div className="cloudCard">
          <div className="cloudCardHeader">
            <h1>Vista de certificado (v2)</h1>

            <button
              className="downloadBtn"
              disabled={!data?._id || isLoadingPdf || loading}
              onClick={onDownload}
            >
              {isLoadingPdf ? "Generando..." : "📥 Descargar certificado PDF"}
            </button>
          </div>

          {loading && <p className="muted">Cargando…</p>}
          {error && <div className="error">{error}</div>}

          {!loading && !error && srcDoc && (
            <iframe
              ref={iframeRef}
              title={data?.nombre ?? "certificado"}
              srcDoc={srcDoc}
              sandbox="allow-same-origin allow-scripts allow-popups allow-downloads allow-modals"
              className="certificateIframe"
              style={{
                width: "100%",
                height: "85vh",
                border: "1px solid rgba(136, 146, 176, 0.2)",
                borderRadius: 8,
                background: "#fff",
              }}
            />
          )}

          {!loading && !error && !srcDoc && (
            <p className="muted">No hay contenido para mostrar.</p>
          )}
        </div>
      </div>
    );
  },
);

CertificadoDesktopView.displayName = "CertificadoDesktopView";

export default CertificadoDesktopView;
