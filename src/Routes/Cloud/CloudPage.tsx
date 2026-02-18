import { useEffect, useMemo, useState } from "react";
import "./Cloud.css";
import url from "@/constants/url.json";

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

type Certificado = {
  _id: string;
  numeroCertificado?: string;
  nombre?: string;
  fechaCalibracion?: string;
  actualizadoEn?: string;
  creadoEn?: string;
  equipo?: string;
  marca?: string;
  modelo?: string;
  serie?: string;
  areaEquipo?: string;
};

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

export default function CloudPage() {
  const endpointFolders = `${url.url}/folders`;
  const endpointCertificados = `${url.url}/certificados`;
  const [showModal, setShowModal] = useState(false);
  const [centros, setCentros] = useState<Folder[]>([]);
  const [visitas, setVisitas] = useState<Folder[]>([]);
  const [tipos, setTipos] = useState<Folder[]>([]);
  const [certificados, setCertificados] = useState<Certificado[]>([]);
  const [qrsSelected, setQrsSelected] = useState<string[]>([]);
  const [isGeneratingQRs, setIsGeneratingQRs] = useState(false);
  const [centroSeleccionado, setCentroSeleccionado] = useState<Folder | null>(
    null,
  );
  const [visitaSeleccionada, setVisitaSeleccionada] = useState<Folder | null>(
    null,
  );
  const [tiposSeleccionados, setTiposSeleccionados] = useState<Folder[]>([]);
  const [loadingCentros, setLoadingCentros] = useState(true);
  const [loadingVisitas, setLoadingVisitas] = useState(false);
  const [loadingCerts, setLoadingCerts] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [queryCentros, setQueryCentros] = useState("");
  const [queryCerts, setQueryCerts] = useState("");

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
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? String(e));
      setCentros([]);
    } finally {
      setLoadingCentros(false);
    }
  }

  async function cargarVisitas(centroId: string) {
    setLoadingVisitas(true);
    setError(null);
    try {
      const u = new URL(endpointFolders);
      u.searchParams.set("parentId", centroId);
      const data = await fetchJson<Folder[]>(u.toString());

      // Solo visitas (no tipos de equipo)
      const onlyVisitas = (Array.isArray(data) ? data : []).filter(
        (x) => x.tipo === "visita" || x.fechaVisita,
      );
      setVisitas(onlyVisitas);
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? String(e));
      setVisitas([]);
    } finally {
      setLoadingVisitas(false);
    }
  }

  async function cargarCarpetasTiposDeEquipo(visitaId: string) {
    setLoadingVisitas(true);
    setError(null);
    try {
      const u = new URL(endpointFolders);
      u.searchParams.set("parentId", visitaId);
      const data = await fetchJson<Folder[]>(u.toString());
      const onlyTipos = (Array.isArray(data) ? data : []).filter(
        (x) => x.tipo === "tipo_equipo",
      );
      setTipos(onlyTipos);
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? String(e));
      setTipos([]);
    } finally {
      setLoadingVisitas(false);
    }
  }
  async function cargarCertificadosDeTipo(tipoId: string) {
    setLoadingCerts(true);
    setError(null);
    try {
      const u = new URL(endpointCertificados);
      u.searchParams.set("folderId", tipoId);
      const data = await fetchJson<Certificado[]>(u.toString());
      setCertificados(Array.isArray(data) ? data : []);
      setTiposSeleccionados(tipos.filter((t) => t._id === tipoId));
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? String(e));
      setCertificados([]);
    } finally {
      setLoadingCerts(false);
    }
  }

  useEffect(() => {
    cargarCentros();
  }, []);

  const centrosFiltrados = useMemo(() => {
    const q = queryCentros.trim().toLowerCase();
    if (!q) return centros;
    return centros.filter((c) => {
      const n = (c.nombreCarpeta ?? "").toLowerCase();
      const cs = (c.centroSalud?.nombre ?? "").toLowerCase();
      return n.includes(q) || cs.includes(q);
    });
  }, [centros, queryCentros]);

  const certsFiltrados = useMemo(() => {
    const q = queryCerts.trim().toLowerCase();
    if (!q) return certificados;
    return certificados.filter((c) => {
      const n1 = (c.numeroCertificado ?? "").toLowerCase();
      const n2 = (c.nombre ?? "").toLowerCase();
      const id = (c._id ?? "").toLowerCase();
      return n1.includes(q) || n2.includes(q) || id.includes(q);
    });
  }, [certificados, queryCerts]);

  function irAInicio() {
    setCentroSeleccionado(null);
    setVisitaSeleccionada(null);
    setVisitas([]);
    setCertificados([]);
    setQueryCentros("");
    setQueryCerts("");
  }

  function volverACentros() {
    setCentroSeleccionado(null);
    setVisitaSeleccionada(null);
    setVisitas([]);
    setCertificados([]);
    setQueryCerts("");
  }

  function volverAVisitas() {
    setVisitaSeleccionada(null);
    setCertificados([]);
    setQueryCerts("");
  }
  function goToCertificado(idCertificado: string) {
    const path = `/view/${encodeURIComponent(idCertificado)}`;
    window.open(path, "_blank", "noopener,noreferrer");
  }
  async function genPdfQrs(certificadosIds: string[]) {
    if (certificadosIds.length === 0) {
      alert("No hay certificados seleccionados para generar QRs.");
      return;
    }

    try {
      setIsGeneratingQRs(true);

      // Preparar datos para generar QRs
      const qrData = certificadosIds.map((id) => {
        const cert = certificados.find(
          (c) => c._id === id || c.numeroCertificado === id,
        );
        return {
          certificado: cert?.numeroCertificado || id,
          serie: cert?.serie || "N.R",
          link: `${window.location.origin}/view/${id}`,
        };
      });

      // Obtener información del cliente (del primer certificado)
      const primerCert = certificados[0];
      const clienteNombre =
        primerCert?.data?.header?.clientData?.name ||
        primerCert?.nombre ||
        "Cliente";

      const fecha = new Date().toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      // Solicitar generación de PDF con QRs
      const qrRes = await fetch(`${url.url}/certificados/generar-qrs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          certificados: qrData,
          fecha: fecha,
          clienteNombre: clienteNombre,
        }),
      });

      if (!qrRes.ok) {
        const error = await qrRes.json();
        throw new Error(error.error || "Error generando QRs");
      }

      // Descargar PDF automáticamente
      const blob = await qrRes.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `QRS_${clienteNombre.replace(
        /\s+/g,
        "_",
      )}_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);

      alert(`✅ PDF generado con ${certificadosIds.length} QR(s) exitosamente`);
      setQrsSelected([]);
    } catch (error: any) {
      console.error("Error generando QRs:", error);
      alert(error.message || "Error generando el PDF de QRs");
    } finally {
      setIsGeneratingQRs(false);
    }
  }

  function addQR(idCertificado: string) {
    setQrsSelected((prev) => {
      if (prev.includes(idCertificado)) {
        return prev.filter((id) => id !== idCertificado);
      } else {
        return [...prev, idCertificado];
      }
    });
  }

  return (
    <div className="cloudApp">
      <div className="cloudCard">
        <header className="cloudHeader">
          <div>
            <h1>Cloud</h1>
            <p className="muted">Centros → Visitas → Certificados</p>
          </div>

          <div className="cloudHeaderActions">
            <button
              className="btn btnSecondary"
              onClick={irAInicio}
              disabled={loadingCentros || loadingVisitas || loadingCerts}
            >
              Inicio
            </button>
            {visitaSeleccionada ? (
              <button
                className="btn btnSecondary"
                onClick={volverAVisitas}
                disabled={loadingCerts}
              >
                Volver a visitas
              </button>
            ) : centroSeleccionado ? (
              <button
                className="btn btnSecondary"
                onClick={volverACentros}
                disabled={loadingVisitas}
              >
                Volver a clientes
              </button>
            ) : null}
            <button
              onClick={() => (window.location.href = "/create")}
              className="btn btnSecondary"
            >
              Crear centro
            </button>
            <button
              className="btn"
              onClick={cargarCentros}
              disabled={loadingCentros || loadingVisitas || loadingCerts}
            >
              {loadingCentros ? "Cargando..." : "Recargar"}
            </button>
          </div>
        </header>

        {error && <div className="error">{error}</div>}

        {/* ====== VISTA 1: CENTROS ====== */}
        {!centroSeleccionado && (
          <>
            <section className="cloudToolbar">
              <div className="cloudSearch">
                <label>
                  Buscar centro
                  <input
                    placeholder="Nombre del centro..."
                    value={queryCentros}
                    onChange={(e) => setQueryCentros(e.target.value)}
                  />
                </label>
              </div>

              <div className="cloudSort">
                <label>
                  Nivel
                  <input value="Centros" readOnly />
                </label>
              </div>
            </section>

            <section className="cloudTable">
              <div className="cloudTableHead">
                <span>Centro</span>
                <span className="colMime">Detalle</span>
                <span className="colSize">Certificados</span>
                <span className="colUpdated">Último</span>
                <span className="colActions">Acciones</span>
              </div>

              {loadingCentros ? (
                <div className="cloudEmpty">
                  <p>Cargando centros…</p>
                  <p className="muted">Consultando: {endpointFolders}</p>
                </div>
              ) : centrosFiltrados.length === 0 ? (
                <div className="cloudEmpty">
                  <p>No hay centros para mostrar.</p>
                </div>
              ) : (
                <ul className="cloudList">
                  {centrosFiltrados.map((c) => (
                    <li key={c._id} className="cloudRow">
                      <div className="fileCell">
                        <div className="fileIcon" aria-hidden="true">
                          <span className="fileIconFallback">⬤</span>
                        </div>
                        <div className="fileMeta">
                          <div className="fileName" title={c.nombreCarpeta}>
                            {c.nombreCarpeta}
                          </div>
                          <div className="fileSub muted">
                            Centro:{" "}
                            <strong>{c.centroSalud?.nombre ?? "—"}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="colMime">{c.tipo ?? "centro_salud"}</div>
                      <div className="colSize">{c.numeroCertificados ?? 0}</div>
                      <div className="colUpdated">
                        {formatDate(c.totales?.ultimoCertificadoEn ?? null)}
                      </div>

                      <div className="colActions">
                        <button
                          className="btn btnSecondary"
                          onClick={() => {
                            setCentroSeleccionado(c);
                            setVisitaSeleccionada(null);
                            setCertificados([]);
                            cargarVisitas(c._id);
                          }}
                          disabled={loadingVisitas}
                        >
                          Ver visitas
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}

        {/* ====== VISTA 2: VISITAS ====== */}
        {centroSeleccionado && !visitaSeleccionada && (
          <>
            <section className="cloudToolbar">
              <div className="cloudSearch">
                <label>
                  Centro seleccionado
                  <input value={centroSeleccionado.nombreCarpeta} readOnly />
                </label>
              </div>

              <div className="cloudSort">
                <label>
                  Nivel
                  <input value="Visitas" readOnly />
                </label>
              </div>
            </section>

            <section className="cloudToolbar">
              <div className="cloudSearch">
                <label>
                  Buscar visita
                  <input
                    placeholder="Nombre de la visita..."
                    value={queryCentros}
                    onChange={(e) => setQueryCentros(e.target.value)}
                  />
                </label>
              </div>

              <div className="cloudSort">
                <label>
                  Nivel
                  <input value="Visitas" readOnly />
                </label>
              </div>
            </section>

            <section className="cloudTable">
              <div className="cloudTableHead">
                <span>Visita</span>
                <span className="colMime">Fecha</span>
                <span className="colSize"> Numero Certificados</span>
                <span className="colUpdated"> Tipos {"\n"} de equipos</span>
                <span className="colActions">Acciones</span>
              </div>

              {loadingVisitas ? (
                <div className="cloudEmpty">
                  <p>Cargando visitas…</p>
                  <p className="muted">
                    Consultando: {endpointFolders}?parentId=
                    {centroSeleccionado._id}
                  </p>
                </div>
              ) : visitas.filter(
                  (v) => v.idCarpetaPadre === centroSeleccionado._id,
                ).length === 0 ? (
                <div className="cloudEmpty">
                  <p>Este centro no tiene visitas.</p>
                </div>
              ) : (
                <ul className="cloudList">
                  {visitas
                    .filter((v) => v.idCarpetaPadre === centroSeleccionado._id)
                    .map((v) => (
                      <li key={v._id} className="cloudRow">
                        <div className="fileCell">
                          <div className="fileIcon" aria-hidden="true">
                            <span className="fileIconFallback">⬤</span>
                          </div>
                          <div className="fileMeta">
                            <div className="fileName" title={v.nombreCarpeta}>
                              {v.nombreCarpeta}
                            </div>
                            <div className="fileSub muted">
                              ID: <strong>{v._id}</strong>
                            </div>
                          </div>
                        </div>

                        <div className="colMime">{v.fechaVisita ?? "—"}</div>
                        <div className="colSize">
                          {v.numeroCertificados ?? 0}
                        </div>
                        <div className="colUpdated">
                          {
                            tipos.filter((t) => t.idCarpetaPadre === v._id)
                              .length
                          }{" "}
                        </div>

                        <div className="colActions">
                          <button
                            className="btn btnSecondary"
                            onClick={() => {
                              setVisitaSeleccionada(v);
                              setCertificados([]);
                              cargarCarpetasTiposDeEquipo(v._id); // Cargar tipos de equipo
                            }}
                            disabled={loadingCerts}
                          >
                            Ver equipos
                          </button>
                        </div>
                      </li>
                    ))}
                </ul>
              )}
            </section>
          </>
        )}

        {/* ====== VISTA 3: TIPOS DE EQUIPO ====== */}
        {visitaSeleccionada && tipos.length > 0 && (
          <>
            <section className="cloudToolbar">
              <div className="cloudSearch">
                <label>
                  Buscar tipo de equipo
                  <input
                    placeholder="Nombre del tipo de equipo..."
                    value={queryCerts}
                    onChange={(e) => setQueryCerts(e.target.value)}
                  />
                </label>
              </div>

              <div className="cloudSort">
                <label>
                  Visita
                  <input value={visitaSeleccionada.nombreCarpeta} readOnly />
                </label>
              </div>
            </section>

            <section className="cloudTable">
              <div className="cloudTableHead">
                <span>Tipo de equipo</span>
                <span className="colMime">Numero certificados</span>
                <span className="colSize">Visita</span>
                <span className="colUpdated">Centro</span>
                <span className="colActions">Acciones</span>
              </div>

              {loadingVisitas ? (
                <div className="cloudEmpty">
                  <p>Cargando tipos de equipo…</p>
                </div>
              ) : tipos.filter(
                  (tipo) => tipo.idCarpetaPadre === visitaSeleccionada._id,
                ).length === 0 ? (
                <div className="cloudEmpty">
                  <p>No hay tipos de equipo en esta visita.</p>
                </div>
              ) : (
                <ul className="cloudList">
                  {tipos
                    .filter(
                      (tipo) => tipo.idCarpetaPadre === visitaSeleccionada._id,
                    )
                    .map((tipo) => (
                      <li key={tipo._id} className="cloudRow">
                        <div className="fileCell">
                          <div className="fileIcon" aria-hidden="true">
                            <span className="fileIconFallback">⬤</span>
                          </div>
                          <div className="fileMeta">
                            <div
                              className="fileName"
                              title={tipo.nombreCarpeta}
                            >
                              {tipo.nombreCarpeta}
                            </div>
                          </div>
                        </div>

                        <div className="colMime">
                          {tipo.numeroCertificados ?? 0}
                        </div>
                        <div className="colSize">
                          {visitaSeleccionada.nombreCarpeta}
                        </div>
                        <div className="colUpdated">
                          {centroSeleccionado?.centroSalud?.nombre ?? "—"}
                        </div>

                        <div className="colActions">
                          <button
                            className="btn btnSecondary"
                            onClick={() => cargarCertificadosDeTipo(tipo._id)}
                            disabled={loadingCerts}
                          >
                            Ver certificados
                          </button>
                        </div>
                      </li>
                    ))}
                </ul>
              )}
            </section>
          </>
        )}

        {/* ====== VISTA 4: CERTIFICADOS (por tipo de equipo) ====== */}
        {visitaSeleccionada && tiposSeleccionados.length > 0 && (
          <>
            <section className="cloudTable">
              <div className="cloudTableHead">
                <span>Certificado</span>
                <span className="colMime">Número</span>
                <span className="colSize">Equipo</span>
                <span className="colUpdated">Actualizado</span>
                <span className="colActions">Acciones</span>
              </div>

              {loadingCerts ? (
                <div className="cloudEmpty">
                  <p>Cargando certificados…</p>
                </div>
              ) : certificados.length === 0 ? (
                <div className="cloudEmpty">
                  <p>No hay certificados para este tipo de equipo.</p>
                </div>
              ) : (
                <ul className="cloudList">
                  {certsFiltrados.map((c) => (
                    <li key={c._id} className="cloudRow">
                      <div className="fileCell">
                        <div className="fileIcon" aria-hidden="true">
                          <span className="fileIconFallback">⬤</span>
                        </div>
                        <div className="fileMeta">
                          <div className="fileName" title={c.nombre ?? c._id}>
                            {c.nombre ?? `Certificado ${c._id}`}
                          </div>
                        </div>
                      </div>

                      <div className="colMime">
                        {c.numeroCertificado ?? "—"}
                      </div>
                      <div className="colSize">{c.equipo ?? "—"}</div>
                      <div className="colUpdated">
                        {formatDate(c.actualizadoEn ?? c.creadoEn)}
                      </div>

                      <div className="colActions">
                        <a
                          href={`/view/${encodeURIComponent(c._id)}`}
                          className="btn btnSecondary"
                          onClick={(e) => {
                            e.preventDefault();
                            if (!isGeneratingQRs) {
                              goToCertificado(c._id);
                            }
                          }}
                          onMouseDown={(e) => {
                            // Prevenir navegación en clic central
                            if (e.button === 1) {
                              e.preventDefault();
                            }
                          }}
                          style={{
                            display: "inline-block",
                            textDecoration: "none",
                            cursor: isGeneratingQRs ? "not-allowed" : "pointer",
                            pointerEvents: isGeneratingQRs ? "none" : "auto",
                          }}
                        >
                          Ver
                        </a>

                        <button
                          className={`btn btnSecondary ${
                            qrsSelected.includes(c.numeroCertificado || c._id)
                              ? "active"
                              : ""
                          }`}
                          onClick={() => addQR(c.numeroCertificado || c._id)}
                          disabled={isGeneratingQRs}
                        >
                          {qrsSelected.includes(c.numeroCertificado || c._id)
                            ? "✓ QR"
                            : "QR"}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {qrsSelected.length > 0 && (
                <div className="cloudToolbar">
                  <button
                    className="btn"
                    onClick={() => genPdfQrs(qrsSelected)}
                    disabled={isGeneratingQRs}
                  >
                    {isGeneratingQRs
                      ? "Generando QRs..."
                      : `Generar PDF con
                      ${qrsSelected.length} QRs`}
                  </button>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
