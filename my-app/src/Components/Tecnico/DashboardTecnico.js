import { useState } from 'react';
import './tecnico.css'
import FormData from './FormData';

function DashboardTecnico(){
   const [borradores, setBorradores] = useState([
    { id: 1, nombre: "Cambio de Router", fecha: "2025-08-28" },
    { id: 2, nombre: "Revisión de Red", fecha: "2025-08-29" },
  ]);

  const [modo, setModo] = useState("panel"); // "panel" o "formulario"
  const [borradorEditando, setBorradorEditando] = useState(null);

  const nuevaSolicitud = () => {
    setBorradorEditando(null);
    setModo("formulario");
  };

  const editarBorrador = (borrador) => {
    setBorradorEditando(borrador);
    setModo("formulario");
  };

  return (
    <div className="tecnico-container">
      {modo === "panel" ? (
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
                    <button
                      className="btn-editar"
                      onClick={() => editarBorrador(item)}
                    >
                      Editar
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No hay borradores guardados.</p>
            )}
          </div>
        </>
      ) : (
        <FormData borrador={borradorEditando} volver={() => setModo("panel")} />
      )}
    </div>
  );
}

export default DashboardTecnico;