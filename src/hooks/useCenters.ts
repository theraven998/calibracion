import { useState, useEffect } from 'react';
import { fetchCenters, type Center } from '../services/api';

export const useCenters = () => {
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCenters = async () => {
      try {
        setLoading(true);
        const data = await fetchCenters();
        setCenters(data);
      } catch (err) {
        setError("No se pudieron cargar los centros");
      } finally {
        setLoading(false);
      }
    };

    loadCenters();
  }, []);

  return { centers, loading, error };
};
