import { Navigate, useLocation } from 'react-router-dom';
import useUser from '../hooks/useUser'; // 👈 se till att denna path stämmer
import LoadingScreen from '../components/LoadingScreen';

export default function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation();
  const { user, loading } = useUser(); // ✅ Använd hooken

  if (loading) return <LoadingScreen />;

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}