import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen';
import axios from 'axios';

export default function ProtectedRoute({ children, allowedRoles }) {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    const token = localStorage.getItem('token');
    if (!token) {
      setRole(null);
      setLoading(false);
      return;
    }

    axios.get('https://railworker-production.up.railway.app/api/user', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (isMounted) {
          setRole(res.data.role);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.warn('❌ Kunde inte hämta användare:', err);
          localStorage.removeItem('token');
          setRole(null);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) return <LoadingScreen />;

  // Hantera redirect från "/dashboard"
  if (location.pathname === '/dashboard') {
    if (role === 'HTSM') return <Navigate to="/htsmpanel" replace />;
    if (role === 'TSM') return <Navigate to="/panel" replace />;
    return <Navigate to="/" replace />;
  }

  // Hantera tillgång till skyddad route
  return allowedRoles.includes(role)
    ? children
    : <Navigate to="/" replace />;
}