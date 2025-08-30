import './supervisor.css';
import Check from '../../assets/img/aprobado.png';
import XCheck from '../../assets/img/marca.png';
import Solcitud from '../../assets/img/solicitud.png';

function DashboardSupervisor() {
  return (
    <div className="content-dashSuper">
      <h2>Dashboard Supervisor</h2>
      <div className="contentCards">
        <div className="card">
          <img src={Check} alt="Aprobado" />
          <h3>Aprobadas</h3>
          <p>Consulta todas las solicitudes aprobadas recientemente.</p>
          <button className="btn-card">Ingresar</button>
        </div>
        <div className="card">
          <img src={XCheck} alt="Rechazadas" />
          <h3>Rechazadas</h3>
          <p>Revisa las solicitudes que han sido rechazadas.</p>
          <button className="btn-card">Ingresar</button>
        </div>
        <div className="card">
          <img src={Solcitud} alt="Solicitudes" />
          <h3>Solicitudes</h3>
          <p>Visualiza todas las solicitudes pendientes.</p>
          <button className="btn-card">Ingresar</button>
        </div>
      </div>
    </div>

  );
}

export default DashboardSupervisor;
