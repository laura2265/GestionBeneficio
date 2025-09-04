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
          nombre: x.nombre || x.titulo || x.asunto || `Solicitud #${x.id}`,
          fecha: (x.created_at || x.fecha || x.createdAt || "").toString().slice(0, 10),
          estado: x.estado || x.status || x.state || "BORRADOR",
        }));

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

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {modo === "panel" && (
        <>
          <header className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold">Panel del Técnico</h1>
            <div className="space-x-2">
              <button className="px-3 py-2 rounded bg-gray-200" onClick={fetchDrafts} disabled={loading}>
                {loading ? "Cargando..." : "Refrescar"}
              </button>
              <button className="px-3 py-2 rounded bg-blue-600 text-white" onClick={nuevaSolicitud}>
                Nueva Solicitud
              </button>
            </div>
          </header>

          {error && <div className="p-3 rounded bg-red-50 text-red-700 mb-3">{error}</div>}

          <section className="border rounded-xl overflow-hidden">
            <div className="grid grid-cols-12 px-4 py-2 bg-gray-50 text-sm font-medium">
              <div className="col-span-2">ID</div>
              <div className="col-span-5">Nombre</div>
              <div className="col-span-3">Fecha</div>
              <div className="col-span-2 text-right">Acciones</div>
            </div>
            {borradores.length === 0 ? (
              <div className="p-4 text-gray-600">No hay borradores.</div>
            ) : (
              <ul>
                {borradores.map((b) => (
                  <li key={b.id} className="grid grid-cols-12 px-4 py-3 border-t items-center">
                    <div className="col-span-2">{b.id}</div>
                    <div className="col-span-5 truncate">{b.nombre}</div>
                    <div className="col-span-3">{b.fecha}</div>
                    <div className="col-span-2 text-right space-x-2">
                      <button className="px-2 py-1 rounded bg-gray-200" onClick={() => { setBorradorEditando(b); setModo("formulario"); }}>
                        Editar datos
                      </button>
                      <button className="px-2 py-1 rounded bg-gray-900 text-white" onClick={() => editarBorrador(b)}>
                        Adjuntar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
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
  );
}
