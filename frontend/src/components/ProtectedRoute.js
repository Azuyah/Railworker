import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen';
import axios from 'axios';

export default function ProtectedRoute({ children, allowedRoles }) {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    console.log('🔄 Hämtar användarroll från /api/user...');
    axios
      .get('https://railworker-production.up.railway.app/api/user', { withCredentials: true })
      .then((res) => {
        console.log('✅ API response:', res.data);
        setRole(res.data.role);
        setLoading(false);
      })
      .catch((err) => {
        console.warn('❌ Kunde inte hämta användare:', err);
        setRole(null);
        setLoading(false);
      });
  }, []);

if (loading) return <LoadingScreen />;

  // 👇 Om vi är på "/dashboard" så redirectar vi direkt baserat på roll
  if (location.pathname === '/dashboard') {
    if (role === 'HTSM') return <Navigate to="/htsmpanel" replace />;
    if (role === 'TSM') return <Navigate to="/panel" replace />;
    return <Navigate to="/" replace />;
  }

  // 👇 Annars, kolla om användaren har behörighet till denna route
  return allowedRoles.includes(role)
    ? children
    : <Navigate to="/" replace />;
}