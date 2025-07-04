import { useEffect, useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Panel from './pages/Panel';
import HtsmPanel from './pages/HtsmPanel';
import SkapaProjekt from './pages/SkapaProjekt';
import ProjektVisa from './pages/ProjektVisa';
import Plan from './pages/plan';
import PlanTSM from './pages/PlanTSM';
import Profil from './pages/profil';
import Preview from "./pages/preview";

function AppRoutes() {
  const location = useLocation();

  // Kontrollera om användaren redan är inloggad
const user = JSON.parse(localStorage.getItem('user'));
const token = user?.token;

  return (
    <Routes location={location}>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Skyddade routes - inlogg krävs */}
      <Route
        path="/panel"
        element={
          <ProtectedRoute allowedRoles={['TSM']}>
            <Panel />
          </ProtectedRoute>
        }
      />
      <Route
        path="/htsmpanel"
        element={
          <ProtectedRoute allowedRoles={['HTSM']}>
            <HtsmPanel />
          </ProtectedRoute>
        }
      />
      <Route
        path="/skapa-projekt"
        element={
          <ProtectedRoute allowedRoles={['HTSM']}>
            <SkapaProjekt />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projekt/:id"
        element={
          <ProtectedRoute allowedRoles={['HTSM', 'TSM']}>
            <ProjektVisa />
          </ProtectedRoute>
        }
      />
      <Route
        path="/plan/:id"
        element={
          <ProtectedRoute allowedRoles={['HTSM', 'TSM']}>
            {/* Inuti Plan visar vi rätt komponent baserat på roll */}
            <RoleBasedPlan />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profil"
        element={
          <ProtectedRoute allowedRoles={['HTSM', 'TSM']}>
            <Profil />
          </ProtectedRoute>
        }
      />
<Route
  path="/dashboard"
  element={
    <ProtectedRoute allowedRoles={['HTSM', 'TSM']}>
    </ProtectedRoute>
  }
/>
<Route path="/preview" element={<Preview />} />
    </Routes>
  );
}

function RoleBasedPlan() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setRole('');
      return;
    }

    axios
      .get('https://railworker-production.up.railway.app/api/user', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setRole(res.data.role))
      .catch(() => setRole(''));
  }, []);

  if (!role) return null;

  return role === 'TSM' ? <PlanTSM /> : <Plan />;
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}