// src/Routes/Calibration/Equipos/Infrarrojos/Infrarrojos.tsx
// import "./Infrarrojos.css";
import React, { useState, useCallback, useEffect } from "react";
import Data, { type DataEquipment } from "@/components/Equipo/Data";
import {
  TempSection,
  type TempSectionResult,
} from "@/Routes/Calibration/Equipos/Termometros/components/TempSection.tsx";
import { useSelection } from "@/context/SelectionContext";
// import { CertificateModalTermometro } from "./components/CertificateModalTermometro";
import { CertificateModalTermometro } from "./components/CertificateModalInfrarrojo";
import url from "@/constants/url.json";

interface ClientData {
  name: string;
  address: string;
  fechaCalibracion: string;
}

export default function Termometros() {
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

  // Estados para las 2 secciones (solo sensores de temperatura)
  const [sensorInterno, setSensorInterno] = useState<TempSectionResult | null>(
    null,
  );
  const [sensorExterno, setSensorExterno] = useState<TempSectionResult | null>(
    null,
  );

  // Patrones iniciales basados en tus datos
  const PATRONES_INTERNO = [
    "16.80",
    "20.31",
    "25.82",
    "30.92",
    "35.83",
    "37.21",
  ];
  const PATRONES_EXTERNO = ["1.90", "2.87", "4.70", "5.12", "7.15", "9.25"];

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
    console.log("Datos recibidos en Infrarrojos.tsx:", newData);
  }, []);

  // Handler de subida
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
    if (!sensorInterno || !sensorExterno) {
      alert(
        "Faltan datos de las secciones de calibración (sensor interno o externo).",
      );
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
        nombreCarpetaPadre: "Termómetros",
        equipo: "Termómetro",
        template: { tipo: "termometro" },
        numeroCertificado: equipmentData.certificado,
        marca: equipmentData.marca,
        modelo: equipmentData.modelo,
        serie: equipmentData.serie,
        patron: selectedPatron,
        areaEquipo: equipmentData.ubicacion,
        fechaCalibracion: new Date().toISOString(),
        nombre: `Certificado de Calibración - Termómetro(${equipmentData.marca} ${equipmentData.modelo})`,
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
          sensorInterno: sensorInterno,
          sensorExterno: sensorExterno,
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
    setSensorInterno(null);
    setSensorExterno(null);
  };

  return (
    <div className="calibration-entry-container">
      {/* 1. Datos Generales */}
      <Data onDataChange={handleDataChange} />

      <div className="full-width" style={{ marginTop: "2rem" }}>
        {/* 2. Sensor Interno */}

        {/* 3. Sensor Externo */}
        <TempSection
          title="Temperatura - Sensor Interno"
          unit="°C"
          initialPatterns={PATRONES_INTERNO}
          defaultUncertainty="0.5"
          defaultResolution="0.1"
          onDataChange={setSensorInterno}
        />

        <TempSection
          title="Temperatura - Sensor Externo"
          unit="°C"
          initialPatterns={PATRONES_EXTERNO}
          defaultUncertainty="0.5"
          defaultResolution="0.1"
          onDataChange={setSensorExterno}
        />

        {/* 4. Footer y Resumen Rápido */}
        <div className="form-footer">
          <div
            className="results-summary"
            style={{ fontSize: "0.9rem", display: "block" }}
          >
            <p>
              Sensor Interno - Error Promedio:{" "}
              <strong>{sensorInterno?.stats.errorPromedio || "-"}</strong>
            </p>
            <p>
              Sensor Externo - Error Promedio:{" "}
              <strong>{sensorExterno?.stats.errorPromedio || "-"}</strong>
            </p>
            <p>
              Sensor Interno - Desv. Estándar:{" "}
              <strong>{sensorInterno?.stats.desviacionEstandar || "-"}</strong>
            </p>
            <p>
              Sensor Externo - Desv. Estándar:{" "}
              <strong>{sensorExterno?.stats.desviacionEstandar || "-"}</strong>
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
        <CertificateModalTermometro
          onClose={() => setShowPreview(false)}
          isInfrarrojo={false}
          headerData={equipmentData}
          clientData={clientData!}
          selectedCenter={selectedCenter}
          selectedMetrologist={selectedMetrologist}
          equipmentData={equipmentData}
          sensorInterno={sensorInterno}
          sensorExterno={sensorExterno}
        />
      )}
    </div>
  );
}
