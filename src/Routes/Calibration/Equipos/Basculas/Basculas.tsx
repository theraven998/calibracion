import "./Basculas.css";
import CalibrationTable, {
  type CalibrationRow,
} from "./components/CalibrationTable";
import ExcentricidadTable, {
  type ExcentricidadResult,
} from "./components/ExcentricidadTable";
import Data, { type DataEquipment } from "@/components/Equipo/Data";
import { useCallback, useEffect, useState } from "react";
import { CertificateModal } from "@/Routes/Calibration/Equipos/Basculas/components/CertificateModal"; // Importa el modal
import { useSelection } from "@/context/SelectionContext"; // Importa el context
import url from "@/constants/url.json";
export interface ColumnDefinition {
  header: string;
  accessor: string;
  type: "input" | "readOnly" | "status";
  width?: string;
  step?: string;
}
interface ClientData {
  name: string;
  address: string;
  fechaCalibracion: string;
}
export default function Basculas() {
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
    if (!calibrationData?.length) {
      alert("Faltan datos de exactitud.");
      return;
    }
    if (!excentricidadData?.length) {
      alert("Faltan datos de excentricidad.");
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
        nombreCarpetaPadre: "Basculas de piso",
        equipo: "Báscula de Piso",
        template: { tipo: "bascula" },
        numeroCertificado: equipmentData.certificado, // o donde lo generes
        marca: equipmentData.marca,
        modelo: equipmentData.modelo,
        serie: equipmentData.serie,
        patron: selectedPatron,
        areaEquipo: equipmentData.ubicacion,
        fechaCalibracion: new Date().toISOString(),
        nombre: `Certificado de Calibración - Báscula (${equipmentData.marca} ${equipmentData.modelo})`,
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
          exactitud: calibrationData,
          excentricidad: excentricidadData,
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

      const created = await res.json(); // debería incluir _id
      const newId = created?._id;

      // 4) Abre el certificado creado (misma URL siempre)
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

  const [showCert, setShowCert] = useState(false);
  const [excentricidadData, setExcentricidadData] = useState<
    ExcentricidadResult[]
  >([]);
  const handleExcentricidadChange = useCallback(
    (newData: ExcentricidadResult[]) => {
      setExcentricidadData(newData);
    },
    []
  );
  const [calibrationData, setCalibrationData] = useState<CalibrationRow[]>([]);
  const handleCalibrationChange = useCallback((newData: CalibrationRow[]) => {
    setCalibrationData(newData);
  }, []);
  const [equipmentData, setEquipmentData] = useState<DataEquipment | null>(
    null
  );

  // Obtén el centro y metrólogo seleccionados del contexto
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

  return (
    <div className="calibration-entry-container">
      <Data onDataChange={handleDataChange} />

      <section className="data-grid-section full-width">
        <h2>2. Prueba de Exactitud</h2>
        <CalibrationTable onDataChange={handleCalibrationChange} />
      </section>
      <ExcentricidadTable onDataChange={handleExcentricidadChange} />
      {/* 5. Footer y Resumen Rápido */}
      <div className="form-footer">
        <div
          className="results-summary"
          style={{ fontSize: "0.9rem", display: "block" }}
        >
          <p>Temp Int Error Prom: </p>
          <p>Temp Ext Error Prom: </p>
          <p>Humedad Error Prom: </p>
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

      {/* Modal con ambas páginas y PDF */}
      {showCert && (
        <CertificateModal
          clientData={clientData!}
          equipmentData={equipmentData}
          calibrationData={calibrationData}
          excentricidadData={excentricidadData}
          selectedCenter={selectedCenter}
          selectedMetrologist={selectedMetrologist}
          onClose={() => setShowCert(false)}
        />
      )}
    </div>
  );
}
