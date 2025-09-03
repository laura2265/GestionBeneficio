// UploadDocs.jsx
import { useEffect, useMemo, useState } from "react";

/** Requisitos fijos basados en tu tabla */
const FIXED_REQUIREMENTS = [
  { kind: "CEDULA",                   required: true,  label: "Cédula (PDF)" },
  { kind: "CONTRATO",                 required: true,  label: "Contrato con anexos o audio (PDF/Audio)" },
  { kind: "EVIDENCIA_ESTRATO_SISBEN", required: true,  label: "Certificado SISBEN o recibo (PDF)" },
  { kind: "FOTO_FACHADA",             required: false, label: "Foto de fachada (Imagen)" },
  { kind: "PRUEBA_VELOCIDAD",         required: false, label: "Prueba de velocidad (PDF/Imagen)" },
  { kind: "VERIFICACION_ENERGIA",     required: false, label: "Verificación de energía (PDF/Imagen)" },
  { kind: "DECLARACION_JURAMENTADA",  required: false, label: "Declaración juramentada (PDF)" },
];

/** Tipos de archivo permitidos por kind */
const KIND_ACCEPT = {
  CEDULA: "application/pdf",
  CONTRATO: ".pdf,.mp3,.wav,.m4a",
  EVIDENCIA_ESTRATO_SISBEN: "application/pdf",
  FOTO_FACHADA: "image/*",
  PRUEBA_VELOCIDAD: ".pdf,image/*",
  VERIFICACION_ENERGIA: ".pdf,image/*",
  DECLARACION_JURAMENTADA: "application/pdf",
};

/** Normaliza la lista de archivos que devuelve tu backend a un formato estándar */
function normalizeFiles(payload) {
  const list = Array.isArray(payload) ? payload : (payload?.files || payload?.data || []);
  return (list || []).map((f, i) => ({
    id: f.id ?? f.fileId ?? f.uuid ?? `${i}`,
    kind: f.kind ?? f.doc_kind ?? f.type ?? f.category ?? "",
    name: f.fileName ?? f.filename ?? f.name ?? `archivo_${i}`,
    url: f.url ?? f.path ?? null,
  }));
}

export default function UploadDocs({ applicationId, volver, onSubmitted }) {
  const [selected, setSelected] = useState({});  // { kind: File }
  const [uploaded, setUploaded] = useState([]);  // [{id, kind, name, url?}]
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // Saco el técnico del localStorage como en tu FormData
  const auth = JSON.parse(localStorage.getItem("auth") || "{}");
  const tecnicoId = Number(auth?.userId);

  // Orden: requeridos primero
  const requirements = useMemo(
    () => [...FIXED_REQUIREMENTS].sort((a, b) => (b.required ? 1 : 0) - (a.required ? 1 : 0)),
    []
  );

  /** ----------- LISTAR EXISTENTES (POST) ----------- */
  const fetchExistingFiles = async () => {
    // 1) Intento POST con JSON (algunas APIs lo piden)
    let res, data;
    try {
      res = await fetch(
        `http://localhost:3000/api/applications/${applicationId}/files`,
        {
          method: "POST",
          headers: {
            "x-user-id": tecnicoId,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "LIST" }),
        }
      );
      data = await res.json().catch(() => ({}));
      if (res.ok) {
        setUploaded(normalizeFiles(data));
        return;
      }
    } catch {
      /* seguimos al fallback */
    }
    // 2) Fallback: POST sin body (por si tu ruta no espera JSON)
    try {
      res = await fetch(
        `http://localhost:3000/api/applications/${applicationId}/files`,
        {
          method: "POST",
          headers: { "x-user-id": tecnicoId },
        }
      );
      data = await res.json().catch(() => ({}));
      if (res.ok) {
        setUploaded(normalizeFiles(data));
        return;
      }
      throw new Error(data?.message || "No se pudo cargar los archivos");
    } catch (e) {
      setMsg(e.message || "Error al listar archivos");
    }
  };

  useEffect(() => {
    fetchExistingFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId]);

  /** ----------- SELECCIÓN ----------- */
  const handleChange = (kind, file) => {
    setSelected((s) => ({ ...s, [kind]: file }));
  };

  /** ----------- SUBIR UNO (POST FormData) ----------- */
  const uploadOne = async (kind, file) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("kind", kind);                // <- para que el backend sepa qué es
    fd.append("applicationId", String(applicationId)); // <- por si tu backend lo usa

    const res = await fetch(
      `http://localhost:3000/api/applications/${applicationId}/files`,
      {
        method: "POST",
        headers: { "x-user-id": tecnicoId }, // NO pongas Content-Type con FormData
        body: fd,
      }
    );

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || `No se pudo subir ${kind}`);
    return data;
  };

  /** ----------- SUBIR TODOS ----------- */
  const uploadAll = async () => {
    setMsg("");
    setLoading(true);
    try {
      // Validar requeridos (ya subidos o seleccionados)
      const missing = requirements.filter(
        (r) => r.required && !selected[r.kind] && !uploaded.find((u) => u.kind === r.kind)
      );
      if (missing.length) {
        throw new Error(`Faltan: ${missing.map((m) => m.label).join(", ")}`);
      }

      // Subir lo que el usuario eligió ahora
      for (const r of requirements) {
        const f = selected[r.kind];
        if (f) await uploadOne(r.kind, f);
      }

      await fetchExistingFiles();
      setSelected({});
      setMsg("Adjuntos cargados correctamente.");
    } catch (e) {
      setMsg(e.message || "Error al subir adjuntos");
    } finally {
      setLoading(false);
    }
  };

  /** ----------- ENVIAR SOLICITUD ----------- */
  const enviarSolicitud = async () => {
    setMsg("");
    setLoading(true);
    try {
      // Revalidar requeridos contra lo ya subido
      const missing = requirements.filter(
        (r) => r.required && !uploaded.find((u) => u.kind === r.kind)
      );
      if (missing.length) {
        throw new Error(`Aún faltan: ${missing.map((m) => m.label).join(", ")}`);
      }

      const res = await fetch(
        `http://localhost:3000/api/applications/${applicationId}/submit`,
        {
          method: "POST",
          headers: {
            "x-user-id": tecnicoId,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}), // si tu endpoint no requiere body, puedes quitarlo
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "No se pudo enviar la solicitud");

      setMsg("Solicitud enviada al supervisor asignado.");
      onSubmitted?.();
    } catch (e) {
      setMsg(e.message || "Error al enviar la solicitud");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Adjuntar Documentos — Solicitud #{applicationId}</h2>

      <ol style={{ marginTop: 8 }}>
        {requirements.map((r) => {
          const done = uploaded.find((u) => u.kind === r.kind);
          const accept = KIND_ACCEPT[r.kind] || "application/pdf";
          return (
            <li key={r.kind} style={{ marginBottom: 12 }}>
              <div style={{ marginBottom: 4 }}>
                {r.label} {r.required ? <strong>(Requerido)</strong> : <em>(Opcional)</em>}
              </div>

              <input
                type="file"
                accept={accept}
                disabled={!!done}
                onChange={(e) => handleChange(r.kind, e.target.files?.[0])}
              />

              {done && (
                <div style={{ fontSize: 12, marginTop: 4 }}>
                  ✓ ya cargado{done.name ? `: ${done.name}` : ""}
                  {done.url && (
                    <>
                      {" "}
                      — <a href={done.url} target="_blank" rel="noreferrer">ver</a>
                    </>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <div style={{ marginTop: 12 }}>
        <button onClick={uploadAll} disabled={loading}>
          {loading ? "Cargando..." : "Subir adjuntos"}
        </button>
        &nbsp;
        <button onClick={enviarSolicitud} disabled={loading || !uploaded.length}>
          {loading ? "Enviando..." : "Enviar solicitud"}
        </button>
        &nbsp;
        <button onClick={volver} disabled={loading}>Cancelar</button>
      </div>

      {msg && <p style={{ marginTop: 10 }}>{msg}</p>}
    </div>
  );
}
