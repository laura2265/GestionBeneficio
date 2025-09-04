// UploadDocs.jsx
import { useMemo, useState } from "react";

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

const API_BASE = import.meta?.env?.VITE_API_BASE || "http://localhost:3000";

export default function UploadDocs({ applicationId, onSubmitted, volver }) {
  const [selected, setSelected] = useState({}); // { kind: File }
  const [uploadedKinds, setUploadedKinds] = useState(new Set()); // para marcar cuáles ya están
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // usuario (cabecera x-user-id)
  const auth = JSON.parse(localStorage.getItem("auth") || "{}");
  const tecnicoId = Number(auth?.userId || auth?.id || 0);

  const requiredKinds = useMemo(
    () => FIXED_REQUIREMENTS.filter((r) => r.required).map((r) => r.kind),
    []
  );

  const allKinds = useMemo(() => FIXED_REQUIREMENTS.map((r) => r.kind), []);

  const handleChange = (kind, file) => {
    setSelected((s) => ({ ...s, [kind]: file }));
  };

  /** Subir un archivo. Si autoSubmit=true, el backend hará submit tras guardar */
  const uploadOne = async (kind, file, { autoSubmit = false } = {}) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("kind", kind);
    fd.append("file_name", file?.name || `${kind}.dat`);
    if (autoSubmit) fd.append("auto_submit", "true");

    const res = await fetch(`${API_BASE}/api/applications/${applicationId}/files`, {
      method: "POST",
      headers: { "x-user-id": String(tecnicoId) },
      body: fd,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || `No se pudo subir ${kind}`);
    // Marcamos como cargado
    setUploadedKinds((prev) => new Set(prev).add(kind));
    return data;
  };

  /** Sube lo seleccionado sin enviar */
  const uploadAll = async () => {
    setMsg("");
    setLoading(true);
    try {
      // Validar que al menos uno
      const toUpload = Object.entries(selected).filter(([, f]) => !!f);
      if (!toUpload.length) throw new Error("Selecciona al menos un archivo");

      for (const [kind, file] of toUpload) {
        await uploadOne(kind, file);
      }
      setSelected({});
      setMsg("Adjuntos cargados correctamente.");
    } catch (e) {
      setMsg(e.message || "Error al subir adjuntos");
    } finally {
      setLoading(false);
    }
  };

  /** Subir lo necesario y ENVIAR */
  const submitApp = async () => {
    const res = await fetch(`${API_BASE}/api/applications/${applicationId}/submit`, {
      method: "POST",
      headers: { "x-user-id": String(tecnicoId), "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "No se pudo enviar la solicitud");
    return data;
  };

  const uploadAndSubmit = async () => {
    setMsg("");
    setLoading(true);
    try {
      // ¿Cuáles requeridos faltan si consideramos lo ya subido + lo seleccionado?
      const missingNow = requiredKinds.filter(
        (rk) => !uploadedKinds.has(rk) && !selected[rk]
      );
      if (missingNow.length) {
        const labels = FIXED_REQUIREMENTS.filter((r) => missingNow.includes(r.kind))
          .map((r) => r.label)
          .join(", ");
        throw new Error(`Faltan requeridos: ${labels}`);
      }

      // Si ya estaban todos cargados y no seleccionaste nada ahora → sólo enviar
      const selectedEntries = Object.entries(selected).filter(([, f]) => !!f);
      if (!selectedEntries.length) {
        await submitApp();
        setMsg("Solicitud enviada correctamente.");
        onSubmitted?.();
        return;
      }

      for (const [kind, file] of selectedEntries) {
        await uploadOne(kind, file);
      }

      await submitApp();

      setSelected({});
      setMsg("Documentos subidos y solicitud enviada.");
      onSubmitted?.();
    } catch (e) {
      setMsg(e.message || "Error al subir/enviar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl">
      <h2 className="text-xl font-semibold">Adjuntar Documentos — Solicitud #{applicationId}</h2>

      <ol className="mt-3 space-y-3">
        {FIXED_REQUIREMENTS.map((r) => {
          const done = uploadedKinds.has(r.kind);
          const accept = KIND_ACCEPT[r.kind] || "application/pdf";
          return (
            <li key={r.kind} className="border rounded-xl p-3">
              <div className="mb-2">
                <span className="font-medium">{r.label}</span>{" "}
                {r.required ? (
                  <strong className="text-red-600">(Requerido)</strong>
                ) : (
                  <em className="text-gray-500">(Opcional)</em>
                )}
              </div>

              <input
                type="file"
                accept={accept}
                disabled={done}
                onChange={(e) => handleChange(r.kind, e.target.files?.[0])}
              />

              {done && (
                <div className="text-sm text-green-700 mt-2">✓ Ya cargado</div>
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-4 space-x-2">
        <button
          onClick={uploadAndSubmit}
          disabled={loading}
          className="px-3 py-2 rounded-xl shadow bg-blue-600 text-white"
        >
          {loading ? "Procesando..." : "Subir y enviar ahora"}
        </button>

        <button
          onClick={volver}
          disabled={loading}
          className="px-3 py-2 rounded-xl shadow bg-gray-200"
        >
          Cancelar
        </button>
      </div>

      {msg && <p className="mt-3 text-sm">{msg}</p>}

      <p className="mt-6 text-xs text-gray-500">
        * Marcamos como "ya cargado" al subir en esta sesión. Si necesitas listar lo ya
        existente desde el backend, puedo agregar un fetch para traer el estado real.
      </p>
    </div>
  );
}
