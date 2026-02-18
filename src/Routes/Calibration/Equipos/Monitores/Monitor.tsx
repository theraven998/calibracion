import NibpTable, { type NibpData } from "./components/NIBPTable";
import Spo2Table, { type Spo2Data } from "./components/SPO2Table";
import EcgTable, { type EcgData } from "./components/ECGTable";
import RespiracionTable, {
  type RespiracionData,
} from "./components/RESPIRACIONTable";
import Data, { type DataEquipment } from "@/components/Equipo/Data";
import { useCallback, useEffect, useState } from "react";
import { CertificateModal } from "./components/CertificateModal";
import { useSelection } from "@/context/SelectionContext";
import url from "@/constants/url.json";

interface ClientData {
  name: string;
  address: string;
  fechaCalibracion: string;
}

export default function Monitores() {
  const [isUploading, setIsUploading] = useState(false);
  const {
    selectedCenter,
    selectedMetrologist,
    selectedVisit,
    selectedPatron,
    selectedId,
    selectedRevisor,
  } = useSelection();
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [showCert, setShowCert] = useState(false);

  // Estados para cada tabla
  const [nibpData, setNibpData] = useState<NibpData | null>(null);
  const [spo2Data, setSpo2Data] = useState<Spo2Data | null>(null);
  const [ecgData, setEcgData] = useState<EcgData | null>(null);
  const [respiracionData, setRespiracionData] =
    useState<RespiracionData | null>(null);
  const [equipmentData, setEquipmentData] = useState<DataEquipment | null>(
    null,
  );

  const handleUpload = async () => {
    console.log("INTENTANDO SUBIR", selectedPatron);
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
    if (!nibpData) {
      alert("Faltan datos de NIBP.");
      return;
    }
    if (!spo2Data) {
      alert("Faltan datos de SPO2.");
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
        nombreCarpetaPadre: "Monitores de Signos Vitales",
        equipo: "Monitor de Signos Vitales",
        template: { tipo: "monitor-multiparametro" },
        numeroCertificado: equipmentData.certificado,
        marca: equipmentData.marca,
        modelo: equipmentData.modelo,
        serie: equipmentData.serie,
        patron: selectedPatron,
        areaEquipo: equipmentData.ubicacion,
        fechaCalibracion: new Date().toISOString(),
        nombre: `Certificado de Calibración - Monitor (${equipmentData.marca} ${equipmentData.modelo})`,
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
          nibp: nibpData,
          spo2: spo2Data,
          ecg: ecgData,
          respiracion: respiracionData,
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
          "noopener,noreferrer",
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

  const handleNibpChange = useCallback((newData: NibpData) => {
    setNibpData(newData);
  }, []);

  const handleSpo2Change = useCallback((newData: Spo2Data) => {
    setSpo2Data(newData);
  }, []);

  const handleEcgChange = useCallback((newData: EcgData) => {
    setEcgData(newData);
  }, []);

  const handleRespiracionChange = useCallback((newData: RespiracionData) => {
    setRespiracionData(newData);
  }, []);

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
    console.log("Datos recibidos en Monitores.tsx:", newData);
  }, []);

  return (
    <div className="calibration-entry-container">
      <Data onDataChange={handleDataChange} />

      <section className="data-grid-section full-width">
        <h2>2. Presión Arterial No Invasiva (NIBP)</h2>
        <NibpTable onDataChange={handleNibpChange} />
      </section>

      <section className="data-grid-section full-width">
        <h2>3. Saturación de Oxígeno (SPO2)</h2>
        <Spo2Table onDataChange={handleSpo2Change} />
      </section>

      <section className="data-grid-section full-width">
        <h2>4. Electrocardiograma (ECG)</h2>
        <EcgTable onDataChange={handleEcgChange} />
      </section>

      <section className="data-grid-section full-width">
        <h2>5. Respiración</h2>
        <RespiracionTable onDataChange={handleRespiracionChange} />
      </section>

      <div className="form-footer">
        <div
          className="results-summary"
          style={{ fontSize: "0.9rem", display: "block" }}
        >
          <p>
            Error Prom NIBP Sistólica:{" "}
            {nibpData?.sistolica.errorPromedio ?? "-"}
          </p>
          <p>
            Error Prom NIBP Diastólica:{" "}
            {nibpData?.diastolica.errorPromedio ?? "-"}
          </p>
          <p>Error Prom SPO2: {spo2Data?.errorPromedio ?? "-"}</p>
        </div>
        <button
          className="btn-highlight"
          onClick={() => {
            setNibpData(null);
            setSpo2Data(null);
            setEcgData(null);
            setRespiracionData(null);
          }}
        >
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
          nibpData={nibpData}
          spo2Data={spo2Data}
          ecgData={ecgData}
          respiracionData={respiracionData}
          selectedCenter={selectedCenter}
          selectedMetrologist={selectedMetrologist}
          onClose={() => setShowCert(false)}
        />
      )}
    </div>
  );
}
