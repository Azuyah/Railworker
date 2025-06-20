import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DashboardRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const role = user?.role;

    if (role === 'HTSM') navigate('/htsmpanel');
    else if (role === 'TSM') navigate('/panel');
    else navigate('/');
  }, []);

  return null; // Inget UI behövs, den bara redirectar
}