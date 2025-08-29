import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Components/Login.js';
import FormData from './Components/Tecnico/FormData.js';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/form-tecnico' element={<FormData />} />
      </Routes>
    </Router>
  );
}

export default App;
