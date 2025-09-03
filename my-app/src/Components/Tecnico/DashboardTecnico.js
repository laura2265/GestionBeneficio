// DashboardTecnico.js
import { useState } from 'react';
import './tecnico.css';
import FormData from './FormData';
import UploadDocs from './UploadDocs'; // ⬅️ importa el componente

function DashboardTecnico() {
  const [borradores, setBorradores] = useState([
    { id: 1, nombre: "Cambio de Router", fecha: "2025-08-28" },
    { id: 2, nombre: "Revisión de Red", fecha: "2025-08-29" },
  ]);

  // "panel" | "formulario" | "adjuntos"
  const [modo, setModo] = useState("panel");
  const [borradorEditando, setBorradorEditando] = useState(null);
  const [draftId, setDraftId] = useState(null); // ⬅️ aquí guardamos el id del borrador

  const nuevaSolicitud = () => {
    setBorradorEditando(null);
    setDraftId(null);
    setModo("formulario");
  };

  const editarBorrador = (borrador) => {
    setBorradorEditando(borrador);
    setDraftId(borrador.id);
    setModo("adjuntos"); // ir directo a adjuntos si ya existe
  };

  // ⬅️ recibe el id del borrador desde FormData y cambia a adjuntos
  const handleDraftSaved = (id) => {
    setDraftId(id);
    setModo("adjuntos");
  };

  return (
    <div className="tecnico-container">
      {modo === "panel" && (
        <>
          <header className="tecnico-header">
            <h1>Panel del Técnico</h1>
            <button className="btn-nueva" onClick={nuevaSolicitud}>
              Nueva Solicitud
            </button>
          </header>

          <div className="borradores">
            <h2>Solicitudes en Borrador</h2>
            {borradores.length > 0 ? (
              <ul>
                {borradores.map((item) => (
                  <li key={item.id}>
                    <div>
                      <strong>{item.nombre}</strong> - {item.fecha}
                    </div>
                    <button className="btn-editar" onClick={() => editarBorrador(item)}>
                      Continuar
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No hay borradores guardados.</p>
            )}
          </div>
        </>
      )}

      {modo === "formulario" && (
        <FormData
          borrador={borradorEditando}
          volver={() => setModo("panel")}
          onDraftSaved={handleDraftSaved}  // ⬅️ al guardar, pasas a UploadDocs
        />
      )}

      {modo === "adjuntos" && draftId && (
        <UploadDocs
          applicationId={draftId}
          volver={() => setModo("panel")}
          onSubmitted={() => { setDraftId(null); setModo("panel"); }}
        />
      )}
    </div>
  );
}

export default DashboardTecnico;
