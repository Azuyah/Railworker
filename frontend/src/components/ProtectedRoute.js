import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen';
import axios from 'axios';

export default function ProtectedRoute({ children, allowedRoles }) {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false); // ✅ viktigt
  const location = useLocation();

useEffect(() => {
  let isMounted = true; // 👈 skyddar mot onödiga anrop vid re-renders

  const user = JSON.parse(localStorage.getItem('user'));
  const token = user?.token;

  if (!token) {
    if (isMounted) {
      setRole(null);
      setLoading(false);
    }
    return;
  }

  axios.get('https://railworker-production.up.railway.app/api/user', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
.then((res) => {
  if (isMounted) {
    console.log('✅ API response:', res.data);
    setRole(res.data.role);
    setLoading(false);
    setIsReady(true); // ✅ Lägg till detta
  }
})
.catch((err) => {
  if (isMounted) {
    console.warn('❌ Kunde inte hämta användare:', err);
    localStorage.removeItem('user');
    setRole(null);
    setLoading(false);
    setIsReady(true); // ✅ Lägg till detta även här
  }
});

  return () => {
    isMounted = false;
  };
}, []); // 👈 mycket viktigt – se till att dependency arrayen är tom

  if (!isReady || loading) return <LoadingScreen />;
  // 👇 Annars, kolla om användaren har behörighet till denna route
  return allowedRoles.includes(role)
    ? children
    : <Navigate to="/" replace />;
}