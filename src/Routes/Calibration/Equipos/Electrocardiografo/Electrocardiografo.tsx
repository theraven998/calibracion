import Data, { type DataEquipment } from "@/components/Equipo/Data";
import { useCallback, useEffect, useState } from "react";
import { CertificateModal } from "./components/CertificateModal";
import ElectrocardiografoTable, {
  type ElectrocardiografoRow,
} from "./components/ElectrocardiografoTable";

interface ClientData {
  name: string;
  address: string;
  fechaCalibracion: string;
}

import { useSelection } from "@/context/SelectionContext";
import url from "@/constants/url.json";

export default function Electrocardiografo() {
  const {
    selectedCenter,
    selectedMetrologist,
    selectedVisit,
    selectedPatron,
    selectedId,
    selectedRevisor,
  } = useSelection();
  
  const [showCert, setShowCert] = useState(false);
  const [electrocardiografoData, setElectrocardiografoData] = useState<ElectrocardiografoRow[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [equipmentData, setEquipmentData] = useState<DataEquipment | null>(null);

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
    console.log("Datos recibidos en Electrocardiografo.tsx:", newData);
  }, []);

  const handleElectrocardiografoChange = useCallback((newData: ElectrocardiografoRow[]) => {
    setElectrocardiografoData(newData);
    console.log("Datos de electrocardiógrafo recibidos:", newData);
  }, []);

  const handleUpload = async () => {
    console.log("INTENTANDO SUBIR ELECTROCARDIÓGRAFO", selectedPatron);
    console.log("selectedId:", selectedId);

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
    if (!electrocardiografoData?.length) {
      alert("Faltan datos de calibración del electrocardiógrafo.");
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
      const payload = {
        visita: selectedVisit,
        nombreCarpetaPadre: "Electrocardiografos",
        equipo: "Electrocardiógrafo",
        template: { tipo: "electrocardiografo" },
        numeroCertificado: equipmentData.certificado,
        marca: equipmentData.marca,
        modelo: equipmentData.modelo,
        serie: equipmentData.serie,
        patron: selectedPatron,
        areaEquipo: equipmentData.ubicacion,
        fechaCalibracion: new Date().toISOString(),
        nombre: `Certificado de Calibración - Electrocardiógrafo (${equipmentData.marca} ${equipmentData.modelo})`,
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
          electrocardiografo: electrocardiografoData,
          observacionesMetrologo: equipmentData.observacion || "",
        },
      };

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
        <h2>2. Pruebas de Calibración</h2>
        <ElectrocardiografoTable onDataChange={handleElectrocardiografoChange} />
      </section>

      <div className="form-footer">
        <button className="btn-highlight" onClick={() => {}}>
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

      {showCert && (
        <CertificateModal
          clientData={clientData!}
          equipmentData={equipmentData}
          selectedCenter={selectedCenter}
          electrocardiografoData={electrocardiografoData}
          selectedMetrologist={selectedMetrologist}
          onClose={() => setShowCert(false)}
        />
      )}
    </div>
  );
}
