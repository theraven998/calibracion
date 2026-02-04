import { useState, useEffect } from "react";
import { fetchPatrones, type Patron } from "../services/api";

export const usePatrones = () => {
  const [patrones, setPatrones] = useState<Patron[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPatrones = async () => {
      try {
        setLoading(true);
        const data = await fetchPatrones();
        setPatrones(data);
      } catch (err) {
        setError("No se pudieron cargar los patrones");
      } finally {
        setLoading(false);
      }
    };

    loadPatrones();
  }, []);

  return { patrones, loading, error };
};
