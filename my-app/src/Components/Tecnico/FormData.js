import { useState } from "react";
import "./tecnico.css";

function FormData({ volver, onDraftSaved }) {
  const [form, setForm] = useState({
    nombres: "", apellidos: "", tipo_documento: "CC", numero_documento: "",
    direccion: "", barrio: "", correo: "", numero_contacto: "",
    estrato_id: 2, declaracion_juramentada: false,
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSaveDraft = async (e) => {
    e.preventDefault();
    setMsg(""); setLoading(true);
    try {
      const auth = JSON.parse(localStorage.getItem("auth") || "{}");
      const tecnicoId = Number(auth?.userId);
      if (!Number.isInteger(tecnicoId)) {
        throw new Error("Sesión expirada o ID inválido. Inicia sesión de nuevo.");
      }

      const res = await fetch('http://localhost:3000/api/applications', {
        method: 'POST',
        headers: {
          'x-user-id': tecnicoId,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...form, tecnico_id: tecnicoId})
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "No se pudo guardar el borrador");
      setMsg(`Borrador #${data.id} guardado. Continuemos con los adjuntos.`);
      onDraftSaved?.(data.id); 
    } catch (err) {
      setMsg(err.message || "Error inesperado");
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSaveDraft}>
      <h2>Datos del solicitante</h2>

      {/* Izquierda */}
      <div className="ContainerForm">
        <div className="Container1">
          <div className="inputContainer">
            <label>Nombres Completos</label>
            <input name="nombres" value={form.nombres} onChange={handleChange} required />
          </div>

          <div className="inputContainer">
            <label>Apellidos Completos</label>
            <input name="apellidos" value={form.apellidos} onChange={handleChange} required />
          </div>

          <div className="inputContainer">
            <label>Tipo de Documento</label>
            <select name="tipo_documento" value={form.tipo_documento} onChange={handleChange} required>
              <option value="CC">Cédula de Ciudadanía</option>
              <option value="CE">Cédula Extranjera</option>
              <option value="PA">Pasaporte</option>
            </select>
          </div>

          <div className="inputContainer">
            <label>Número de Documento</label>
            <input name="numero_documento" value={form.numero_documento} onChange={handleChange} required />
          </div>
          <div className="inputContainer">
            <label>Dirección</label>
            <input name="direccion" value={form.direccion} onChange={handleChange} required />
          </div>

        </div>

        {/* Derecha */}
        <div className="Container2">
          <div className="inputContainer">
            <label>Barrio</label>
            <input name="barrio" value={form.barrio} onChange={handleChange} />
          </div>
          <div className="inputContainer">
            <label>Correo</label>
            <input type="email" name="correo" value={form.correo} onChange={handleChange} required />
          </div>

          <div className="inputContainer">
            <label>Teléfono</label>
            <input name="numero_contacto" value={form.numero_contacto} onChange={handleChange} required />
          </div>

          <div className="inputContainer">
            <label>Estrato</label>
            <select name="estrato_id" value={form.estrato_id} onChange={handleChange} required>
              {[1,2,3,4,5,6].map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>

          <div className="inputContainer">
            <label>
              <input type="checkbox" name="declaracion_juramentada"
                     checked={form.declaracion_juramentada} onChange={handleChange}/>
              &nbsp; Declaración juramentada
            </label>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <button type="submit" disabled={loading}>{loading ? "Guardando..." : "SIGUIENTE"}</button>
        &nbsp;
        <button type="button" onClick={() => volver?.()}>Cancelar</button>
      </div>

      {msg && <p style={{ marginTop: 10 }}>{msg}</p>}
    </form>
  );
}
export default FormData;
