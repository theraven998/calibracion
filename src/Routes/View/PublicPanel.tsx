import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import url from "@/constants/url.json";
import "./PublicPanel.css";

type Visita = {
  _id: string;
  nombreCarpeta: string;
  fechaVisita?: string;
};

type TipoEquipoFolder = {
  _id: string;
  nombreCarpeta: string; // ej: "Basculas de piso", "DEA"
  tipoEquipo?: string; // ej: "bascula", "dea"
};

type Certificado = {
  _id: string;
  numeroCertificado?: string;
  nombre?: string;
  fechaCalibracion?: string;
  equipo?: string;
  marca?: string;
  modelo?: string;
  serie?: string;
  areaEquipo?: string;
  actualizadoEn?: string;
  creadoEn?: string;
};

function goToCertificado(idCertificado: string) {
  const path = `/view/${encodeURIComponent(idCertificado)}`;
  window.open(path, "_blank", "noopener,noreferrer");
}

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

export default function PublicPanel() {
  const { idHospital } = useParams();
  const [nameHospital, setNameHospital] = useState<string | null>(null);

  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [visitaActivaId, setVisitaActivaId] = useState<string | null>(null);

  // NUEVO: cache de tipos por visita
  const [tiposPorVisita, setTiposPorVisita] = useState<
    Record<string, TipoEquipoFolder[]>
  >({});
  const [tipoActivoId, setTipoActivoId] = useState<string | null>(null);

  // NUEVO: cache de certificados por tipo-equipo folder
  const [certificadosPorTipo, setCertificadosPorTipo] = useState<
    Record<string, Certificado[]>
  >({});

  const [loadingVisitas, setLoadingVisitas] = useState(true);
  const [loadingTipos, setLoadingTipos] = useState(false);
  const [loadingCerts, setLoadingCerts] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const endpointVisitas = `${url.url}/panel/hospital/${idHospital}/visitas`;

  // AJUSTA ESTAS RUTAS SEGÚN TU API
  const endpointTiposByVisita = (idVisita: string) =>
    `${url.url}/panel/visita/${idVisita}/tipos-equipo`;

  const endpointCertsByTipo = (idTipoEquipoFolder: string) =>
    `${url.url}/panel/tipo-equipo/${idTipoEquipoFolder}/certificados`;

  async function fetchJson<T>(input: string): Promise<T> {
    const res = await fetch(input, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
    return (await res.json()) as T;
  }

  async function cargarVisitas() {
    if (!idHospital) return;
    setLoadingVisitas(true);
    setError(null);

    try {
      const data = await fetchJson<Visita[]>(endpointVisitas);
      setVisitas(Array.isArray(data) ? data : []);
      // reset visual
      setVisitaActivaId(null);
      setTipoActivoId(null);
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? String(e));
      setVisitas([]);
    } finally {
      setLoadingVisitas(false);
    }
  }

  async function cargarTiposVisita(idVisita: string) {
    if (tiposPorVisita[idVisita]) return; // cache
    setLoadingTipos(true);
    setError(null);

    try {
      const data = await fetchJson<TipoEquipoFolder[]>(
        endpointTiposByVisita(idVisita)
      );
      setTiposPorVisita((prev) => ({
        ...prev,
        [idVisita]: Array.isArray(data) ? data : [],
      }));
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? String(e));
    } finally {
      setLoadingTipos(false);
    }
  }

  async function cargarCertificadosTipo(idTipoEquipoFolder: string) {
    if (certificadosPorTipo[idTipoEquipoFolder]) return; // cache
    setLoadingCerts(true);
    setError(null);

    try {
      const data = await fetchJson<Certificado[]>(
        endpointCertsByTipo(idTipoEquipoFolder)
      );
      setCertificadosPorTipo((prev) => ({
        ...prev,
        [idTipoEquipoFolder]: Array.isArray(data) ? data : [],
      }));
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? String(e));
    } finally {
      setLoadingCerts(false);
    }
  }

  async function cargarHospitalInfo() {
    const endpointHospital = `${url.url}/panel/hospital/${idHospital}/info`;
    try {
      const res = await fetch(endpointHospital, {
        headers: { Accept: "application/json" },
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
      const data = await res.json();
      document.title = `Panel público - ${
        data.nombre || "Hospital desconocido"
      }`;
      setNameHospital(data.name || null);
    } catch (e: any) {
      console.error("Error loading hospital info:", e);
    }
  }

  useEffect(() => {
    cargarVisitas();
    cargarHospitalInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idHospital]);

  const visitasFiltradas = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return visitas;
    return visitas.filter(
      (v) =>
        (v.nombreCarpeta ?? "").toLowerCase().includes(q) ||
        (v.fechaVisita ?? "").toLowerCase().includes(q)
    );
  }, [visitas, query]);

  return (
    <div className="panelWrap">
      <div className="panelShell">
        <header className="panelHeader">
          <div>
            <h1 className="panelTitle">Visualización de certificados</h1>
            <p className="panelSubtitle">
              Centro de salud: <strong>{nameHospital ?? "—"}</strong>
            </p>
          </div>

          <div className="panelActions">
            <button
              className="panelBtn"
              onClick={cargarVisitas}
              disabled={loadingVisitas || loadingTipos || loadingCerts}
            >
              {loadingVisitas ? "Cargando..." : "Recargar"}
            </button>
          </div>
        </header>

        <section className="panelToolbar">
          <label className="panelLabel">
            Buscar visita
            <input
              className="panelInput"
              placeholder="Ej: 2025-12-14"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </section>

        {error && <div className="panelError">{error}</div>}

        <section className="panelList">
          {loadingVisitas ? (
            <div className="panelEmpty">
              <p>Cargando visitas…</p>
              <p className="panelMuted">{endpointVisitas}</p>
            </div>
          ) : visitasFiltradas.length === 0 ? (
            <div className="panelEmpty">
              <p>No hay visitas para este centro.</p>
              <p className="panelMuted">Verifica el enlace o el idHospital.</p>
            </div>
          ) : (
            visitasFiltradas.map((v) => {
              const abiertaVisita = visitaActivaId === v._id;
              const tipos = tiposPorVisita[v._id] ?? [];

              return (
                <article
                  key={v._id}
                  className={`panelCard ${abiertaVisita ? "open" : ""}`}
                >
                  <button
                    className="panelCardHeader"
                    onClick={() => {
                      const next = abiertaVisita ? null : v._id;
                      setVisitaActivaId(next);
                      setTipoActivoId(null);
                      if (!abiertaVisita) cargarTiposVisita(v._id);
                    }}
                  >
                    <div className="panelCardHeaderLeft">
                      <div className="panelCardTitle">{v.nombreCarpeta}</div>
                      <div className="panelCardMeta">
                        <span className="chip">Visita</span>
                        <span className="panelMuted">ID: {v._id}</span>
                      </div>
                    </div>

                    <div className="panelCardHeaderRight">
                      <span className="panelCount">{tipos.length || "—"}</span>
                      <span className="panelChevron">
                        {abiertaVisita ? "▾" : "▸"}
                      </span>
                    </div>
                  </button>

                  {abiertaVisita && (
                    <div className="panelCardBody">
                      {loadingTipos && !tiposPorVisita[v._id] ? (
                        <div className="panelEmptyInner">
                          <p>Cargando tipos de equipo…</p>
                          <p className="panelMuted">
                            {endpointTiposByVisita(v._id)}
                          </p>
                        </div>
                      ) : tipos.length === 0 ? (
                        <div className="panelEmptyInner">
                          <p>
                            No hay carpetas de tipos de equipo en esta visita.
                          </p>
                        </div>
                      ) : (
                        // Segundo nivel: Tipos de equipo
                        tipos.map((t) => {
                          const abiertaTipo = tipoActivoId === t._id;
                          const certs = certificadosPorTipo[t._id] ?? [];

                          return (
                            <article
                              key={t._id}
                              className={`panelCard ${
                                abiertaTipo ? "open" : ""
                              }`}
                              style={{ marginTop: 10 }}
                            >
                              <button
                                className="panelCardHeader"
                                onClick={() => {
                                  const next = abiertaTipo ? null : t._id;
                                  setTipoActivoId(next);
                                  if (!abiertaTipo)
                                    cargarCertificadosTipo(t._id);
                                }}
                              >
                                <div className="panelCardHeaderLeft">
                                  <div className="panelCardTitle">
                                    {t.nombreCarpeta}
                                  </div>
                                  <div className="panelCardMeta">
                                    <span className="chip">Tipo equipo</span>
                                    <span className="panelMuted">
                                      ID: {t._id}
                                    </span>
                                  </div>
                                </div>

                                <div className="panelCardHeaderRight">
                                  <span className="panelCount">
                                    {certs.length || "—"}
                                  </span>
                                  <span className="panelChevron">
                                    {abiertaTipo ? "▾" : "▸"}
                                  </span>
                                </div>
                              </button>

                              {abiertaTipo && (
                                <div className="panelCardBody">
                                  {loadingCerts &&
                                  !certificadosPorTipo[t._id] ? (
                                    <div className="panelEmptyInner">
                                      <p>Cargando certificados…</p>
                                      <p className="panelMuted">
                                        {endpointCertsByTipo(t._id)}
                                      </p>
                                    </div>
                                  ) : certs.length === 0 ? (
                                    <div className="panelEmptyInner">
                                      <p>
                                        No hay certificados en este tipo de
                                        equipo.
                                      </p>
                                    </div>
                                  ) : (
                                    <div className="panelTable">
                                      <div className="panelTableHead">
                                        <span>Certificado</span>
                                        <span className="hideSm">Equipo</span>
                                        <span className="hideMd">Serie</span>
                                        <span className="hideMd">Área</span>
                                        <span className="hideSm">
                                          Actualizado
                                        </span>
                                        <span className="actionsCol">
                                          Acciones
                                        </span>
                                      </div>

                                      {certs.map((c) => (
                                        <div key={c._id} className="panelRow">
                                          <div className="panelCellMain">
                                            <div className="panelRowSub">
                                              <span className="chip chipBlue">
                                                {c.numeroCertificado ?? "—"}
                                              </span>
                                              <span className="panelMuted">
                                                Fecha:{" "}
                                                {c.fechaCalibracion ?? "—"}
                                              </span>
                                            </div>
                                          </div>

                                          <div className="hideSm">
                                            {c.equipo ?? "—"}
                                          </div>
                                          <div className="hideMd">
                                            {c.serie ?? "—"}
                                          </div>
                                          <div className="hideMd">
                                            {c.areaEquipo ?? "—"}
                                          </div>
                                          <div className="hideSm">
                                            {formatDate(
                                              c.actualizadoEn ?? c.creadoEn
                                            )}
                                          </div>

                                          <div className="actionsCol">
                                            <button
                                              className="panelBtnSecondary"
                                              onClick={() =>
                                                goToCertificado(c._id)
                                              }
                                            >
                                              Ver
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </article>
                          );
                        })
                      )}
                    </div>
                  )}
                </article>
              );
            })
          )}
        </section>

        <footer className="panelFooter">
          <small className="panelMuted">
            Panel público de verificación · No requiere inicio de sesión
          </small>
        </footer>
      </div>
    </div>
  );
}
