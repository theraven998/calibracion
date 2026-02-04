import { useState, useEffect } from "react";
import { fetchMetrologos, type Metrologo } from "../services/api";
import { useSelection } from "@/context/SelectionContext";

export const useMetrologos = () => {
  const [Metrologos, setMetrologos] = useState<Metrologo[]>([]);
  const [Revisores, setRevisores] = useState<Metrologo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { setSelectedRevisor } = useSelection();
  useEffect(() => {
    const loadMetrologos = async () => {
      try {
        setLoading(true);
        const data = await fetchMetrologos();
        setMetrologos(data);
        setRevisores(data.filter((metrologo) => metrologo.tipo === "revisor"));
        setSelectedRevisor(
          data.find((metrologo) => metrologo.tipo === "revisor") || null
        );
      } catch (err) {
        setError("No se pudieron cargar los Metrologos");
      } finally {
        setLoading(false);
      }
    };

    loadMetrologos();
  }, []);

  return { Metrologos, loading, error, Revisores };
};
