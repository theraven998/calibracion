// src/services/api.ts
import url from "@/constants/url.json";
// Definimos la interfaz basada en lo que devuelve tu Python API
export interface Center {
  id: string; // Asegúrate que tu DB tenga este campo o mapea '_id' a string
  name: string; // O 'nombre' según tu DB
  address: string; // O 'direccion' según tu DB
  tempMin?: string; // Agrega aquí cualquier otro campo que venga de tu API Python
  tempMax?: string;
  humidityMin?: string;
  humidityMax?: string;
  barometricPressure?: string;
  visits?: number;
  hospitalId?: string;
}
export interface Patron {
  _id: string;
  equipo: string;
  marca: string;
  modelo: string;
  serie: string;
  noCertificado: string;
  rango: string;
  resolucion: string;
  fechaCalibracion: string;
  proximaCalibracion: string;
  calibradoPor: string;
  estado: string;
  createdAt: string;
  targets: string[];
}

export interface Metrologo {
  id: string;
  nombre: string;
  urlfirma: string;
  tipo: string;
}
export const fetchCenters = async (): Promise<Center[]> => {
  try {
    const response = await fetch(`${url.url}/centros`);
    if (!response.ok) {
      throw new Error("Error al obtener centros");
    }
    const data = await response.json();
    console.log("Centers fetched:", data);
    return data;
  } catch (error) {
    console.error("Error fetching centers:", error);
    return []; // Retorna array vacío en caso de error para no romper la UI
  }
};

export const fetchPatrones = async (): Promise<Patron[]> => {
  try {
    const response = await fetch(`${url.url}/patrones`);
    if (!response.ok) {
      throw new Error("Error al obtener patrones");
    }
    const data = await response.json();
    console.log("Patrones fetched:", data);
    return data;
  } catch (error) {
    console.error("Error fetching patrones:", error);
    return []; // Retorna array vacío en caso de error para no romper la UI
  }
};

export const fetchMetrologos = async (): Promise<Metrologo[]> => {
  try {
    const response = await fetch(`${url.url}/metrologos`);
    if (!response.ok) {
      throw new Error("Error al obtener metrólogos");
    }
    const data = await response.json();
    console.log("Metrologos fetched:", data);
    return data;
  } catch (error) {
    console.error("Error fetching metrologos:", error);
    return []; // Retorna array vacío en caso de error para no romper la UI
  }
};
