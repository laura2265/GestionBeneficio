import './dashboardAdmin.css';

function DashboardAdmin(){
    return(
        <div className="dashboard-container">
          <header className="dashboard-header">
            <h1 className="dashboard-title">Panel Administrativo</h1>
          </header>

          <div className="dashboard-content">
            <div className="dashboard-card">
              <h2>Usuarios Activos</h2>
              <p>125</p>
            </div>
            <div className="dashboard-card">
              <h2>Beneficios Gestionados</h2>
              <p>87</p>
            </div>
            <div className="dashboard-card">
              <h2>Solicitudes Pendientes</h2>
              <p>14</p>
            </div>
          </div>
        </div>
    )
}

export default DashboardAdmin;

