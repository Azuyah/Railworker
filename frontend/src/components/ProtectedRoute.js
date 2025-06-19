import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    axios
      .get('https://railworker-production.up.railway.app/api/user', { withCredentials: true })
      .then((res) => {
        if (allowedRoles.includes(res.data.role)) {
          setAuthorized(true);
        } else {
          navigate('/');
        }
      })
      .catch(() => navigate('/login'))
      .finally(() => setChecking(false));
  }, [navigate, allowedRoles]);

  if (checking) return <p>Laddar...</p>;

  return authorized ? children : null;
};

export default ProtectedRoute;