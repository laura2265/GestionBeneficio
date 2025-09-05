// DashboardTecnico.jsx (borradores + editar/adjuntar)
import { useEffect, useMemo, useState } from "react";
import UploadDocs from "./UploadDocs";  // tu componente de adjuntos
import FormData from "./FormData";      // tu formulario de datos

const API_BASE = import.meta?.env?.VITE_API_BASE || "http://localhost:3000";

export default function DashboardTecnico() {
  // UI State
  // "panel" | "formulario" | "adjuntos"
  const [modo, setModo] = useState("panel");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Datos
  const [borradores, setBorradores] = useState([]);
  const [draftId, setDraftId] = useState(null);
  const [borradorEditando, setBorradorEditando] = useState(null);

  const auth = useMemo(() => JSON.parse(localStorage.getItem("auth") || "{}"), []);
  const tecnicoId = Number(auth?.userId || auth?.id || 0);

  // Carga de borradores desde API
  const fetchDrafts = async () => {
    setLoading(true); setError("");
    try {
      // Primer intento: usando 'estado=BORRADOR'
      let res = await fetch(`${API_BASE}/api/applications?estado=BORRADOR`, {
        headers: { "x-user-id": String(tecnicoId) },
      });
      // Si no existe ese filtro, intenta 'status=DRAFT'
      if (!res.ok) {
        res = await fetch(`${API_BASE}/api/applications?status=DRAFT`, {
          headers: { "x-user-id": String(tecnicoId) },
        });
      }
      // Último intento sin filtro (filtramos en front si llega todo)
      let data = await res.json().catch(() => ([]));
      if (!res.ok) throw new Error(data?.message || "No se pudieron cargar los borradores");

      const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
      // Normaliza mínimamente los campos visuales
     
      const mapped = items
        .filter((x) => (x.estado || x.status || x.state || "").toString().toUpperCase().includes("BORRADOR") || (x.status || x.state) === "DRAFT" || !x.estado)
        .map((x) => ({
          id: Number(x.id || x.application_id || x.uid),
          nombre: x.nombre,

          estado: x.estado || x.status || x.state || "BORRADOR",
        }));
         console.log("Datos: ",mapped )
      setBorradores(mapped);
    } catch (e) {
      setError(e.message || "Error cargando borradores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (modo === "panel") fetchDrafts(); }, [modo]);
  useEffect(() => { fetchDrafts(); }, []);

  const nuevaSolicitud = () => {
    setBorradorEditando(null);
    setDraftId(null);
    setModo("formulario");
  };

  const editarBorrador = (b) => {
    setBorradorEditando(b);
    setDraftId(b.id);
    setModo("adjuntos");
  };

  const handleDraftSaved = (id) => {
    // Cuando FormData crea/guarda, vamos a adjuntos
    setDraftId(id);
    setModo("adjuntos");
    // refresca lista al volver
    fetchDrafts();
  };

  const onSubmitted = () => {
    // Al enviar, regresamos al panel y refrescamos
    setDraftId(null);
    setModo("panel");
    fetchDrafts();
  };

  const cerrarSesion = () => {
    localStorage.removeItem("auth");
    window.location.href = "/login";
  };


  return (
    <div className="ContentTecnico">
      <div className="">
        {modo === "panel" && (
          <>
            <header className="Headers">
              <h1 className="text-2xl font-semibold">Panel del Técnico</h1>
              <div className="ButtonsHead">
                <button className="button1 px-3 py-2 rounded bg-gray-200" onClick={fetchDrafts} disabled={loading}>
                  {loading ? "Cargando..." : "Refrescar"}
                </button>
                <button className="button1 px-3 py-2 rounded bg-blue-600 text-white" onClick={nuevaSolicitud}>
                  Nueva Solicitud
                </button>
                <button
                  className="px-3 py-2 rounded bg-red-600 text-white"
                  onClick={cerrarSesion}
                >
                  Cerrar Sesión
                </button>
              </div>
            </header>

            {error && <div className="p-3 rounded bg-red-50 text-red-700 mb-3">{error}</div>}

            <section className="cards">

              {borradores.length === 0 ? (
                <div className="">No hay borradores.</div>
              ) : (
                <div className="cards-container">
                  {borradores.map((b) => (
                    <div key={b.id} className="card">
                      <h3>{b.nombre}</h3>
                      <p><strong>ID:</strong> {b.id}</p>
                      <p><strong>Estado:</strong> {b.estado}</p>
                      <div className="card-buttons">
                        <button onClick={() => { setBorradorEditando(b); setModo("formulario"); }}>Editar</button>
                        <button onClick={() => editarBorrador(b)}>Adjuntar</button>
                      </div>
                    </div>
                  ))}
                </div>

              )}
            </section>
          </>
        )}

        {modo === "formulario" && (
          <FormData 
            borrador={borradorEditando}
            volver={() => setModo("panel")}
            onDraftSaved={handleDraftSaved}
          />
        )}

        {modo === "adjuntos" && draftId && (
          <UploadDocs
            applicationId={draftId}
            volver={() => setModo("panel")}
            onSubmitted={onSubmitted}
          />
        )}
      </div>
    </div>
  );
}
