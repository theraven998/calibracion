import React, { useEffect, useRef, useState } from "react";
import { Plus, FileText, Building2, Folder } from "lucide-react";
import "./Manage.css";
import url from "@/constants/url.json";
import { EQUIPMENT_OPTIONS } from "@/constants/equipment";
type TabType = "centro" | "visita" | "equipo";

type Folder = {
  _id: string;
  tipo?: "centro" | "visita" | "tipo_equipo";
  nombreCarpeta: string;
  centroSalud?: { nombre?: string };
  totales?: { certificados?: number; ultimoCertificadoEn?: string | null };
  fechaVisita?: string; // si la tienes en el doc visita
  idCarpetaPadre?: string;
  numeroCertificados?: number;
};
interface CentroSalud {
  hospitalId: string;
  name: string;
  address: string;
  city: string;
  department: string;
  tempMin: string;
  tempMax: string;
  humidityMin: string;
  humidityMax: string;
  barometricPressure: string;
  status: string;
}
interface Visita {
  nombreCarpeta: string;
  fechaVisita: string;
  numero: number;
  hospitalId: string;
}

interface TipoEquipo {
  nombreCarpeta: string;
  tipoEquipo: string;
  numeroCertificados: number;
  hospitalId: string;
}

export default function Manage() {
  const endpointFolders = `${url.url}/folders`;
  const endpointCreateCentro = `${url.url}/create/centro`;
  const equipmentRef = useRef<HTMLLabelElement>(null);
  const [isEquipoOpen, setIsEquipoOpen] = useState(false);
  const [centros, setCentros] = useState<Folder[]>([]);
  const [visitas, setVisitas] = useState<Folder[]>([]);
  const [loadingCentros, setLoadingCentros] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("centro");
  const [centroData, setCentroData] = useState<Partial<CentroSalud>>({
    hospitalId: "cs_test",
    name: "Centro de Salud TEST",
    address: "Calle Principal 123",
    city: "La Paz",
    department: "La Paz",
    tempMin: "18",
    tempMax: "24",
    humidityMin: "40",
    humidityMax: "60",
    barometricPressure: "760",
    status: "activo",
  });
  const [visitaData, setVisitaData] = useState<Partial<Visita>>({});
  const [equipoData, setEquipoData] = useState<Partial<TipoEquipo>>({});

  async function fetchJson<T>(input: string): Promise<T> {
    const res = await fetch(input, {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "include",
    });
    if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
    return (await res.json()) as T;
  }

  async function cargarCentros() {
    setLoadingCentros(true);
    setError(null);
    try {
      // Raíz => centros
      const data = await fetchJson<Folder[]>(endpointFolders);
      // Si el backend ya filtra raíz por idCarpetaPadre=null, acá solo filtramos por tipo por seguridad
      setCentros(
        (Array.isArray(data) ? data : []).filter(
          (x) => x.tipo === "centro" || !x.tipo,
        ),
      );
      setVisitas(
        (Array.isArray(data) ? data : []).filter((x) => x.tipo === "visita"),
      );
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? String(e));
      setCentros([]);
      setVisitas([]);
    } finally {
      setLoadingCentros(false);
    }
  }

  const handleCreateCentro = async () => {
    try {
      const res = await fetch(endpointCreateCentro, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...centroData,
        }),
      });
      if (!res.ok) {
        throw new Error(`Error al crear centro: ${res.statusText}`);
      }
      cargarCentros();
      alert("Centro de salud creado exitosamente.");
    } catch (error: any) {
      console.error("Error creando centro de salud:", error);
      alert(
        `Error creando centro de salud: ${error?.message ?? String(error)}`,
      );
    }
  };

  const handleCreateVisita = async () => {
    // Implementation here
  };

  const handleCreateEquipo = async () => {
    // Implementation here
  };
  useEffect(() => {
    cargarCentros();
  }, []);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (equipmentRef.current && !equipmentRef.current.contains(target)) {
        setIsEquipoOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Handlers ---

  const handleSelectEquipo = (title: string) => {
    setEquipoData({ ...equipoData, tipoEquipo: title });
    // Usar setTimeout para asegurar que el estado se actualice después del render
    setTimeout(() => setIsEquipoOpen(false), 0);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (equipmentRef.current && !equipmentRef.current.contains(target)) {
        setIsEquipoOpen(false);
      }
    }

    if (isEquipoOpen) {
      // Solo agregar listener cuando esté abierto
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isEquipoOpen]); // AGREGAR DEPENDENCIA
  useEffect(() => {
    console.log(visitaData);
  }, [visitaData]);
  return (
    <div className="app">
      <div className="manage-container">
        <div className="manage-header">
          <h1>Gestionar Base de Datos</h1>
          <p className="muted">
            Administra centros de salud, visitas y equipos
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="tab-navigation">
          <button
            onClick={() => setActiveTab("centro")}
            className={`tab-button ${activeTab === "centro" ? "active" : ""}`}
          >
            <Building2 size={20} />
            <span>Centro de Salud</span>
          </button>
          <button
            onClick={() => setActiveTab("visita")}
            className={`tab-button ${activeTab === "visita" ? "active" : ""}`}
          >
            <FileText size={20} />
            <span>Visita</span>
          </button>
          <button
            onClick={() => setActiveTab("equipo")}
            className={`tab-button ${activeTab === "equipo" ? "active" : ""}`}
          >
            <Folder size={20} />
            <span>Tipo de Equipo</span>
          </button>
        </div>

        {/* Form Content */}
        <div className="form-card">
          {activeTab === "centro" && (
            <div className="form">
              <h2>Crear Centro de Salud</h2>

              <div className="form-grid">
                <label>
                  <span className="label-text">Hospital ID</span>
                  <input
                    type="text"
                    placeholder=" Ej: cs_quipama "
                    value={centroData.hospitalId || ""}
                    onChange={(e) =>
                      setCentroData({
                        ...centroData,
                        hospitalId: e.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  <span className="label-text">Nombre</span>
                  <input
                    type="text"
                    placeholder="Nombre del centro"
                    value={centroData.name || ""}
                    onChange={(e) =>
                      setCentroData({ ...centroData, name: e.target.value })
                    }
                  />
                </label>

                <label>
                  <span className="label-text">Dirección</span>
                  <input
                    type="text"
                    placeholder="Dirección completa"
                    value={centroData.address || ""}
                    onChange={(e) =>
                      setCentroData({ ...centroData, address: e.target.value })
                    }
                  />
                </label>

                <label>
                  <span className="label-text">Ciudad</span>
                  <input
                    type="text"
                    placeholder="Ciudad"
                    value={centroData.city || ""}
                    onChange={(e) =>
                      setCentroData({ ...centroData, city: e.target.value })
                    }
                  />
                </label>

                <label>
                  <span className="label-text">Departamento</span>
                  <input
                    type="text"
                    placeholder="Departamento"
                    value={centroData.department || ""}
                    onChange={(e) =>
                      setCentroData({
                        ...centroData,
                        department: e.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  <span className="label-text">Temperatura Mínima (°C)</span>
                  <input
                    type="text"
                    placeholder="Ej: 18"
                    value={centroData.tempMin || ""}
                    onChange={(e) =>
                      setCentroData({ ...centroData, tempMin: e.target.value })
                    }
                  />
                </label>

                <label>
                  <span className="label-text">Temperatura Máxima (°C)</span>
                  <input
                    type="text"
                    placeholder="Ej: 24"
                    value={centroData.tempMax || ""}
                    onChange={(e) =>
                      setCentroData({ ...centroData, tempMax: e.target.value })
                    }
                  />
                </label>

                <label>
                  <span className="label-text">Humedad Mínima (%)</span>
                  <input
                    type="text"
                    placeholder="Ej: 40"
                    value={centroData.humidityMin || ""}
                    onChange={(e) =>
                      setCentroData({
                        ...centroData,
                        humidityMin: e.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  <span className="label-text">Humedad Máxima (%)</span>
                  <input
                    type="text"
                    placeholder="Ej: 60"
                    value={centroData.humidityMax || ""}
                    onChange={(e) =>
                      setCentroData({
                        ...centroData,
                        humidityMax: e.target.value,
                      })
                    }
                  />
                </label>

                <label className="full-width">
                  <span className="label-text">Presión Barométrica (mmHg)</span>
                  <input
                    type="text"
                    placeholder="Ej: 760"
                    value={centroData.barometricPressure || ""}
                    onChange={(e) =>
                      setCentroData({
                        ...centroData,
                        barometricPressure: e.target.value,
                      })
                    }
                  />
                </label>
              </div>

              <div className="actions">
                <button
                  onClick={handleCreateCentro}
                  className="btn btn-primary"
                >
                  <Plus size={20} />
                  Crear Centro de Salud
                </button>
              </div>
            </div>
          )}

          {activeTab === "visita" && (
            <div className="form">
              <h2>Crear Visita</h2>

              <div className="form-grid">
                <label>
                  <span className="label-text">Nombre de Carpeta</span>
                  <input
                    type="text"
                    placeholder="Nombre identificador"
                    onChange={(e) =>
                      setVisitaData({
                        ...visitaData,
                        nombreCarpeta: e.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  <span className="label-text">Centro de Salud</span>
                  <select
                    onChange={(e) =>
                      setVisitaData({
                        ...visitaData,
                        hospitalId: e.target.value,
                      })
                    }
                  >
                    <option value="">Seleccione un centro</option>
                    {centros.map((centro) => (
                      <option key={centro._id} value={centro._id}>
                        {centro.nombreCarpeta}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="label-text">Fecha inicio de Visita</span>
                  <input
                    type="date"
                    onChange={(e) =>
                      setVisitaData({
                        ...visitaData,
                        fechaVisita: e.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  <span className="label-text">Número de Visita</span>
                  <input
                    type="number"
                    placeholder="Número consecutivo"
                    onChange={(e) =>
                      setVisitaData({
                        ...visitaData,
                        numero: parseInt(e.target.value),
                      })
                    }
                  />
                </label>
              </div>

              <div className="actions">
                <button
                  onClick={handleCreateVisita}
                  className="btn btn-success"
                >
                  <Plus size={20} />
                  Crear Visita
                </button>
              </div>
            </div>
          )}

          {activeTab === "equipo" && (
            <div className="form">
              <h2>Crear Tipo de Equipo</h2>

              <div className="form-grid">
                <label className="label-equipo" ref={equipmentRef}>
                  <span className="label-text">Tipo de Equipo</span>
                  <button
                    type="button"
                    className="btn-toggle"
                    onClick={() => setIsEquipoOpen(!isEquipoOpen)}
                  >
                    {equipoData.tipoEquipo || "Seleccione un tipo"}
                  </button>
                  {isEquipoOpen && (
                    <div className="text-picker-container">
                      <div className="text-picker-menu">
                        <div
                          className="picker-scroll"
                          style={{ maxHeight: "200px", overflowY: "auto" }}
                        >
                          {EQUIPMENT_OPTIONS.map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              className={`picker-option ${
                                equipoData.tipoEquipo === opt.title
                                  ? "selected"
                                  : ""
                              }`}
                              onClick={(e) => {
                                e.stopPropagation(); // AGREGAR ESTO
                                handleSelectEquipo(opt.title); // CAMBIAR opt.id por opt.title
                              }}
                            >
                              {opt.title}
                              {equipoData.tipoEquipo === opt.title && (
                                <span className="check">✓</span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </label>

                <label>
                  <span className="label-text">Centro de Salud</span>
                  <select
                    onChange={(e) =>
                      setEquipoData({
                        ...equipoData,
                        hospitalId: e.target.value,
                      })
                    }
                  >
                    <option value="">Seleccione un centro</option>
                    {centros.map((centro) => (
                      <option key={centro._id} value={centro._id}>
                        {centro.nombreCarpeta}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="label-text">Seleccionar Visita</span>
                  <select
                    onChange={(e) =>
                      setEquipoData({
                        ...equipoData,
                        numeroCertificados: parseInt(e.target.value),
                      })
                    }
                  >
                    <option value="">Seleccione una visita</option>
                    {visitas
                      .filter(
                        (visita) =>
                          visita.idCarpetaPadre === equipoData.hospitalId,
                      )
                      .map((visita) => (
                        <option
                          key={visita._id}
                          value={visita.numeroCertificados}
                        >
                          {visita.nombreCarpeta}
                        </option>
                      ))}
                  </select>
                </label>
              </div>

              <div className="actions">
                <button onClick={handleCreateEquipo} className="btn btn-accent">
                  <Plus size={20} />
                  Crear Tipo de Equipo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
