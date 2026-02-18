import { useCallback, useEffect, useState } from "react";
import Data, { type DataEquipment } from "@/components/Equipo/Data";
import CertificateModalTensiometro from "./components/CertificateModal";
import { useSelection } from "@/context/SelectionContext";
import TensiometroPressureTable, {
  type TensiometroPressureRow,
} from "./components/TensiometroPressureTable";
import url from "@/constants/url.json";
interface ClientData {
  name: string;
  address: string;
  fechaCalibracion: string;
}
export default function Tensiometros() {
  const [clientData, setClientData] = useState<ClientData | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const {
    selectedCenter,
    selectedMetrologist,
    selectedVisit,
    selectedPatron,
    selectedId,
    selectedRevisor,
  } = useSelection();
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
    if (!rows?.length) {
      alert("Faltan datos de presión.");
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
        nombreCarpetaPadre: "Tensiómetros",
        equipo: "Tensiómetro",
        template: { tipo: "tensiometro" },
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
          presiones: rows,
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
  const [showCert, setShowCert] = useState(false);
  const [equipmentData, setEquipmentData] = useState<DataEquipment | null>(
    null,
  );
  const [rows, setRows] = useState<TensiometroPressureRow[]>([
    { punto: 40, primera: 0, segunda: 0 },
    { punto: 60, primera: 0, segunda: 0 },
    { punto: 80, primera: 0, segunda: 0 },
    { punto: 100, primera: 0, segunda: 0 },
    { punto: 120, primera: 0, segunda: 0 },
    { punto: 140, primera: 0, segunda: 0 },
    { punto: 160, primera: 0, segunda: 0 },
    { punto: 180, primera: 0, segunda: 0 },
    { punto: 200, primera: 0, segunda: 0 },
    { punto: 240, primera: 0, segunda: 0 },
    { punto: 280, primera: 0, segunda: 0 },
  ]);

  const handleDataChange = useCallback((newData: DataEquipment) => {
    setEquipmentData(newData);
  }, []);

  const handleRowsChange = useCallback((newRows: PressureRow[]) => {
    setRows(newRows);
  }, []);

  return (
    <div className="calibration-entry-container">
      <Data onDataChange={handleDataChange} />

      {/* Aquí va tu tabla de tensiómetro */}
      <TensiometroPressureTable value={rows} onChange={handleRowsChange} />

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

      {showCert && (
        <CertificateModalTensiometro
          clientData={clientInfo}
          equipmentData={equipmentData}
          rows={rows} // ✅ Cambiar calibrationData por rows
          selectedCenter={selectedCenter}
          selectedMetrologist={selectedMetrologist}
          patronUsed={selectedPatron} // También agregar esto
          onClose={() => setShowCert(false)}
        />
      )}
    </div>
  );
}
