import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Components/Login.js';
import FormData from './Components/Tecnico/FormData.js';
import DashboardAdmin from './Components/Admin/DashboardAdmin.js';
import DashboardSupervisor from './Components/Supervisor/DashboardSupervisor.js';
import DashboardTecnico from './Components/Tecnico/DashboardTecnico.js';
import RequireAuth from './Components/RequireAuth.js';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route element={<RequireAuth/>}>

          //Admin
          <Route path='/admin' element={<DashboardAdmin/>}/>

          //supervisor
          <Route path='/supervisor' element={<DashboardSupervisor />} />

          //Tecnico
          <Route path='/tecnico' element={<DashboardTecnico/>} />
          <Route path='/form-tecnico' element={<FormData />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
