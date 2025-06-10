import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Panel from './pages/Panel';
import HtsmPanel from './pages/HtsmPanel';
import SkapaProjekt from './pages/SkapaProjekt';
import ProjektVisa from './pages/ProjektVisa';
import Plan from './pages/plan';
import PlanTSM from './pages/PlanTSM';
import Profil from './pages/profil';

function AppRoutes() {
  const location = useLocation();

  const storedUser = localStorage.getItem('user');
  const role = storedUser ? JSON.parse(storedUser).role : null;

  return (
    <Routes location={location}>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/panel" element={<Panel />} />
      <Route path="/htsmpanel" element={<HtsmPanel />} />
      <Route path="/skapa-projekt" element={<SkapaProjekt />} />
      <Route path="/projekt/:id" element={<ProjektVisa />} />
      <Route path="/profil" element={<Profil />} />

      {/* Här styr vi mellan Plan och PlanTSM baserat på rollen */}
      <Route
        path="/plan"
        element={role === 'TSM' ? <PlanTSM /> : <Plan />}
      />

      {/* Dashboard redirect */}
      <Route
        path="/dashboard"
        element={
          role === 'HTSM' ? (
            <Navigate to="/htsmpanel" replace />
          ) : role === 'TSM' ? (
            <Navigate to="/panel" replace />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}