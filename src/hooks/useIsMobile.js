import { useState, useEffect } from "react";

/**
 * @param {number} breakpoint - The breakpoint value in pixels
 * @returns {boolean} Whether the screen is mobile sized
 */
export const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Verificar si window existe (SSR safe)
    if (typeof window === "undefined") return;

    // Inicializar el estado
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Ejecutar al montar
    checkMobile();

    // Agregar listener para cambios de tamaño
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, [breakpoint]);

  return isMobile;
};
