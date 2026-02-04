import "./Termohigrometros.css";
import React, { useState, useCallback, useEffect } from "react";
import Data, { type DataEquipment } from "@/components/Equipo/Data";
import {
  ThermoSection,
  type ThermoSectionResult,
} from "./components/ThermoSection";
import { useSelection } from "@/context/SelectionContext";
import { CertificateModalThermo } from "./components/CertificateModalThermo";
import url from "@/constants/url.json";

interface ClientData {
  name: string;
  address: string;
  fechaCalibracion: string;
}

export default function Termohigrometros() {
  const [isUploading, setIsUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const {
    selectedCenter,
    selectedMetrologist,
    selectedVisit,
    selectedPatron,
    selectedId,
    selectedRevisor,
  } = useSelection();

  const [equipmentData, setEquipmentData] = useState<DataEquipment | null>(
    null,
  );
  const [clientData, setClientData] = useState<ClientData | null>(null);

  // Estados para las 3 secciones
  const [tempInterna, setTempInterna] = useState<ThermoSectionResult | null>(
    null,
  );
  const [tempExterna, setTempExterna] = useState<ThermoSectionResult | null>(
    null,
  );
  const [humedad, setHumedad] = useState<ThermoSectionResult | null>(null);

  // Patrones iniciales
  const PATRONES_TEMP = ["16.64", "20.31", "25.82", "30.92", "35.88", "37.21"];
  const PATRONES_EXT = ["1.75", "2.95", "4.36", "6.98", "8.45", "10.12"];
  const PATRONES_HUM = ["29.8", "50.5", "90.7"];

  // Efecto para actualizar datos del cliente
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
    console.log("Datos recibidos en Termohigrometros.tsx:", newData);
  }, []);

  // Handler de subida - IGUAL QUE BASCULAS
  const handleUpload = async () => {
    console.log("INTENTANDO SUBIR", selectedPatron);
    console.log("selectedId:", selectedId);

    // Validaciones
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
    if (!tempInterna || !tempExterna || !humedad) {
      alert("Faltan datos de las secciones de calibración.");
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
        nombreCarpetaPadre: "Termohigrometros",
        equipo: "Termohigrómetro",
        template: { tipo: "termohigrometro" },
        numeroCertificado: equipmentData.certificado,
        marca: equipmentData.marca,
        modelo: equipmentData.modelo,
        serie: equipmentData.serie,
        patron: selectedPatron,
        areaEquipo: equipmentData.ubicacion,
        fechaCalibracion: new Date().toISOString(),
        nombre: `Certificado de Calibración - Termohigrómetro (${equipmentData.marca} ${equipmentData.modelo})`,
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
          tempInterna: tempInterna,
          tempExterna: tempExterna,
          humedad: humedad,
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

      // Abrir el certificado creado
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

  // Handler para limpiar datos
  const handleClearData = () => {
    setEquipmentData(null);
    setTempInterna(null);
    setTempExterna(null);
    setHumedad(null);
  };

  return (
    <div className="calibration-entry-container">
      {/* 1. Datos Generales */}
      <Data onDataChange={handleDataChange} />

      <div className="full-width" style={{ marginTop: "2rem" }}>
        {/* 2. Sensor Interno */}
        <ThermoSection
          title="Sensor Interno"
          unit="°C"
          initialPatterns={PATRONES_TEMP}
          defaultUncertainty="0.5"
          defaultResolution="0.1"
          onDataChange={setTempInterna}
        />

        {/* 3. Sensor Externo */}
        <ThermoSection
          title="Sensor Externo"
          unit="°C"
          initialPatterns={PATRONES_EXT}
          defaultUncertainty="0.5"
          defaultResolution="0.1"
          onDataChange={setTempExterna}
        />

        {/* 4. Humedad */}
        <ThermoSection
          title="Humedad Relativa"
          unit="% HR"
          initialPatterns={PATRONES_HUM}
          defaultUncertainty="2.8"
          defaultResolution="1"
          onDataChange={setHumedad}
        />

        {/* 5. Footer y Resumen Rápido */}
        <div className="form-footer">
          <div
            className="results-summary"
            style={{ fontSize: "0.9rem", display: "block" }}
          >
            <p>
              Temp Int Error Prom:{" "}
              <strong>{tempInterna?.stats.errorPromedio || "-"}</strong>
            </p>
            <p>
              Temp Ext Error Prom:{" "}
              <strong>{tempExterna?.stats.errorPromedio || "-"}</strong>
            </p>
            <p>
              Humedad Error Prom:{" "}
              <strong>{humedad?.stats.errorPromedio || "-"}</strong>
            </p>
          </div>
          <button className="btn-highlight" onClick={handleClearData}>
            Limpiar Datos
          </button>
          <button
            className="btn-secondary"
            onClick={() => {
              setShowPreview(true);
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
      </div>

      {/* Modal de vista previa */}
      {showPreview && (
        <CertificateModalThermo
          onClose={() => setShowPreview(false)}
          headerData={equipmentData}
          clientData={clientData!}
          selectedCenter={selectedCenter}
          selectedMetrologist={selectedMetrologist}
          equipmentData={equipmentData}
          tempInterna={tempInterna}
          tempExterna={tempExterna}
          humedad={humedad}
        />
      )}
    </div>
  );
}
