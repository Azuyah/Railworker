import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

export default function ProtectedRoute({ children, allowedRoles }) {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('https://railworker-production.up.railway.app/api/user', { withCredentials: true })
      .then((res) => {
        setRole(res.data.role);
        setLoading(false);
      })
      .catch(() => {
        setRole(null);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>🔒 Kontrollerar behörighet...</p>;

  return allowedRoles.includes(role) ? children : <Navigate to="/" replace />;
}