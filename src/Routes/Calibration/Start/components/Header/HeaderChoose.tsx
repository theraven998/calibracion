import React, { useState, useEffect, useRef } from "react";
import "./HeaderChoose.css";
import { useSelection, type Metrologist } from "@/context/SelectionContext";
import { EQUIPMENT_OPTIONS } from "@/constants/equipment";
import { useCenters } from "@/hooks/useCenters";
import type { Center } from "@/services/api";

import { useMetrologos } from "@/hooks/useMetrologos";
import type { Metrologo } from "@/services/api";

// Actualizamos las props para que acepten los objetos completos o el ID según corresponda
interface HeaderChooseProps {
  onSelect?: (id: string) => void;
  onSelectCenter?: (center: Center) => void;
  onSelectMetrologist?: (metrologist: Metrologist) => void;
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

  // --- Handlers ---

  const handleSelectEquipment = (id: string) => {
    setSelectedId(id);
    setIsEquipmentOpen(false);
    if (onSelect) onSelect(id);
  };

  // Ahora recibimos el OBJETO completo del centro
  const handleSelectCenter = (center: Center) => {
    setSelectedCenter(center);
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
        <span className="header-label">Centro de Salud: </span>
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
        <span className="header-label">Visita No.: </span>
        <select
          className="visit-input"
          value={selectedVisit ?? ""}
          onChange={(e) =>
            setSelectedVisit(e.target.value ? Number(e.target.value) : null)
          }
          aria-label="Número de visita"
        >
          <option value="" disabled>
            N° Visita
          </option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
        </select>
      </div>
    </header>
  );
}
