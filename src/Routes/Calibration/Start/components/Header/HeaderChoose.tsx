import React, { useState, useEffect, useRef } from "react";
import "./HeaderChoose.css";
import { useSelection, type Metrologist } from "@/context/SelectionContext";
import { EQUIPMENT_OPTIONS } from "@/constants/equipment";
import { useCenters } from "@/hooks/useCenters";
import type { Center } from "@/services/api";
import url from "@/constants/url.json";
import { useMetrologos } from "@/hooks/useMetrologos";
import type { Metrologo } from "@/services/api";

// Actualizamos las props para que acepten los objetos completos o el ID según corresponda
interface HeaderChooseProps {
  onSelect?: (id: string) => void;
  onSelectCenter?: (center: Center) => void;
  onSelectMetrologist?: (metrologist: Metrologist) => void;
}
type Visit = {
  _id: string; // o number, según tu API
  id: number; // o string, según tu API
  numero: number; // número de visita que quieres mostrar
  nombreCarpeta: string;
};
async function fetchVisitsByCenter(centerId: string): Promise<Visit[]> {
  // Aquí llamas a tu API real
  const res = await fetch(`${url.url}/clients/${centerId}/visits`);
  if (!res.ok) throw new Error("Error al obtener visitas");
  return res.json();
}
export default function HeaderChoose({
  onSelect,
  onSelectCenter,
  onSelectMetrologist,
}: HeaderChooseProps) {
  // Consumimos el contexto actualizado
  const {
    selectedId,
    setSelectedId,
    selectedCenter,
    setSelectedCenter,
    selectedMetrologist,
    setSelectedMetrologist,
    selectedVisit,
    setSelectedVisit,
  } = useSelection();

  const { centers, loading, error } = useCenters();
  const { Metrologos } = useMetrologos();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [visitsLoading, setVisitsLoading] = useState(false);
  const [visitsError, setVisitsError] = useState<string | null>(null);
  // Referencias y Estados de UI
  const [isEquipmentOpen, setIsEquipmentOpen] = useState(false);
  const equipmentRef = useRef<HTMLDivElement>(null);

  const [isCenterOpen, setIsCenterOpen] = useState(false);
  const centerRef = useRef<HTMLDivElement>(null);

  const [isMetrologistOpen, setIsMetrologistOpen] = useState(false);
  const metrologistRef = useRef<HTMLDivElement>(null);

  // Cierre automático al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (equipmentRef.current && !equipmentRef.current.contains(target)) {
        setIsEquipmentOpen(false);
      }
      if (centerRef.current && !centerRef.current.contains(target)) {
        setIsCenterOpen(false);
      }
      if (metrologistRef.current && !metrologistRef.current.contains(target)) {
        setIsMetrologistOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectEquipment = (id: string) => {
    setSelectedId(id);
    setIsEquipmentOpen(false);
    if (onSelect) onSelect(id);
  };

  // Ahora recibimos el OBJETO completo del centro
  const handleSelectCenter = (center: Center) => {
    setSelectedCenter(center);
    setSelectedVisit(null); // limpiar visita cuando cambie centro
    setVisits([]); // limpiar visitas actuales
    setIsCenterOpen(false);
    if (onSelectCenter) onSelectCenter(center);
  };

  // Ahora recibimos el OBJETO completo del metrólogo
  const handleSelectMetrologist = (metrologist: Metrologo) => {
    setSelectedMetrologist(metrologist);
    setIsMetrologistOpen(false);
    if (onSelectMetrologist) onSelectMetrologist(metrologist);
  };

  // --- Labels (Optimizados) ---
  useEffect(() => {
    if (!selectedCenter?.id) {
      setVisits([]);
      setVisitsError(null);
      return;
    }

    setVisitsLoading(true);
    setVisitsError(null);

    fetchVisitsByCenter(String(selectedCenter._id))
      .then((data) => {
        setVisits(data);
        // si la visita seleccionada ya no existe, la limpiamos
        if (
          selectedVisit != null &&
          !data.some((v) => v.numero === selectedVisit)
        ) {
          setSelectedVisit(null);
        }
      })
      .catch((err) => {
        console.error(err);
        setVisitsError("Error al cargar visitas");
        setVisits([]);
        setSelectedVisit(null);
      })
      .finally(() => setVisitsLoading(false));
  }, [selectedCenter?.id]);

  // Equipo sigue usando ID, buscamos su label
  const currentEquipmentLabel =
    EQUIPMENT_OPTIONS.find((opt) => opt.id === selectedId)?.title ||
    "Seleccionar Equipo";

  // Centro y Metrólogo: Leemos directo del objeto (Optimización)
  const currentCenterLabel = selectedCenter?.name || "Seleccionar Centro";
  const currentMetrologistLabel =
    selectedMetrologist?.nombre || "Seleccionar Metrólogo";

  return (
    <header className="app-header">
      <div className="header-content">
        {/* --- Equipment Picker --- */}
        <span className="header-label">Equipo: </span>
        <div className="text-picker-container" ref={equipmentRef}>
          <button
            className="text-picker-trigger"
            onClick={() => setIsEquipmentOpen(!isEquipmentOpen)}
            aria-expanded={isEquipmentOpen}
          >
            {currentEquipmentLabel}
            <span className={`chevron ${isEquipmentOpen ? "open" : ""}`}>
              ▼
            </span>
          </button>

          {isEquipmentOpen && (
            <div className="text-picker-menu">
              {/* Contenedor con scroll para listas largas */}
              <div
                className="picker-scroll"
                style={{ maxHeight: "200px", overflowY: "auto" }}
              >
                {EQUIPMENT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    className={`picker-option ${
                      selectedId === opt.id ? "selected" : ""
                    }`}
                    onClick={() => handleSelectEquipment(opt.id)}
                  >
                    {opt.title}
                    {selectedId === opt.id && <span className="check">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* --- Center Picker --- */}
        <span className="header-label">Cliente: </span>
        <div className="text-picker-container" ref={centerRef}>
          <button
            className="text-picker-trigger"
            onClick={() => setIsCenterOpen(!isCenterOpen)}
            aria-expanded={isCenterOpen}
            disabled={loading} // Deshabilitar si carga
          >
            {loading ? "Cargando..." : currentCenterLabel}
            <span className={`chevron ${isCenterOpen ? "open" : ""}`}>▼</span>
          </button>

          {isCenterOpen && !loading && (
            <div className="text-picker-menu">
              {/* Contenedor con scroll para listas largas */}
              <div
                className="picker-scroll"
                style={{ maxHeight: "200px", overflowY: "auto" }}
              >
                {error && <div className="picker-error">Error al cargar</div>}
                {centers.map((center) => (
                  <button
                    key={center.id}
                    className={`picker-option ${
                      selectedCenter?.id === center.id ? "selected" : ""
                    }`}
                    onClick={() => handleSelectCenter(center)}
                  >
                    {center.name} {/* Mostramos nombre, no ID */}
                    {selectedCenter?.id === center.id && (
                      <span className="check">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* --- Metrologist Picker --- */}
        <span className="header-label">Metrólogo: </span>
        <div className="text-picker-container" ref={metrologistRef}>
          <button
            className="text-picker-trigger"
            onClick={() => setIsMetrologistOpen(!isMetrologistOpen)}
            aria-expanded={isMetrologistOpen}
          >
            {currentMetrologistLabel}
            <span className={`chevron ${isMetrologistOpen ? "open" : ""}`}>
              ▼
            </span>
          </button>

          {isMetrologistOpen && (
            <div className="text-picker-menu">
              {Metrologos.map((metro) => (
                <div key={metro.id}>
                  {metro.tipo === "calibrador" && (
                    <button
                      className={`picker-option ${
                        selectedMetrologist?.id === metro.id ? "selected" : ""
                      }`}
                      onClick={() => handleSelectMetrologist(metro)}
                    >
                      {metro.nombre}
                      {selectedMetrologist?.id === metro.id && (
                        <span className="check">✓</span>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <span className="header-label">Visita: </span>
        {visitsLoading ? (
          <span className="visit-loading">Cargando visitas...</span>
        ) : !selectedCenter ? (
          <span className="visit-empty">
            Seleccione un centro para ver visitas
          </span>
        ) : visitsError ? (
          <span className="visit-error">{visitsError}</span>
        ) : visits.length === 0 ? (
          <span className="visit-empty">
            Cliente sin visitas creadas, vea crear una visita
          </span>
        ) : (
          <select
            className="visit-input"
            value={selectedVisit ?? ""}
            onChange={(e) => {
              const selectedVisitId =
                visits.find((visit) => visit.nombreCarpeta === e.target.value)
                  ?._id || null;
              setSelectedVisit(selectedVisitId);
            }}
            aria-label="Número de visita"
          >
            <option value="" disabled>
              Seleccione
            </option>
            {visits.map((visit) => (
              <option key={visit.id} value={visit.nombreCarpeta}>
                {visit.nombreCarpeta}
              </option>
            ))}
          </select>
        )}
      </div>
    </header>
  );
}
