// hooks/useUser.js
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function useUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userInStorage = JSON.parse(localStorage.getItem('user'));
    const token = userInStorage?.token;

    if (!token) {
      setLoading(false);
      return;
    }

    axios
      .get('https://railworker-production.up.railway.app/api/user', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => {
        setUser(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { user, loading };
}