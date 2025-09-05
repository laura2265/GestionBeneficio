import { useEffect, useMemo, useState } from 'react';
import './dashboardAdmin.css';

const NORMALIZE = (v) => (v || '').toString().trim().toUpperCase();
const ESTADOS = ['BORRADOR', 'ENVIADA', 'APROBADA', 'RECHAZADA'];

function DashboardAdmin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [appsByUser, setAppsByUser] = useState({});
  const [applications, setApplications] = useState([]);
  const [activityHistory, setActivityHistory] = useState([]);

  const fetchUsers = async () => {
    const res = await fetch('http://localhost:3000/api/users');
    if (!res.ok) throw new Error('Error al consultar usuarios');
    const json = await res.json();
    // si tu API ya devuelve array directo, usa json; si es {items:[]}, usa json.items
    return Array.isArray(json) ? json : (json.items || []);
  };

  const fetchAppsForUser = async (idUser) => {
    const res = await fetch('http://localhost:3000/api/applications', {
      method: 'GET',
      headers: {
        'x-user-id': idUser,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) throw new Error(`Error al consultar aplicaciones del usuario ${idUser}`);
    const json = await res.json();
    return Array.isArray(json) ? json : (json.items || []);
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError('');

        const list = await fetchUsers();
        if (!alive) return;
        setUsers(list);

        const entries = await Promise.all(
          list.map(async (u) => {
            const apps = await fetchAppsForUser(u.id);
            return [u.id, apps];
          })
        );

        if (!alive) return;
        setAppsByUser(Object.fromEntries(entries));
      } catch (e) {
        setError(e.message || 'Error cargando datos');
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, []);

  const globalStats = useMemo(() => {
    const counts = { BORRADOR: 0, ENVIADA: 0, APROBADA: 0, RECHAZADA: 0 };
    Object.values(appsByUser).forEach((apps) => {
      apps.forEach((a) => {
        const st = NORMALIZE(a.estado || a.status);
        if (counts[st] !== undefined) counts[st]++;
      });
    });
    const totalApps = Object.values(counts).reduce((s, n) => s + n, 0);
    return { ...counts, totalApps };
  }, [appsByUser]);

  const perUserRows = useMemo(() => {
    return users.map((u) => {
      const apps = appsByUser[u.id] || [];
      const row = { user: u, total: apps.length, BORRADOR: 0, ENVIADA: 0, APROBADA: 0, RECHAZADA: 0 };
      apps.forEach((a) => {
        const st = NORMALIZE(a.estado || a.status);
        if (row[st] !== undefined) row[st]++;
      });
      return row;
    });
  }, [users, appsByUser]);

  return (
  <div className="dashboard-container">
    <header className="dashboard-header">
      <h1 className="dashboard-title">Panel Administrativo</h1>
      <div className="header-actions">
        <button className="btn secondary">Exportar</button>
        <button className="btn">Nuevo</button>
      </div>
    </header>

    {/* GRID PRINCIPAL */}
    <div className="main-grid">
      <div>
        {/* KPIs */}
        <div className="kpi-row">
          <div className="kpi-card">
            <div className="kpi-dot orange">$</div>
            <div>
              <div className="kpi-meta">Usuarios</div>
              <div className="kpi-value">{users.length}</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-dot teal">📄</div>
            <div>
              <div className="kpi-meta">Solicitudes Totales</div>
              <div className="kpi-value">{globalStats.totalApps}</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-dot pink">✔</div>
            <div>
              <div className="kpi-meta">Aprobadas</div>
              <div className="kpi-value">{globalStats.APROBADA}</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-dot cyan">↻</div>
            <div>
              <div className="kpi-meta">Rechazadas</div>
              <div className="kpi-value">{globalStats.RECHAZADA}</div>
            </div>
          </div>
        </div>

        <div className="left-grid" style={{ marginTop: 18 }}>
          <div className="section">
            <h3 className="section-title">Solicitudes por estado</h3>
            <div className="chart-placeholder">[Gráfico de barras]</div>
          </div>

          <div className="section">
            <h3 className="section-title">Tareas por día</h3>
            <div className="chart-placeholder">[Gráfico de líneas]</div>
          </div>

          <div className="section" style={{ gridColumn: '1 / -1' }}>
            <h3 className="section-title">Últimas solicitudes</h3>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th><th>Solicitante</th><th>Estado</th><th>Creada</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.slice(0,10).map((a) => (
                    <tr key={a.id}>
                      <td>{a.id}</td>
                      <td>{a.nombres ? `${a.nombres} ${a.apellidos??''}` : (a.full_name||'-')}</td>
                      <td>
                        <span className={
                          'badge ' + (
                            (a.estado||a.status||'').toLowerCase()
                              .replace('aprobada','aprobada')
                              .replace('rechazada','rechazada')
                              .replace('enviada','enviada')
                              .replace('borrador','borrador')
                          )
                        }>
                          {(a.estado||a.status||'-')}
                        </span>
                      </td>
                      <td>{new Date(a.created_at||a.enviada_at||Date.now()).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="side-stack">
        <div className="section">
          <h3 className="section-title">Riesgo del proyecto</h3>
          <div className="chart-placeholder">[Gauge / donut]</div>
          <p className="muted" style={{ marginTop: 8 }}>Balanceado</p>
        </div>

        <div className="section">
          <h3 className="section-title">Actividad reciente</h3>
          {(activityHistory || []).slice(0, 5).map((h, i) => (
            <div className="activity-item" key={i}>
              <div className="avatar">
                {(h.user?.full_name || 'U').slice(0, 1)}
              </div>
              <div>
                <div>
                  <strong>{h.user?.full_name || 'Usuario'}</strong>{" "}
                  {h.action || 'actualizó una solicitud'}
                </div>
                <div className="activity-meta">
                  {new Date(h.created_at || Date.now()).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="section">
          <h3 className="section-title">Información</h3>
          <div className="muted">Email: admin@demo.com<br/>Tel: 000-000-000</div>
        </div>
      </div>
    </div>
    {loading && <div className="loading-overlay">Cargando…</div>}
  </div>
);

}

export default DashboardAdmin;
