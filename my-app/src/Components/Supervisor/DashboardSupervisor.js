// SupervisorDashboard.v2.jsx
import { useEffect, useMemo, useState } from "react";

const API_BASE = import.meta?.env?.VITE_API_BASE || "http://localhost:3000";
const cx = (...a) => a.filter(Boolean).join(" ");

const TABS = [
  { key: "ENVIADA", label: "En revisión" },
  { key: "APROBADA", label: "Aprobadas" },
  { key: "RECHAZADA", label: "Rechazadas" },
];

export default function SupervisorDashboardV2({ classes = {} }) {
  const auth = useMemo(() => JSON.parse(localStorage.getItem("auth") || "{}"), []);
  const supervisorId = Number(auth?.userId || auth?.id || 0);
  const headers = { "x-user-id": String(supervisorId) };

  const [tab, setTab] = useState("ENVIADA");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  const [sel, setSel] = useState(null); // fila seleccionada
  const [detail, setDetail] = useState(null); // detalle de solicitud
  const [files, setFiles] = useState([]);
  const [pdfs, setPdfs] = useState([]);
  const [drawer, setDrawer] = useState(null); // "detail" | "files" | "pdfs" | null

  const fetchList = async () => {
    setLoading(true); setError("");
    try {
      let res = await fetch(`${API_BASE}/api/applications?estado=${encodeURIComponent(tab)}`, { headers });
      if (!res.ok) {
        res = await fetch(`${API_BASE}/api/applications?status=${encodeURIComponent(tab)}`, { headers });
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "No se pudieron cargar las solicitudes");
      const list = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
      const mapped = list.map((x) => ({
        raw: x,
        id: Number(x.id || x.application_id || x.uid),
        nombre: x.nombre || `${x.nombres ?? ""} ${x.apellidos ?? ""}`.trim() || `Solicitud #${x.id}`,
        documento: x.numero_documento || x.doc || "",
        fecha: (x.created_at || x.fecha || x.createdAt || "").toString().slice(0, 10),
        estado: x.estado || x.status || x.state || tab,
      }));
      setItems(mapped);
    } catch (e) {
      setError(e.message || "Error cargando");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(); }, [tab]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return items;
    return items.filter((i) =>
      String(i.id).includes(qq) ||
      (i.nombre || "").toLowerCase().includes(qq) ||
      (i.documento || "").toLowerCase().includes(qq)
    );
  }, [items, q]);

  const openDetail = async (row) => {
    setSel(row); setDrawer("detail"); setDetail(null); setFiles([]); setPdfs([]);
    try {
      const res = await fetch(`${API_BASE}/api/applications/${row.id}`, { headers });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setDetail(data);
    } catch {}
  };

  const openFiles = async (row) => {
    setSel(row); setDrawer("files"); setFiles([]);
    try {
      const res = await fetch(`${API_BASE}/api/applications/${row.id}/files`, { headers });
      const data = await res.json().catch(() => ({}));
      const arr = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
      setFiles(arr);
    } catch {}
  };

  const openPdfs = async (row) => {
    setSel(row); setDrawer("pdfs"); setPdfs([]);
    try {
      let res = await fetch(`${API_BASE}/api/applications/${row.id}/pdfs`, { headers });
      if (!res.ok) res = await fetch(`${API_BASE}/api/pdfs?application_id=${row.id}`, { headers });
      const data = await res.json().catch(() => ({}));
      const arr = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
      setPdfs(arr.map((p) => ({
        id: Number(p.id || p.pdf_id),
        name: p.name || p.file_name || `PDF #${p.id}`,
        url: p.url || p.storage_path || p.path || "",
        created_at: (p.created_at || p.fecha || p.createdAt || "").toString().replace("T", " ").slice(0, 19),
        tipo: p.tipo || p.kind || p.type || (p.estado || "RESOLUCION"),
      })));
    } catch {}
  };

  const approve = async (row) => {
    const comentario = window.prompt("Comentario (opcional) para aprobación:", "");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/applications/${row.id}/approve`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ comentario }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "No se pudo aprobar");
      await fetchList();
      // tras aprobar, mostrar PDFs para ver la resolución generada
      await openPdfs({ id: row.id });
    } catch (e) {
      alert(e.message || "Error");
    } finally { setLoading(false); }
  };

  const reject = async (row) => {
    const motivo = window.prompt("Motivo del rechazo:", "Información incompleta");
    if (!motivo) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/applications/${row.id}/reject`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ motivo }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "No se pudo rechazar");
      await fetchList();
      await openPdfs({ id: row.id });
    } catch (e) {
      alert(e.message || "Error");
    } finally { setLoading(false); }
  };

  const Pill = ({ active, children, onClick }) => (
    <button onClick={onClick} className={cx("px-3 py-1 rounded-full text-sm", active ? "bg-gray-900 text-white" : "bg-gray-200", classes.tab)}>
      {children}
    </button>
  );

  const Drawer = ({ open, title, onClose, children }) => {
    if (!open) return null;
    return (
      <div className={cx("fixed inset-0 z-50", classes.drawerWrap)}>
        <div className="absolute inset-0 bg-black/30" onClick={onClose} />
        <div className={cx("absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl p-4 overflow-y-auto", classes.drawer)}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button className="px-2 py-1" onClick={onClose}>✕</button>
          </div>
          {children}
        </div>
      </div>
    );
  };

  return (
    <div className={cx("p-4 max-w-7xl mx-auto", classes.wrapper)}>
      <header className="mb-4 flex items-center justify-between">
        <h1 className={cx("text-2xl font-semibold", classes.title)}>Panel del Supervisor</h1>
        <div className="space-x-2">
          {TABS.map((t) => (
            <Pill key={t.key} active={tab === t.key} onClick={() => setTab(t.key)}>{t.label}</Pill>
          ))}
          <button className={cx("ml-2 px-3 py-2 rounded bg-gray-200", classes.refreshBtn)} onClick={fetchList} disabled={loading}>
            {loading ? "Actualizando..." : "Actualizar"}
          </button>
        </div>
      </header>

      {error && <div className="p-3 rounded bg-red-50 text-red-700 mb-3">{error}</div>}

      <section className="mb-3 flex items-center gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por ID, nombre o documento" className={cx("w-full md:w-96 border rounded p-2", classes.search)} />
      </section>

      <section className="border rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 px-4 py-2 bg-gray-50 text-sm font-medium">
          <div className="col-span-2">ID</div>
          <div className="col-span-4">Solicitante</div>
          <div className="col-span-3">Documento</div>
          <div className="col-span-2">Fecha</div>
          <div className="col-span-1 text-right">Acciones</div>
        </div>
        {filtered.length === 0 ? (
          <div className="p-4 text-gray-600">No hay solicitudes.</div>
        ) : (
          <ul>
            {filtered.map((row) => (
              <li key={row.id} className={cx("grid grid-cols-12 px-4 py-3 border-t items-center", classes.row)}>
                <div className="col-span-2">{row.id}</div>
                <div className="col-span-4 truncate">{row.nombre}</div>
                <div className="col-span-3">{row.documento}</div>
                <div className="col-span-2">{row.fecha}</div>
                <div className="col-span-1 text-right space-x-2">
                  <button className={cx("px-2 py-1 rounded bg-gray-200", classes.detailBtn)} onClick={() => openDetail(row)}>Detalle</button>
                  <button className={cx("px-2 py-1 rounded bg-gray-200", classes.filesBtn)} onClick={() => openFiles(row)}>Archivos</button>
                  <button className={cx("px-2 py-1 rounded bg-gray-200", classes.pdfsBtn)} onClick={() => openPdfs(row)}>PDFs</button>
                  {tab === "ENVIADA" && (
                    <>
                      <button className={cx("px-2 py-1 rounded bg-emerald-600 text-white", classes.approveBtn)} onClick={() => approve(row)}>Aprobar</button>
                      <button className={cx("px-2 py-1 rounded bg-red-600 text-white", classes.rejectBtn)} onClick={() => reject(row)}>Rechazar</button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Drawer: Detalle */}
      <Drawer open={drawer === "detail"} title={sel ? `Detalle — Solicitud #${sel.id}` : "Detalle"} onClose={() => setDrawer(null)}>
        {!detail ? (
          <div className="text-gray-600">Cargando...</div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Nombres" value={detail.nombres} />
              <Field label="Apellidos" value={detail.apellidos} />
              <Field label="Tipo documento" value={detail.tipo_documento} />
              <Field label="Documento" value={detail.numero_documento} />
              <Field label="Dirección" value={detail.direccion} />
              <Field label="Barrio" value={detail.barrio} />
              <Field label="Correo" value={detail.correo} />
              <Field label="Teléfono" value={detail.numero_contacto} />
              <Field label="Estrato" value={detail.estrato_id} />
              <Field label="Declaración juramentada" value={String(detail.declaracion_juramentada)} />
              <Field label="Estado" value={detail.estado || detail.status || ""} />
              <Field label="Creado" value={(detail.created_at || "").toString().replace("T"," ").slice(0,19)} />
              <Field label="Actualizado" value={(detail.updated_at || "").toString().replace("T"," ").slice(0,19)} />
            </div>
            <hr/>
            <h4 className="font-semibold">Adjuntos</h4>
            <DetailFiles applicationId={sel?.id} headers={headers} />
          </div>
        )}
      </Drawer>

      {/* Drawer: Archivos */}
      <Drawer open={drawer === "files"} title={sel ? `Archivos — Solicitud #${sel.id}` : "Archivos"} onClose={() => setDrawer(null)}>
        <FilesList files={files} />
      </Drawer>

      {/* Drawer: PDFs */}
      <Drawer open={drawer === "pdfs"} title={sel ? `Historial PDF — Solicitud #${sel.id}` : "Historial PDF"} onClose={() => setDrawer(null)}>
        {pdfs.length === 0 ? (
          <div className="text-gray-600">No hay PDFs generados.</div>
        ) : (
          <ul className="space-y-2">
            {pdfs.map((p) => (
              <li key={p.id} className="flex items-center justify-between border rounded p-2">
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-gray-500">{p.tipo} · {p.created_at}</div>
                </div>
                {p.url && (
                  <a className="px-2 py-1 rounded bg-gray-900 text-white" href={`${API_BASE}${p.url}`} target="_blank" rel="noreferrer">
                    Ver/Descargar
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </Drawer>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-medium break-words">{value ?? "—"}</div>
    </div>
  );
}

function DetailFiles({ applicationId, headers }) {
  const [files, setFiles] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/applications/${applicationId}/files`, { headers });
        const data = await res.json().catch(() => ({}));
        const arr = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
        setFiles(arr);
      } catch {}
    })();
  }, [applicationId]);
  return <FilesList files={files} />;
}

function FilesList({ files }) {
  if (!files || files.length === 0) return <div className="text-gray-600">No hay archivos.</div>;
  return (
    <ul className="space-y-2">
      {files.map((f) => (
        <li key={f.id} className="flex items-center justify-between border rounded p-2">
          <div>
            <div className="font-medium">{f.file_name || f.name}</div>
            <div className="text-xs text-gray-500">{f.kind} · {f.mime_type} · {new Date(f.created_at || Date.now()).toLocaleString()}</div>
          </div>
          {f.storage_path && (
            <a className="px-2 py-1 rounded bg-gray-900 text-white" href={`${API_BASE}${f.storage_path}`} target="_blank" rel="noreferrer">
              Ver
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}
