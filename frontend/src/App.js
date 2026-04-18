import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import HtsmLogin from './pages/HtsmLogin';
import Register from './pages/Register';
import Panel from './pages/Panel';
import HtsmPanel from './pages/HtsmPanel';
import SkapaProjekt from './pages/SkapaProjekt';
import ProjektVisa from './pages/ProjektVisa';
import Plan from './pages/plan';
import Profil from './pages/profil';
import Preview from "./pages/preview";
import LogoPreview from './pages/LogoPreview';
import DispLogoPreview from './pages/DispLogoPreview';
import DispFrontPreview from './pages/DispFrontPreview';

function AppRoutes() {
  const location = useLocation();

  // Kontrollera om användaren redan är inloggad

  return (
    <Routes location={location}>
      <Route path="/" element={<Login />} />
      <Route path="/htsm-login" element={<HtsmLogin />} />
      <Route path="/register" element={<Register />} />

      <Route path="/panel" element={<Panel />} />
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
<Route path="/logo-preview" element={<LogoPreview />} />
<Route path="/disp-logo-preview" element={<DispLogoPreview />} />
<Route path="/disp-front-preview" element={<DispFrontPreview />} />
    </Routes>
  );
}

function RoleBasedPlan() {
  let storedUser = null;
  try {
    storedUser = JSON.parse(localStorage.getItem('user') || 'null');
  } catch (error) {
    storedUser = null;
  }

  const role = storedUser?.role || null;
  if (!role) return null;

  return role === 'TSM' ? <Navigate to="/panel" replace /> : <Plan />;
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
