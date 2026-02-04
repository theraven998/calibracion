import { useCallback, useState } from "react";
import Data, { type DataEquipment } from "@/components/Equipo/Data";
import CertificateModalTensiometro from "./components/CertificateModal";
import { useSelection } from "@/context/SelectionContext";
import TensiometroPressureTable, {
  type TensiometroPressureRow,
} from "./components/TensiometroPressureTable";

export default function Tensiometros() {
  const [isUploading, setIsUploading] = useState(false);
  const handleUpload = async () => {};

  const [showCert, setShowCert] = useState(false);
  const [equipmentData, setEquipmentData] = useState<DataEquipment | null>(
    null
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

  const { selectedCenter, selectedMetrologist } = useSelection();

  const handleDataChange = useCallback((newData: DataEquipment) => {
    setEquipmentData(newData);
  }, []);

  const handleRowsChange = useCallback((newRows: PressureRow[]) => {
    setRows(newRows);
  }, []);

  const clientInfo = {
    solicitante: "—",
    direccion: "—",
    fechaCalibracion: new Date().toLocaleDateString(),
  };

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
          equipmentData={equipmentData}
          rows={rows}
          clientData={clientInfo}
          selectedCenter={selectedCenter}
          selectedMetrologist={selectedMetrologist}
          onClose={() => setShowCert(false)}
        />
      )}
    </div>
  );
}
