import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

export default function ProtectedRoute({ children, allowedRoles }) {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 Hämtar användarroll från /api/user...');
    axios
      .get('https://railworker-production.up.railway.app/api/user', {
        withCredentials: true,
      })
      .then((res) => {
        console.log('✅ API response från /api/user:', res.data);
        setRole(res.data.role);
      })
      .catch((err) => {
        console.warn('❌ Misslyckades med /api/user:', err);
        setRole(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    console.log('⏳ Väntar på rollinformation...');
    return <p>🔒 Kontrollerar behörighet...</p>;
  }

  console.log('🔐 Kontrollerar roll:', role);
  const isAllowed = allowedRoles.includes(role);

  if (!isAllowed) {
    console.warn('🚫 Åtkomst nekad för roll:', role);
  }

  return isAllowed ? children : <Navigate to="/" replace />;
}