import { Navigate, useLocation } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen';

export default function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation();

  let storedUser = null;
  try {
    storedUser = JSON.parse(localStorage.getItem('user') || 'null');
  } catch (error) {
    storedUser = null;
  }

  const token = storedUser?.token || localStorage.getItem('token');
  const role = storedUser?.role || null;

  if (token && !role) {
    return <LoadingScreen />;
  }

  if (!token || !role) {
    return <Navigate to="/" replace />;
  }

  if (location.pathname === '/dashboard') {
    if (role === 'HTSM') return <Navigate to="/htsmpanel" replace />;
    if (role === 'TSM') return <Navigate to="/panel" replace />;
    return <Navigate to="/" replace />;
  }

  return allowedRoles.includes(role)
    ? children
    : <Navigate to="/" replace />;
}
