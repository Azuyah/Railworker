import { Navigate } from 'react-router-dom';
import useUser from '../hooks/useUser';

export default function DashboardRedirect() {
  const { user, loading } = useUser();

  if (loading) return <p>Laddar...</p>;

  if (user?.role === 'HTSM') return <Navigate to="/htsmpanel" replace />;
  if (user?.role === 'TSM') return <Navigate to="/panel" replace />;
  return <Navigate to="/" replace />;
}