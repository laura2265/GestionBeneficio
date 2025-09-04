// FormData.jsx (editar/crear + ir a adjuntos)
import { useEffect, useMemo, useState } from "react";
import './tecnico.css'
const API_BASE = import.meta?.env?.VITE_API_BASE || "http://localhost:3000";

export default function FormData({ borrador, volver, onDraftSaved }) {
  const auth = useMemo(() => JSON.parse(localStorage.getItem("auth") || "{}"), []);
  const tecnicoId = Number(auth?.userId || auth?.id || 0);

  const [id, setId] = useState(borrador?.id || null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    tipo_documento: "CC",
    numero_documento: "",
    direccion: "",
    barrio: "",
    correo: "",
    numero_contacto: "",
    estrato_id: 2,
    declaracion_juramentada: false,
  });

  // Si venimos a EDITAR, traer la app completa
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!borrador?.id) return;
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/applications/${borrador.id}`, {
          headers: { "x-user-id": String(tecnicoId) },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || "No se pudo cargar la solicitud");

        if (!cancelled) {
          setId(Number(data.id || borrador.id));
          setForm((f) => ({
            ...f,
            nombres: data.nombres ?? f.nombres,
            apellidos: data.apellidos ?? f.apellidos,
            tipo_documento: data.tipo_documento ?? f.tipo_documento,
            numero_documento: data.numero_documento ?? f.numero_documento,
            direccion: data.direccion ?? f.direccion,
            barrio: data.barrio ?? f.barrio,
            correo: data.correo ?? f.correo,
            numero_contacto: data.numero_contacto ?? f.numero_contacto,
            estrato_id: data.estrato_id ?? f.estrato_id,
            declaracion_juramentada: Boolean(data.declaracion_juramentada ?? f.declaracion_juramentada),
          }));
        }
      } catch (e) {
        setMsg(e.message || "Error cargando datos");
      } finally {
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [borrador?.id, tecnicoId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const saveDraft = async (goToAttachments = true) => {
    setMsg(""); setLoading(true);
    try {
      const body = { ...form, tecnico_id: tecnicoId };
      let res, data;
      if (id) {
        // UPDATE
        res = await fetch(`${API_BASE}/api/applications/${id}`, {
          method: "PUT",
          headers: { "x-user-id": String(tecnicoId), "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        // CREATE
        res = await fetch(`${API_BASE}/api/applications`, {
          method: "POST",
          headers: { "x-user-id": String(tecnicoId), "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }
      data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "No se pudo guardar");

      const newId = Number(data.id || id);
      setId(newId);
      setMsg(`Borrador #${newId} guardado.`);
      if (goToAttachments) onDraftSaved?.(newId);
    } catch (e) {
      setMsg(e.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    await saveDraft(true);
  };

  return (
    <form onSubmit={onSubmit} className="p-4 max-w-3xl">
      <h2 className="text-xl font-semibold mb-2">
        {id ? `Editar solicitud #${id}` : "Datos del solicitante"}
      </h2>

      
      <div className="ContainerForm">
        <div className="Container1">
          <div className="inputContainer">
            <label className="block text-sm">Nombres</label>
            <input name="nombres" value={form.nombres} onChange={handleChange} required className="w-full border rounded p-2"/>
          </div>

          <div className="inputContainer">
            <label className="block text-sm">Apellidos</label>
            <input name="apellidos" value={form.apellidos} onChange={handleChange} required className="w-full border rounded p-2"/>
          </div>
          <div className="inputContainer">
            <label className="block text-sm">Tipo de documento</label>
            <select name="tipo_documento" value={form.tipo_documento} onChange={handleChange} required className="w-full border rounded p-2">
              <option value="CC">Cédula</option>
              <option value="CE">Cédula Extranjera</option>
              <option value="PA">Pasaporte</option>
            </select>
          </div>
          <div className="inputContainer">
            <label className="block text-sm">Número de documento</label>
            <input name="numero_documento" value={form.numero_documento} onChange={handleChange} required className="w-full border rounded p-2"/>
          </div>
          <div className="inputContainer">
            <label className="block text-sm">Dirección</label>
            <input name="direccion" value={form.direccion} onChange={handleChange} required className="w-full border rounded p-2"/>
          </div>
        
        </div>

        <div className="Container2">
          <div className="inputContainer">
          <label className="block text-sm">Barrio</label>
          <input name="barrio" value={form.barrio} onChange={handleChange} className="w-full border rounded p-2"/>
        </div>
        <div className="inputContainer">
          <label className="block text-sm">Correo</label>
          <input type="email" name="correo" value={form.correo} onChange={handleChange} required className="w-full border rounded p-2"/>
        </div>
        <div className="inputContainer">
          <label className="block text-sm">Teléfono</label>
          <input name="numero_contacto" value={form.numero_contacto} onChange={handleChange} required className="w-full border rounded p-2"/>
        </div>
        <div className="inputContainer">
          <label className="block text-sm">Estrato</label>
          <select name="estrato_id" value={form.estrato_id} onChange={handleChange} required className="w-full border rounded p-2">
            {[1,2,3,4,5,6].map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="dj">Declaración juramentada</label>
          <input type="checkbox" id="dj" name="declaracion_juramentada" checked={form.declaracion_juramentada} onChange={handleChange}/>
        </div>
        </div>
        
      </div>

      <div className=""></div>
      <div className="mt-4 space-x-2">
        <button type="submit" disabled={loading} className="px-3 py-2 rounded bg-blue-600 text-white">
          {loading ? "Guardando..." : id ? "Guardar y adjuntar" : "Siguiente (adjuntar)"}
        </button>
        <button type="button" disabled={loading} onClick={() => saveDraft(false)} className="px-3 py-2 rounded bg-gray-900 text-white">
          {loading ? "Guardando..." : "Guardar"}
        </button>
        <button type="button" disabled={loading} onClick={volver} className="px-3 py-2 rounded bg-gray-200">
          Cancelar
        </button>
      </div>

      {msg && <p className="mt-3 text-sm">{msg}</p>}
    </form>
  );
}
