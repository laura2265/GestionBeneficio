import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Components/Login.js';
import FormData from './Components/Tecnico/FormData.js';
import DashboardAdmin from './Components/Admin/DashboardAdmin.js';
import DashboardSupervisor from './Components/Supervisor/DashboardSupervisor.js';
import DashboardTecnico from './Components/Tecnico/DashboardTecnico.js';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Login />} />

        //Admin
        <Route path='/admin' element={<DashboardAdmin/>}/>

        //supervisor
        <Route path='/supervisor' element={<DashboardSupervisor />} />

        //Tecnico
        <Route path='/tecnico' element={<DashboardTecnico/>} />

        <Route path='/form-tecnico' element={<FormData />} />
      </Routes>
    </Router>
  );
}

export default App;
