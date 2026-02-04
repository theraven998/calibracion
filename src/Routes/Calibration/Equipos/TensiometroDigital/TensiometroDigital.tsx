import Data, { type DataEquipment } from "@/components/Equipo/Data";
import { useCallback, useEffect, useState } from "react";
import ExactitudTable, { type ExactitudRow } from "./components/ExactitudTable";
import { CertificateModal } from "./components/CertitificateModal";
import url from "@/constants/url.json";
interface ClientData {
  name: string;
  address: string;
  fechaCalibracion: string;
}
import { useSelection } from "@/context/SelectionContext"; // Importa el context

export default function TensiometroDigital() {
  const {
    selectedCenter,
    selectedMetrologist,
    selectedPatron,
    selectedVisit,
    selectedRevisor,
    selectedId,
  } = useSelection();
  const [exactitudData, setExactitudData] = useState<ExactitudRow[]>([]);
  const [showCert, setShowCert] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [equipmentData, setEquipmentData] = useState<DataEquipment | null>(
    null
  );
  useEffect(() => {
    console.log("Centro seleccionado:", selectedCenter);
    if (selectedCenter) {
      const now = new Date();
      const fechaCalibracion = now
        .toLocaleDateString("es-ES", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
        .replace(/ de (\d{4})$/, " del $1");
      setClientData({
        name: selectedCenter.name,
        address: selectedCenter.address,
        fechaCalibracion,
      });
    }
  }, [selectedCenter]);

  const handleDataChange = useCallback((newData: DataEquipment) => {
    setEquipmentData(newData);
    console.log("Datos recibidos en Basculas.tsx:", newData);
  }, []);
  const handleExactitudChange = useCallback((newData: ExactitudRow[]) => {
    setExactitudData(newData);
  }, []);
  const handleUpload = async () => {
    console.log("INTENTANDO SUBIR TENSIÓMETRO", selectedPatron);
    console.log("selectedId:", selectedId);

    // 1. Validaciones
    if (!equipmentData) {
      alert("Faltan los datos del equipo (sección Data).");
      return;
    }
    if (!selectedPatron) {
      alert("Selecciona un patrón antes de generar.");
      return;
    }
    if (!selectedVisit) {
      alert("Selecciona una visita antes de generar.");
      return;
    }
    if (!exactitudData?.length) {
      alert("Faltan datos de la prueba de exactitud.");
      return;
    }
    if (!selectedCenter?.hospitalId) {
      alert("Selecciona un centro antes de generar.");
      return;
    }
    if (!selectedMetrologist?.id) {
      alert("Selecciona un metrólogo antes de generar.");
      return;
    }

    setIsUploading(true);
    try {
      // 2. Construcción del payload
      const payload = {
        visita: selectedVisit,
        nombreCarpetaPadre: "Tensiometros Digitales", // Carpeta específica
        equipo: "Tensiómetro Digital",
        template: { tipo: "tensiometro-digital" },
        numeroCertificado: equipmentData.certificado,
        marca: equipmentData.marca,
        modelo: equipmentData.modelo,
        serie: equipmentData.serie,
        patron: selectedPatron,
        areaEquipo: equipmentData.ubicacion,
        fechaCalibracion: new Date().toISOString(),
        nombre: `Certificado de Calibración - Tensiómetro (${equipmentData.marca} ${equipmentData.modelo})`,
        centerId: selectedCenter.hospitalId,
        metrologist: selectedMetrologist,
        revisor: selectedRevisor,
        data: {
          header: {
            ...equipmentData,
            certificado: equipmentData.certificado,
            ubicacion: equipmentData.ubicacion,
            clientData: clientData,
          },
          // Aquí enviamos la tabla de exactitud (Sistólica/Diastólica)
          exactitud: exactitudData,
          observacionesMetrologo: equipmentData.observacion || "",
        },
      };

      // 3. Envío al backend
      const endpoint = `${url.url}/certificados`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let msg = `Error HTTP ${res.status}`;
        try {
          const err = await res.json();
          msg = err?.error ?? msg;
        } catch {}
        throw new Error(msg);
      }

      const created = await res.json();
      const newId = created?._id;

      // 4. Abrir certificado generado
      if (newId) {
        window.open(
          `/view/${encodeURIComponent(newId)}`,
          "_blank",
          "noopener,noreferrer"
        );
      } else {
        alert("Creado, pero la API no devolvió _id.");
      }
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "Error subiendo certificado");
    } finally {
      setIsUploading(false);
    }
  };
  return (
    <div className="calibration-entry-container">
      <Data onDataChange={handleDataChange} />

      <section className="data-grid-section full-width">
        <h2>2. Prueba de Exactitud</h2>
        <ExactitudTable onDataChange={handleExactitudChange} />
      </section>
      {/* 5. Footer y Resumen Rápido */}
      <div className="form-footer">
        <button className="btn-highlight" onClick={() => {}}>
          {" "}
          Limpiar Datos
        </button>
        <button
          className="btn-secondary"
          onClick={() => {
            setShowCert(true);
          }}
        >
          🖨️ Vista Previa de Certificado
        </button>
        <button
          className="btn-highlight"
          onClick={handleUpload}
          disabled={isUploading}
        >
          {isUploading ? "Generando..." : "☁️ Generar y Subir Certificado"}
        </button>
      </div>

      {/* Modal con ambas páginas y PDF */}
      {showCert && (
        <CertificateModal
          clientData={clientData!}
          equipmentData={equipmentData}
          exactitudData={exactitudData}
          selectedCenter={selectedCenter}
          selectedMetrologist={selectedMetrologist}
          onClose={() => setShowCert(false)}
        />
      )}
    </div>
  );
}
