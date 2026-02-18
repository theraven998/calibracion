import Data, { type DataEquipment } from "@/components/Equipo/Data";
import { useCallback, useEffect, useState } from "react";
import { CertificateModal } from "./components/CertificateModal";
import DesfibriladorTable, {
  type DesfibriladorRow,
} from "./components/DesfibriladorTable";

interface ClientData {
  name: string;
  address: string;
  fechaCalibracion: string;
}

import { useSelection } from "@/context/SelectionContext";
import url from "@/constants/url.json";

export default function Desfibriladores() {
  const {
    selectedCenter,
    selectedMetrologist,
    selectedVisit,
    selectedPatron,
    selectedId,
    selectedRevisor,
  } = useSelection();

  const [showCert, setShowCert] = useState(false);
  const [desfibriladorData, setDesfibriladorData] = useState<
    DesfibriladorRow[]
  >([]);
  const [isUploading, setIsUploading] = useState(false);
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [equipmentData, setEquipmentData] = useState<DataEquipment | null>(
    null,
  );

  useEffect(() => {
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
  }, []);

  const handleDesfibriladorChange = useCallback(
    (newData: DesfibriladorRow[]) => {
      setDesfibriladorData(newData);
    },
    [],
  );

  const handleUpload = async () => {
    if (!equipmentData) {
      alert("Faltan los datos del equipo.");
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
    if (!desfibriladorData?.length) {
      alert("Faltan datos de calibración del desfibrilador.");
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
        nombreCarpetaPadre: "Desfibriladores",
        equipo: "Desfibrilador",
        template: { tipo: "desfibrilador" },
        numeroCertificado: equipmentData.certificado,
        marca: equipmentData.marca,
        modelo: equipmentData.modelo,
        serie: equipmentData.serie,
        patron: selectedPatron,
        areaEquipo: equipmentData.ubicacion,
        fechaCalibracion: new Date().toISOString(),
        nombre: `Certificado de Calibración - Desfibrilador (${equipmentData.marca} ${equipmentData.modelo})`,
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
          desfibrilador: desfibriladorData,
          observacionesMetrologo: equipmentData.observacion || "",
        },
      };

      const endpoint = `${url.url}/certificados`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Error al subir el certificado");
      alert("Certificado subido exitosamente");
      setShowCert(true);
    } catch (error) {
      console.error(error);
      alert("Error al subir el certificado");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="calibration-entry-container">
      <Data onDataChange={handleDataChange} />

      <section className="data-grid-section full-width">
        <h2>2. Calibración de Desfibriladores</h2>
        <DesfibriladorTable onDataChange={handleDesfibriladorChange} />
      </section>

      <div className="form-footer">
        <div
          className="results-summary"
          style={{ fontSize: "0.9rem", display: "block" }}
        >
          <p>Estado de calibración: </p>
        </div>
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

      {showCert && (
        <CertificateModal
          onClose={() => setShowCert(false)}
          equipmentData={equipmentData}
          clientData={clientData}
          selectedCenter={selectedCenter}
          selectedMetrologist={selectedMetrologist}
          desfibriladorData={desfibriladorData}
        />
      )}
    </div>
  );
}
