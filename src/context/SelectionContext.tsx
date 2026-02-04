import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { type EquipmentId } from "@/constants/equipment";
import type { Center, Metrologo, Patron } from "@/services/api";
import { usePatrones } from "@/hooks/usePatrones";

interface SelectionContextType {
  selectedId: EquipmentId;
  setSelectedId: (id: EquipmentId) => void;

  selectedCenter: Center | null;
  setSelectedCenter: (center: Center | null) => void;

  selectedMetrologist: Metrologo | null;
  setSelectedMetrologist: (metrologist: Metrologo | null) => void;

  selectedVisit: number | null;
  setSelectedVisit: (visit: number | null) => void;

  selectedRevisor: Metrologo | null;
  setSelectedRevisor: (revisor: Metrologo | null) => void;

  // Patron auto + override opcional
  selectedPatron: Patron | null;
  setSelectedPatron: (patron: Patron | null) => void;
}

const SelectionContext = createContext<SelectionContextType | undefined>(
  undefined
);

function normalizeTipo(tipo: unknown) {
  return (tipo ?? "").toString().toLowerCase().trim();
}

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [selectedId, setSelectedId] = useState<EquipmentId>(null as any);
  const [selectedVisit, setSelectedVisit] = useState<number | null>(null);
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
  const [selectedMetrologist, setSelectedMetrologist] =
    useState<Metrologo | null>(null);
  const [selectedRevisor, setSelectedRevisor] = useState<Metrologo | null>(
    null
  );
  // 1) Patrones cargados desde API (debe ser "global")
  const { patrones } = usePatrones();
  // 2) Override manual opcional (si el usuario cambia patrón a mano)
  const [patronOverride, setPatronOverride] = useState<Patron | null>(null);

  // 3) Patron automático derivado
  const autoPatron = useMemo(() => {
    const tipoNorm = normalizeTipo(selectedId);
    if (!tipoNorm) return null;
    if (!Array.isArray(patrones) || patrones.length === 0) return null;
    return (
      patrones.find((p) => {
        console.log("Evaluando patron:", tipoNorm, "con tipos:", p.targets);
        if (!Array.isArray(p.targets)) return false;
        console.log(" Comparando con tipo:", tipoNorm);
        return p.targets.some((t) => normalizeTipo(t) === tipoNorm);
      }) ?? null
    );
  }, [patrones, selectedId]);

  // 4) Patron final: si hay override úsalo, si no usa auto
  const selectedPatron = patronOverride ?? autoPatron;
  
  // 5) Cuando 
  // cambie el tipo de equipo, resetea override (para que se auto-actualice)
  // Nota: esto SÍ requiere effect si quieres resetear el override al cambiar selectedId.
  // Si no quieres override, elimina todo lo de patronOverride y no necesitas efecto.
  // (Si lo quieres, te paso el useEffect exacto).
  // Por simplicidad: aquí lo hacemos SIN efecto, reseteando dentro del setter:

  const setSelectedIdWithReset = (id: EquipmentId) => {
    setSelectedId(id);
    setPatronOverride(null);
  };

  const value = useMemo(
    () => ({
      selectedId,
      setSelectedId: setSelectedIdWithReset,
      selectedCenter,
      setSelectedCenter,
      selectedMetrologist,
      setSelectedMetrologist,
      selectedVisit,
      setSelectedVisit,
      selectedRevisor,
      setSelectedRevisor,
      selectedPatron,
      setSelectedPatron: setPatronOverride,
    }),
    [
      selectedId,
      selectedCenter,
      selectedMetrologist,
      selectedVisit,
      selectedRevisor,
      selectedPatron,
    ]
  );

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection() {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error("useSelection debe usarse dentro de un SelectionProvider");
  }
  return context;
}
